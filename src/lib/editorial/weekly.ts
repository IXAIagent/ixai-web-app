import { weeklyBriefs, type WeeklyBrief } from "@/content/weekly-briefs";
import { getDraftsAsync } from "@/src/lib/editorial/repository";
import { getSupabaseRestConfig } from "@/src/lib/supabase/server";
import { getLatestNewsIntakeResult } from "@/src/lib/news/providers";
import {
  SECTION_LABELS,
  categorizeWeeklyHeadlines,
  type CategorizationResult,
  type WeeklySectionKey,
} from "@/src/lib/editorial/weekly-categorize";
import {
  getNextWeekRange,
  selectUpcomingEarnings,
  selectUpcomingEvents,
  selectUpcomingFedMacro,
  selectUpcomingTaiwanEvents,
  type UpcomingEvent,
} from "@/src/lib/editorial/weekly-calendar";
import {
  buildNarrativeBundle,
  type NarrativeBundle,
} from "@/src/lib/intelligence/narrative-engine";
import { buildWeeklyAggregationFromDailyCores } from "@/src/lib/intelligence/core";
import type {
  WeeklyDailyCoreAggregation,
  WeeklyDraftGenerationSummary,
  WeeklyIntelligenceAiSuggestion,
  WeeklyIntelligenceDraft,
  WeeklyIntelligenceSections,
  WeeklyIntelligenceStatus,
  WeeklyPastWeekHighlights,
  WeeklyPastWeekItem,
  WeeklySourceUsed,
  WeeklyUpcomingEvent,
} from "@/src/types/editorial";
import type { NewsIntakeResult, NormalizedNewsItem } from "@/src/types/news";

const WEEKLY_TABLE = "ixai_weekly_intelligence_drafts";
const SUPABASE_TIMEOUT_MS = 6000;

let serverWeeklyDrafts: WeeklyIntelligenceDraft[] = [];
let lastWeeklyGenerationSummary: WeeklyDraftGenerationSummary | null = null;

type WeeklyPersistenceRecord = {
  id: string;
  slug: string;
  title: string;
  status: WeeklyIntelligenceStatus;
  week_start: string;
  week_end: string;
  publish_date?: string | null;
  generated_at?: string | null;
  updated_at: string;
  published_at?: string | null;
  source_mode?: string | null;
  summary?: string | null;
  sections: WeeklyIntelligenceSections;
  ai_suggestion: WeeklyIntelligenceAiSuggestion;
  editorial_notes?: string | null;
  compliance_note?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
};

function logWeeklyPersistence(message: string, error?: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[IXAI WEEKLY PERSISTENCE] ${message}`, error);
  }
}

function logWeeklyWorkflow(event: string, payload: Record<string, unknown>) {
  console.info(
    "[IXAI WEEKLY WORKFLOW]",
    JSON.stringify({
      event,
      ...payload,
    }),
  );
}

// v1.30.3 — distinguish "Supabase env not configured" (allow fallback for
// reads, surface clear error for writes) from "Supabase is configured but
// the request failed" (writes MUST fail loudly, never silently fall back
// to in-memory drafts which previously masked publish bugs in production).
export class WeeklyPersistenceError extends Error {
  reason: "not_configured" | "request_failed";

  constructor(message: string, reason: "not_configured" | "request_failed") {
    super(message);
    this.name = "WeeklyPersistenceError";
    this.reason = reason;
  }
}

function toDraft(record: WeeklyPersistenceRecord): WeeklyIntelligenceDraft {
  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    status: record.status,
    weekStart: record.week_start,
    weekEnd: record.week_end,
    publishDate: record.publish_date ?? undefined,
    generatedAt: record.generated_at ?? undefined,
    updatedAt: record.updated_at,
    publishedAt: record.published_at ?? undefined,
    sourceMode: record.source_mode ?? "ai_assisted",
    summary: record.summary ?? undefined,
    sections: record.sections,
    aiSuggestion: record.ai_suggestion,
    editorialNotes: record.editorial_notes ?? undefined,
    complianceNote: record.compliance_note ?? undefined,
    createdBy: record.created_by ?? undefined,
    updatedBy: record.updated_by ?? undefined,
  };
}

function toRecord(draft: WeeklyIntelligenceDraft): WeeklyPersistenceRecord {
  return {
    id: draft.id,
    slug: draft.slug,
    title: draft.title,
    status: draft.status,
    week_start: draft.weekStart,
    week_end: draft.weekEnd,
    publish_date: draft.publishDate ?? null,
    generated_at: draft.generatedAt ?? null,
    updated_at: draft.updatedAt,
    published_at: draft.publishedAt ?? null,
    source_mode: draft.sourceMode,
    summary: draft.summary ?? null,
    sections: draft.sections,
    ai_suggestion: draft.aiSuggestion,
    editorial_notes: draft.editorialNotes ?? null,
    compliance_note: draft.complianceNote ?? null,
    created_by: draft.createdBy ?? "system",
    updated_by: draft.updatedBy ?? null,
  };
}

// v1.30.3 — strict variant. Throws WeeklyPersistenceError("not_configured")
// when env is missing; throws WeeklyPersistenceError("request_failed") for
// any HTTP/network failure when env IS configured. Used by write paths so
// admin publish never silently falls back to in-memory state.
async function supabaseFetch<T>(
  path: string,
  init: RequestInit = {},
  write = false,
): Promise<T | null> {
  const config = getSupabaseRestConfig({ write });

  if (!config) {
    throw new WeeklyPersistenceError(
      write
        ? "Supabase service role key is not configured; cannot perform durable weekly write."
        : "Supabase env is not configured; cannot read weekly persistence layer.",
      "not_configured",
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SUPABASE_TIMEOUT_MS);

  try {
    const response = await fetch(`${config.restUrl}/${path}`, {
      ...init,
      cache: "no-store",
      headers: {
        apikey: config.apiKey,
        authorization: `Bearer ${config.authKey}`,
        "content-type": "application/json",
        ...(init.headers ?? {}),
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");

      // v1.30.4 — surface the full Supabase error body in server logs so
      // schema mismatches (column name, jsonb shape, constraint violation,
      // RLS denial) are visible in Vercel function logs even though the
      // API response only carries a production-safe message.
      logWeeklyPersistence(
        `Supabase weekly request failed. path=${path} status=${response.status} body=${body.slice(0, 600)}`,
      );
      throw new WeeklyPersistenceError(
        `Supabase weekly request failed: ${response.status} ${body.slice(0, 220)}`,
        "request_failed",
      );
    }

    if (response.status === 204) {
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof WeeklyPersistenceError) {
      throw error;
    }

    throw new WeeklyPersistenceError(
      error instanceof Error ? error.message : "Unknown Supabase weekly failure",
      "request_failed",
    );
  } finally {
    clearTimeout(timeout);
  }
}

// Safe wrapper for read paths: log + return null on any error so a Supabase
// outage degrades to "no published row" instead of throwing through the
// public weekly page.
//
// v1.30.6 — the trailing flag now actually controls which auth key is used.
// Public reads (anon key) only see rows the RLS policy permits, which is
// status='published'. Admin reads pass write=true so the service role
// bypasses RLS and the Editorial Studio can see drafts and reviews. Without
// this, listAdminWeeklyDraftsAsync silently returned [] on a fresh Generate
// because the new row had status='draft' and was invisible to the anon read.
async function supabaseFetchSafe<T>(
  path: string,
  init: RequestInit = {},
  write = false,
): Promise<T | null> {
  try {
    return await supabaseFetch<T>(path, init, write);
  } catch (error) {
    if (
      error instanceof WeeklyPersistenceError &&
      error.reason === "not_configured"
    ) {
      // Env not configured — normal in local dev, no log noise.
      return null;
    }

    logWeeklyPersistence("Supabase weekly read failed; falling back.", error);
    return null;
  }
}

export function isWeeklyPersistenceReadable() {
  return Boolean(getSupabaseRestConfig({ write: false }));
}

export function isWeeklyPersistenceWritable() {
  return Boolean(getSupabaseRestConfig({ write: true }));
}

function sortWeeklyDrafts(drafts: WeeklyIntelligenceDraft[]) {
  return [...drafts].sort((a, b) => {
    const aTime = new Date(a.publishedAt ?? a.updatedAt ?? a.generatedAt ?? a.weekEnd).getTime();
    const bTime = new Date(b.publishedAt ?? b.updatedAt ?? b.generatedAt ?? b.weekEnd).getTime();
    return bTime - aTime;
  });
}

function staticWeeklyToDraft(brief: WeeklyBrief): WeeklyIntelligenceDraft {
  const [coverageStart, coverageEnd] = brief.coveragePeriod.split(/\s+[–-]\s+/);

  return {
    id: `static-${brief.slug}`,
    slug: brief.slug,
    title: brief.title,
    status: "published",
    weekStart: coverageStart?.trim() || brief.date,
    weekEnd: coverageEnd?.trim() || brief.date,
    publishDate: brief.publishedAt,
    generatedAt: brief.publishedAt,
    updatedAt: brief.publishedAt,
    publishedAt: brief.publishedAt,
    sourceMode: "static_editorial",
    summary: brief.executiveSummary,
    sections: {
      marketHighlights: brief.marketHighlights,
      majorEvents: brief.majorEvents.map((event) => ({
        label: event.category,
        title: event.headline,
        whyItMatters: event.ixuanView,
      })),
      nextWeekFocus: brief.upcomingFocus.map((focus) => `${focus.date}｜${focus.event}`),
      earningsFocus: brief.majorEvents
        .filter((event) => /財報|earnings|NVIDIA|Apple|TSMC|台積電/i.test(`${event.category} ${event.headline}`))
        .map((event) => `${event.category}: ${event.headline}`),
      fedRates: {
        headline: "FED / 利率",
        summary: brief.majorEvents.find((item) => /利率|Rates|Fed/i.test(item.category))?.summary ?? brief.intelligenceSummary.riskTone,
      },
      taiwanAi: {
        headline: "台股 AI",
        summary: brief.marketHighlights.find((item) => item.label === "台股")?.summary ?? brief.intelligenceSummary.whatChanged,
      },
      fcnMarketObservation: brief.fcnMarketObservation,
      intelligenceSummary: brief.intelligenceSummary,
    },
    aiSuggestion: {
      summarySuggestion: brief.executiveSummary,
      keyThemes: brief.marketHighlights.map((item) => item.label),
      riskFocus: brief.riskNotes,
      nextWeekWatchlist: brief.upcomingFocus.map((focus) => `${focus.date}｜${focus.event}`),
      intelligenceNarrative: brief.intelligenceSummary.pricing,
      sourceMode: "fallback",
      inputNewsCount: 0,
      sourceLabels: brief.sources.map((source) => source.label),
      generatedAt: brief.publishedAt,
    },
    editorialNotes: brief.editorialNote,
    complianceNote: "本週報為 IXAI editorial intelligence 內容，僅供市場資訊與風險觀察參考，不構成投資建議、買賣指令或報酬承諾。",
    createdBy: "static_editorial",
    updatedBy: "static_editorial",
  };
}

function getStaticWeeklyDrafts() {
  return weeklyBriefs.map(staticWeeklyToDraft);
}

// v1.30.5 — admin-facing list. Returns ONLY durable rows (Supabase
// records + in-memory dev rows). Static fallback weekly briefs are
// excluded so the Editorial Studio cannot select an id that does not
// exist in Supabase — previously a stale "static-2026-05-17-weekly-brief"
// row could appear in the admin list, and Save / Mark Review / Publish
// would 404 because no such row exists for PATCH.
//
// Public read paths (listPublishedWeeklyDraftsAsync, getPublishedWeekly
// DraftBySlugAsync, getLatestPublishedWeeklyDraftAsync) keep their static
// fallback intact so /weekly-brief still has a reading experience when
// Supabase has no published row.
export async function listAdminWeeklyDraftsAsync() {
  // v1.30.6 — admin reads MUST go through the service role so they bypass
  // RLS and can see status='draft' / 'review' rows. The anon key only sees
  // status='published' per the public policy, which previously made the
  // Editorial Studio look empty even after a successful Generate.
  const records = await supabaseFetchSafe<WeeklyPersistenceRecord[]>(
    `${WEEKLY_TABLE}?select=*&order=updated_at.desc`,
    {},
    true,
  );

  if (records?.length) {
    return sortWeeklyDrafts(records.map(toDraft));
  }

  // No Supabase rows yet → admin should see only durable in-memory drafts
  // (rare; only relevant in dev without Supabase env). Static fallback is
  // intentionally NOT mixed in — admin must Generate to populate Supabase.
  return sortWeeklyDrafts(serverWeeklyDrafts);
}

export async function listWeeklyDraftsAsync() {
  const records = await supabaseFetchSafe<WeeklyPersistenceRecord[]>(
    `${WEEKLY_TABLE}?select=*&order=updated_at.desc`,
    {},
    false,
  );

  if (records?.length) {
    return sortWeeklyDrafts(records.map(toDraft));
  }

  return sortWeeklyDrafts([...serverWeeklyDrafts, ...getStaticWeeklyDrafts()]);
}

export async function listPublishedWeeklyDraftsAsync() {
  const records = await supabaseFetchSafe<WeeklyPersistenceRecord[]>(
    `${WEEKLY_TABLE}?select=*&status=eq.published&order=published_at.desc.nullslast`,
    {},
    false,
  );

  if (records?.length) {
    return sortWeeklyDrafts(records.map(toDraft).filter((draft) => draft.status === "published"));
  }

  // v1.30.3 — when Supabase is the source of truth (env configured), an
  // empty published-rows query means the user has not yet published.
  // Returning static fallback here previously masked the durable-publish
  // bug because /weekly-brief looked unchanged even after the admin row
  // failed to flip to status=published in Supabase.
  if (isWeeklyPersistenceReadable()) {
    return sortWeeklyDrafts(
      serverWeeklyDrafts.filter((draft) => draft.status === "published"),
    );
  }

  return sortWeeklyDrafts(
    [...serverWeeklyDrafts, ...getStaticWeeklyDrafts()].filter(
      (draft) => draft.status === "published",
    ),
  );
}

export async function getLatestPublishedWeeklyDraftAsync() {
  return (await listPublishedWeeklyDraftsAsync())[0] ?? null;
}

export async function getPublishedWeeklyDraftBySlugAsync(slug: string) {
  const encodedSlug = encodeURIComponent(slug);
  const records = await supabaseFetchSafe<WeeklyPersistenceRecord[]>(
    `${WEEKLY_TABLE}?select=*&slug=eq.${encodedSlug}&status=eq.published&limit=1`,
    {},
    false,
  );

  if (records?.[0]) {
    return toDraft(records[0]);
  }

  // v1.30.3 — when Supabase is configured but does not return a published
  // row for this slug, do NOT silently substitute a static/in-memory
  // draft. Public /weekly-brief/[slug] should 404 rather than show stale
  // content, and draft/review slugs must not become reachable.
  if (isWeeklyPersistenceReadable()) {
    return null;
  }

  return [...serverWeeklyDrafts, ...getStaticWeeklyDrafts()].find(
    (draft) => draft.slug === slug && draft.status === "published",
  ) ?? null;
}

export async function getWeeklyDraftByIdAsync(id: string) {
  // v1.30.6 — admin-side lookup. publishWeeklyDraftAsync /
  // updateWeeklyDraftAsync and the admin GET-by-id route call through
  // here, so we use the service role to see draft + review rows. If we
  // stayed on the anon key, publish would think its own draft does not
  // exist and return "not_found".
  const encodedId = encodeURIComponent(id);
  const records = await supabaseFetchSafe<WeeklyPersistenceRecord[]>(
    `${WEEKLY_TABLE}?select=*&id=eq.${encodedId}&limit=1`,
    {},
    true,
  );

  if (records?.[0]) {
    return toDraft(records[0]);
  }

  return serverWeeklyDrafts.find((draft) => draft.id === id) ?? getStaticWeeklyDrafts().find((draft) => draft.id === id) ?? null;
}

export async function saveWeeklyDraftAsync(draft: WeeklyIntelligenceDraft) {
  const nextDraft = {
    ...draft,
    updatedAt: new Date().toISOString(),
  };

  // v1.30.3 — when Supabase is configured we MUST persist there. If the
  // write fails (network, RLS, schema mismatch), propagate the error so the
  // API and admin UI surface a real failure instead of pretending the
  // publish landed. The in-memory fallback only fires when Supabase env is
  // absent (i.e. local dev without service role key).
  //
  // v1.30.4 — two write-shape fixes vs the previous version that produced
  // an "empty response" failure for every Generate call:
  //   1. Wrap the record in an array. PostgREST returns the same shape it
  //      received, so a single-object payload came back as a single object,
  //      and saved?.[0] resolved to undefined → strict mode threw.
  //   2. Add ?on_conflict=slug so the upsert can MERGE on the slug unique
  //      constraint. Without it, PostgREST defaults to the PK and a repeat
  //      Generate (same slug, new uuid) would raise 409 unique_violation.
  const record = toRecord(nextDraft);

  try {
    const saved = await supabaseFetch<WeeklyPersistenceRecord[]>(
      `${WEEKLY_TABLE}?on_conflict=slug`,
      {
        body: JSON.stringify([record]),
        headers: {
          Prefer: "resolution=merge-duplicates,return=representation",
        },
        method: "POST",
      },
      true,
    );

    if (saved?.[0]) {
      return toDraft(saved[0]);
    }

    // Supabase returned 204 / empty — treat as failure rather than silently
    // success: durable write should always come back with the row.
    logWeeklyPersistence(
      `Supabase weekly write returned an empty response. slug=${record.slug} status=${record.status}`,
    );
    throw new WeeklyPersistenceError(
      "Supabase weekly write returned an empty response; row not confirmed.",
      "request_failed",
    );
  } catch (error) {
    if (
      error instanceof WeeklyPersistenceError &&
      error.reason === "not_configured"
    ) {
      // Local dev without Supabase env — fall back to in-memory store so
      // editorial workflow remains testable, but the API layer will mark
      // persistence as unwritable so the admin UI knows.
      serverWeeklyDrafts = [
        nextDraft,
        ...serverWeeklyDrafts.filter(
          (item) => item.id !== nextDraft.id && item.slug !== nextDraft.slug,
        ),
      ];

      return nextDraft;
    }

    throw error;
  }
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function getWeeklyGenerationRange(now = new Date()) {
  // Vercel cron runs at Sunday 00:00 UTC, which is Sunday 08:00 Asia/Taipei.
  // The operating rule is Monday-to-Sunday: the draft covers the week ending on that Sunday.
  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const daysSinceMonday = (todayUtc.getUTCDay() + 6) % 7;
  const weekStart = addDays(todayUtc, -daysSinceMonday);
  const weekEnd = addDays(weekStart, 6);

  return {
    weekStart: dateKey(weekStart),
    weekEnd: dateKey(weekEnd),
  };
}

// v1.31 — generator pipeline.
//
// 1. categorizeWeeklyHeadlines deduplicates and assigns each headline to
//    exactly one section by priority (Fed > earnings > AI > Taiwan > US
//    equities > crypto > geopolitics).
// 2. selectUpcomingEvents pulls the curated calendar for the next-week
//    window so upcomingFocus carries real dates, not "下週" placeholders.
// 3. sourcesUsed tracks which feed contributed which headlines into which
//    sections, replacing the previous generic source note.
// 4. intelligenceSummary / risk focus / FCN sentiment / Taiwan AI tone
//    are derived from the SELECTED content (not boilerplate), so each
//    Weekly draft reads like a real market recap.

function emptySectionSentinel(label: string): string {
  return `本週 ${label} 未偵測到足夠高品質訊號；IXAI editorial 不重複塞入其他類別的新聞。`;
}

function toPastWeekItem(label: string, news: NormalizedNewsItem): WeeklyPastWeekItem {
  return {
    label,
    headline: news.title,
    source: news.sourceLabel,
    summary: news.summary,
    url: news.url,
    publishedAt: news.publishedAt,
  };
}

function buildPastWeekHighlights(
  categorization: CategorizationResult,
): WeeklyPastWeekHighlights {
  const sections = categorization.sections;
  const map = (key: WeeklySectionKey) =>
    sections[key].map((item) => toPastWeekItem(SECTION_LABELS[key], item));

  return {
    usEquities: map("usEquities"),
    taiwanEquities: map("taiwanEquities"),
    aiSemiconductors: map("aiSemiconductors"),
    fedRatesMacro: map("fedRatesMacro"),
    earnings: map("earnings"),
    crypto: map("crypto"),
    geopolitics: map("geopolitics"),
  };
}

function buildSourcesUsed(
  categorization: CategorizationResult,
): WeeklySourceUsed[] {
  const accumulator = new Map<string, WeeklySourceUsed>();

  for (const key of Object.keys(categorization.sections) as WeeklySectionKey[]) {
    const sectionLabel = SECTION_LABELS[key];

    for (const item of categorization.sections[key]) {
      const existing = accumulator.get(item.sourceLabel);

      if (existing) {
        if (!existing.headlines.includes(item.title)) {
          existing.headlines.push(item.title);
        }

        if (!existing.usedInSections.includes(sectionLabel)) {
          existing.usedInSections.push(sectionLabel);
        }

        continue;
      }

      accumulator.set(item.sourceLabel, {
        label: item.sourceLabel,
        category: "market_news",
        headlines: [item.title],
        usedInSections: [sectionLabel],
      });
    }
  }

  return [...accumulator.values()];
}

function legacyMarketHighlights(
  past: WeeklyPastWeekHighlights,
): WeeklyIntelligenceSections["marketHighlights"] {
  const pick = (label: string, items: WeeklyPastWeekItem[], fallbackIxaiView: string) => ({
    label,
    headline: items[0]?.headline ?? `本週 ${label} 未偵測到足夠高品質訊號`,
    summary:
      items.length > 0
        ? items[0].summary ?? `${items[0].source}：${items[0].headline}`
        : emptySectionSentinel(label),
    ixaiView: fallbackIxaiView,
  });

  return [
    pick(
      "美股",
      past.usEquities,
      "美股本週需要同時觀察利率與大型權值股的領漲廣度，不能只看單一指數。",
    ),
    pick(
      "台股",
      past.taiwanEquities,
      "台股 AI 供應鏈重點是外資權重、法說展望與訂單能見度是否同步。",
    ),
    pick(
      "AI 科技",
      past.aiSemiconductors,
      "AI capex 是否延續，是半導體與伺服器供應鏈的核心定價依據。",
    ),
    pick(
      "Crypto",
      past.crypto,
      "Crypto 仍是流動性與風險偏好的輔助溫度計，不是本週主導因素。",
    ),
  ];
}

function legacyMajorEvents(
  past: WeeklyPastWeekHighlights,
  upcomingFed: UpcomingEvent[],
  upcomingTaiwan: UpcomingEvent[],
): WeeklyIntelligenceSections["majorEvents"] {
  const events: WeeklyIntelligenceSections["majorEvents"] = [];

  const fedFromPast = past.fedRatesMacro[0];
  const aiFromPast = past.aiSemiconductors[0];
  const earningsFromPast = past.earnings[0];
  const taiwanFromPast = past.taiwanEquities[0];

  if (fedFromPast) {
    events.push({
      label: "FED / 利率 / 總經",
      title: fedFromPast.headline,
      whyItMatters: "利率預期直接影響科技股估值、美元強弱與風險資產折現率。",
    });
  } else if (upcomingFed[0]) {
    events.push({
      label: "FED / 利率 / 總經",
      title: `下週聚焦：${upcomingFed[0].title}（${upcomingFed[0].date}）`,
      whyItMatters: upcomingFed[0].whyItMatters,
    });
  }

  if (aiFromPast) {
    events.push({
      label: "AI / 半導體",
      title: aiFromPast.headline,
      whyItMatters: "AI 資本支出能否延續，決定半導體與伺服器供應鏈的資金集中度。",
    });
  }

  if (earningsFromPast) {
    events.push({
      label: "財報",
      title: earningsFromPast.headline,
      whyItMatters: "財報與 guidance 是科技股估值能否被基本面支撐的短線驗證。",
    });
  }

  if (taiwanFromPast) {
    events.push({
      label: "Taiwan",
      title: taiwanFromPast.headline,
      whyItMatters: "台灣半導體與 AI server 供應鏈是全球 AI trade 的關鍵映射。",
    });
  } else if (upcomingTaiwan[0]) {
    events.push({
      label: "Taiwan",
      title: `下週聚焦：${upcomingTaiwan[0].title}（${upcomingTaiwan[0].date}）`,
      whyItMatters: upcomingTaiwan[0].whyItMatters,
    });
  }

  return events;
}

function legacyNextWeekFocus(events: UpcomingEvent[]): string[] {
  if (events.length === 0) {
    return [
      "本週未有重大 macro / earnings 事件於下週窗口；持續觀察利率、AI capex 與台股供應鏈節奏。",
    ];
  }

  return events.map((event) => `${event.date}｜${event.title}`);
}

function buildIntelligenceSummary(
  past: WeeklyPastWeekHighlights,
  upcoming: UpcomingEvent[],
  intake: NewsIntakeResult,
  dailyCoreAggregation?: WeeklyDailyCoreAggregation,
): WeeklyIntelligenceSections["intelligenceSummary"] {
  if (dailyCoreAggregation?.sourceBriefSlugs.length) {
    return {
      pricing: `本週主線：${dailyCoreAggregation.weeklyNarrative}`,
      riskTone:
        dailyCoreAggregation.nextWeekWatchpoints[0] ??
        "本週風險基調仍需觀察利率、美元、波動率與市場廣度是否同向。",
      whatChanged: dailyCoreAggregation.whatChanged,
    };
  }

  const fedSignal = past.fedRatesMacro[0];
  const aiSignal = past.aiSemiconductors[0];
  const taiwanSignal = past.taiwanEquities[0];
  const upcomingMacro = upcoming.find(
    (event) => event.category === "fed_rates" || event.category === "macro_data",
  );
  const upcomingEarnings = upcoming.find((event) => event.category === "us_earnings");

  const pricingPieces: string[] = [];
  if (fedSignal) {
    pricingPieces.push(`利率端 pricing：${fedSignal.headline}`);
  }
  if (aiSignal) {
    pricingPieces.push(`AI capex 端 pricing：${aiSignal.headline}`);
  }
  if (taiwanSignal) {
    pricingPieces.push(`台股 AI 鏈 pricing：${taiwanSignal.headline}`);
  }

  const pricing =
    pricingPieces.length > 0
      ? `市場正在 pricing：${pricingPieces.join("；")}。`
      : `市場本週 ${intake.mode === "real" ? "公開來源" : "fallback editorial"} 訊號偏分散，pricing 重點仍是利率路徑與 AI capex 延續性。`;

  const riskParts: string[] = [];
  if (fedSignal) {
    riskParts.push("利率端：殖利率與美元強弱仍是風險資產折現率主軸。");
  }
  if (upcomingEarnings) {
    riskParts.push(
      `下週 ${upcomingEarnings.title}（${upcomingEarnings.date}）的 guidance 將驗證 AI capex 訊號。`,
    );
  }
  if (upcomingMacro) {
    riskParts.push(
      `下週 ${upcomingMacro.title}（${upcomingMacro.date}）將重新校準利率預期。`,
    );
  }

  const riskTone =
    riskParts.length > 0
      ? riskParts.join(" ")
      : "整體風險基調偏中性到審慎；下週尚未有單一事件能決定方向。";

  const whatChanged =
    upcoming.length > 0
      ? `相較前一週，本週開始為下週 ${upcoming
          .slice(0, 2)
          .map((event) => `${event.title}（${event.date}）`)
          .join("、")} 重新校準預期；AI 主線仍需配合利率與財報雙重驗證。`
      : "市場敘事仍圍繞利率、AI capex 與台股供應鏈兌現能力；本週無單一事件改變整體 regime。";

  return {
    pricing,
    riskTone,
    whatChanged,
  };
}

function buildFcnObservation(
  past: WeeklyPastWeekHighlights,
): WeeklyIntelligenceSections["fcnMarketObservation"] {
  const aiSignal = past.aiSemiconductors[0];
  const taiwanSignal = past.taiwanEquities[0];

  return {
    volatility:
      "FCN 教育觀察：波動率擴大時，worst-of 標的更容易接近 KI；應持續對齊本週標的波動度。",
    aiBasket: aiSignal
      ? `AI basket 觀察：${aiSignal.headline} 反映 AI 高 beta 籃子仍是 FCN issuer 主要 underlying 候選。`
      : "AI basket 觀察：高 beta AI 個股仍是 FCN 結構主要素材，需檢視整籃集中度。",
    worstOf: taiwanSignal
      ? `Worst-of 觀察：${taiwanSignal.headline} 反映台股 AI 供應鏈個股表現分歧，可能成為 worst-of。`
      : "Worst-of 觀察：FCN 風險由籃子中最弱標的主導，不應只看最強的 AI 題材。",
    sentiment:
      "整體 FCN sentiment：本週仍以教育觀察為主，個人化監控保留在 IXAI Pro。",
  };
}

function buildWeeklySections({
  intake,
  past,
  upcoming,
  upcomingEarnings,
  upcomingTaiwan,
  upcomingFedMacro,
  sourcesUsed,
  categorization,
  narrative,
  dailyCoreAggregation,
}: {
  intake: NewsIntakeResult;
  past: WeeklyPastWeekHighlights;
  upcoming: UpcomingEvent[];
  upcomingEarnings: UpcomingEvent[];
  upcomingTaiwan: UpcomingEvent[];
  upcomingFedMacro: UpcomingEvent[];
  sourcesUsed: WeeklySourceUsed[];
  categorization: CategorizationResult;
  narrative: NarrativeBundle;
  dailyCoreAggregation?: WeeklyDailyCoreAggregation;
}): WeeklyIntelligenceSections {
  const fedRatesPast = past.fedRatesMacro[0];
  const taiwanPast = past.taiwanEquities[0];
  const dailyCoreHighlights = (dailyCoreAggregation?.recentSignals ?? [])
    .slice(0, 4)
    .map((signal, index) => ({
      headline: signal,
      ixaiView:
        dailyCoreAggregation?.repeatedThemes[index]
          ? `Daily Core 連續追蹤：${dailyCoreAggregation.repeatedThemes[index]}。`
          : "Daily Core 訊號用於週報聚合，不是獨立重新生成的觀點。",
      label: ["Daily Signal", "Continuity", "Theme Shift", "Risk Context"][index] ?? "Daily Core",
      summary:
        index === 0
          ? dailyCoreAggregation?.whatChanged ?? signal
          : dailyCoreAggregation?.nextWeekWatchpoints[index - 1] ?? signal,
    }));

  const upcomingWeek: WeeklyUpcomingEvent[] = upcoming.map((event) => ({
    date: event.date,
    title: event.title,
    category: event.category,
    whyItMatters: event.whyItMatters,
    relatedAssets: event.relatedAssets,
    marketImpact: event.marketImpact,
  }));

  return {
    marketHighlights: dailyCoreHighlights.length ? dailyCoreHighlights : legacyMarketHighlights(past),
    majorEvents: legacyMajorEvents(past, upcomingFedMacro, upcomingTaiwan),
    nextWeekFocus: legacyNextWeekFocus(upcoming),
    earningsFocus:
      upcomingEarnings.length > 0
        ? upcomingEarnings.map((event) => `${event.date}｜${event.title} — ${event.whyItMatters}`)
        : [
            "本週下週窗口無大型科技財報；持續追蹤 NVDA / AVGO / MU 出貨節奏與台股 AI server 法說。",
          ],
    fedRates: {
      headline:
        fedRatesPast?.headline ??
        upcomingFedMacro[0]?.title ??
        "FED / 利率仍是本週市場風險定價核心",
      summary: fedRatesPast
        ? `${fedRatesPast.source}：${fedRatesPast.summary ?? fedRatesPast.headline}`
        : upcomingFedMacro[0]
          ? `${upcomingFedMacro[0].date}｜${upcomingFedMacro[0].whyItMatters}`
          : "若美債殖利率維持高檔，科技股估值壓力可能延續；若利率回落，成長股與 AI trade 的風險偏好有機會改善。",
    },
    taiwanAi: {
      headline:
        taiwanPast?.headline ??
        upcomingTaiwan[0]?.title ??
        "台股 AI supply chain remains in focus",
      summary: taiwanPast
        ? `${taiwanPast.source}：${taiwanPast.summary ?? taiwanPast.headline}`
        : upcomingTaiwan[0]
          ? `${upcomingTaiwan[0].date}｜${upcomingTaiwan[0].whyItMatters}`
          : "台積電與 AI server 相關供應鏈仍是台股風險偏好與外資配置的主要觀察窗口。",
    },
    fcnMarketObservation: buildFcnObservation(past),
    intelligenceSummary: buildIntelligenceSummary(past, upcoming, intake, dailyCoreAggregation),
    pastWeekHighlights: past,
    upcomingWeek,
    sourcesUsed,
    generatorStats: {
      inputNewsCount: intake.itemCount,
      uniqueHeadlinesCount: categorization.uniqueHeadlinesCount,
      duplicatesRemoved: categorization.duplicatesRemoved,
      upcomingEventsCount: upcoming.length,
      sourcesUsedCount: sourcesUsed.length,
    },
    // v1.32 — narrative intelligence bundle is persisted inside sections
    // so existing jsonb storage continues to round-trip and old rows stay
    // valid (the field is optional). Public surfaces render the bundle as
    // narrative cards; admin can preview it without a separate fetch.
    narrative: {
      marketNarrative: narrative.marketNarrative,
      pricingWhat: narrative.pricingWhat,
      riskFocus: narrative.riskFocus,
      crossMarketNarrative: narrative.crossMarketNarrative,
      crossMarketLinks: narrative.crossMarketLinks,
      volatilityNarrative: narrative.volatilityNarrative,
      aiNarrative: narrative.aiNarrative,
      taiwanNarrative: narrative.taiwanNarrative,
      intelligenceTakeaway: narrative.intelligenceTakeaway,
      regime: {
        regime: narrative.regime.regime,
        aiMomentum: narrative.regime.aiMomentum,
        macroPressure: narrative.regime.macroPressure,
        volatilityState: narrative.regime.volatilityState,
      },
      importanceRanking: narrative.importanceRanking,
    },
    dailyCoreAggregation,
  };
}

function buildAiSuggestion(
  sections: WeeklyIntelligenceSections,
  intake: NewsIntakeResult,
  upcoming: UpcomingEvent[],
): WeeklyIntelligenceAiSuggestion {
  const sourceLabels = (sections.sourcesUsed ?? []).map((source) => source.label);

  const upcomingFedMacro = upcoming.filter(
    (event) => event.category === "fed_rates" || event.category === "macro_data",
  );
  const upcomingEarnings = upcoming.filter((event) => event.category === "us_earnings");
  const upcomingTaiwan = upcoming.filter((event) => event.category === "taiwan_event");

  const riskFocus: string[] = [];
  if (upcomingFedMacro[0]) {
    riskFocus.push(
      `${upcomingFedMacro[0].date}｜${upcomingFedMacro[0].title}：${upcomingFedMacro[0].marketImpact}`,
    );
  }
  if (upcomingEarnings[0]) {
    riskFocus.push(
      `${upcomingEarnings[0].date}｜${upcomingEarnings[0].title}：${upcomingEarnings[0].marketImpact}`,
    );
  }
  if (upcomingTaiwan[0]) {
    riskFocus.push(
      `${upcomingTaiwan[0].date}｜${upcomingTaiwan[0].title}：${upcomingTaiwan[0].marketImpact}`,
    );
  }
  if (riskFocus.length === 0) {
    riskFocus.push(sections.fedRates.summary);
  }

  return {
    summarySuggestion: sections.intelligenceSummary.pricing,
    keyThemes: sections.dailyCoreAggregation?.repeatedThemes.length
      ? sections.dailyCoreAggregation.repeatedThemes
      : sections.marketHighlights.map((item) => item.label),
    riskFocus,
    nextWeekWatchlist: sections.dailyCoreAggregation?.nextWeekWatchpoints.length
      ? sections.dailyCoreAggregation.nextWeekWatchpoints
      : sections.nextWeekFocus,
    intelligenceNarrative: sections.dailyCoreAggregation?.weeklyNarrative ?? sections.intelligenceSummary.whatChanged,
    sourceMode: intake.mode,
    inputNewsCount: intake.itemCount,
    sourceLabels,
    generatedAt: new Date().toISOString(),
  };
}

async function findWeeklyDraftByRange(weekStart: string, weekEnd: string) {
  // v1.30.6 — generation-time lookup. Uses service role so a pre-existing
  // draft for this week is correctly detected (otherwise the second
  // Generate within a week would hit a unique_violation instead of
  // returning the existing draft).
  const records = await supabaseFetchSafe<WeeklyPersistenceRecord[]>(
    `${WEEKLY_TABLE}?select=*&week_start=eq.${weekStart}&week_end=eq.${weekEnd}&order=updated_at.desc`,
    {},
    true,
  );

  if (records?.length) {
    const drafts = sortWeeklyDrafts(records.map(toDraft));
    return drafts.find((draft) => draft.status === "draft" || draft.status === "review") ?? drafts[0];
  }

  const localDrafts = sortWeeklyDrafts(
    serverWeeklyDrafts.filter((draft) => draft.weekStart === weekStart && draft.weekEnd === weekEnd),
  );

  return localDrafts.find((draft) => draft.status === "draft" || draft.status === "review") ?? localDrafts[0] ?? null;
}

function buildSummary({
  status,
  draft,
  intake,
  forced,
}: {
  status: WeeklyDraftGenerationSummary["status"];
  draft: WeeklyIntelligenceDraft;
  intake: NewsIntakeResult;
  forced: boolean;
}): WeeklyDraftGenerationSummary {
  return {
    status,
    draftSlug: draft.slug,
    generatedAt: draft.generatedAt ?? draft.updatedAt,
    sourceMode: intake.mode,
    itemCount: intake.itemCount,
    sourceStatus: intake.sourceStatus ?? intake.sources,
    schedulerConfigured: Boolean(process.env.IXAI_CRON_SECRET || process.env.CRON_SECRET),
    forced,
  };
}

export async function generateWeeklyIntelligenceDraft({
  force = false,
}: {
  force?: boolean;
} = {}) {
  const { weekStart, weekEnd } = getWeeklyGenerationRange();
  logWeeklyWorkflow("generation_started", {
    force,
    generation_started: true,
    week_end: weekEnd,
    week_start: weekStart,
  });
  const intake = await getLatestNewsIntakeResult();
  const recentDailyBriefs = await getDraftsAsync();
  const dailyCoreAggregation = buildWeeklyAggregationFromDailyCores(recentDailyBriefs);
  const existingDraft = await findWeeklyDraftByRange(weekStart, weekEnd);
  const canReuseExisting =
    existingDraft?.status === "draft" || existingDraft?.status === "review";

  if (existingDraft && !force) {
    lastWeeklyGenerationSummary = buildSummary({
      status: "existing",
      draft: existingDraft,
      intake,
      forced: false,
    });
    logWeeklyWorkflow("generation_completed", {
      blocked_by_published_week_range: !canReuseExisting,
      draft_id: existingDraft.id,
      generation_completed: true,
      reused_existing: true,
      save_completed: false,
      weekly_slug: existingDraft.slug,
      weekly_status: existingDraft.status,
    });

    return { draft: existingDraft, intake, summary: lastWeeklyGenerationSummary };
  }

  const now = new Date().toISOString();

  // v1.31 — assemble the past-week recap from a deduped + categorized
  // selection of headlines, the upcoming-week section from the curated
  // calendar, and a real sourcesUsed list so the draft reflects what was
  // actually consumed instead of placeholder boilerplate.
  const categorization = categorizeWeeklyHeadlines(intake.items);
  const past = buildPastWeekHighlights(categorization);
  const { nextWeekStart, nextWeekEnd } = getNextWeekRange(weekEnd);
  const upcoming = selectUpcomingEvents({ nextWeekStart, nextWeekEnd });
  const upcomingEarnings = selectUpcomingEarnings(upcoming);
  const upcomingTaiwan = selectUpcomingTaiwanEvents(upcoming);
  const upcomingFedMacro = selectUpcomingFedMacro(upcoming);
  const sourcesUsed = buildSourcesUsed(categorization);

  // v1.32 — narrative bundle: regime inference, importance ranking, and
  // institutional-tone cross-market narrative. Built from the same
  // intake.items the categorizer used so the narrative reflects the
  // selected content, not raw news noise.
  const narrative = buildNarrativeBundle({
    items: intake.items,
    upcomingEvents: upcoming.map((event) => ({
      date: event.date,
      title: event.title,
      category: event.category,
      whyItMatters: event.whyItMatters,
      relatedAssets: event.relatedAssets,
    })),
    pastTopByCategory: {
      fedMacro: categorization.sections.fedRatesMacro[0],
      aiSemi: categorization.sections.aiSemiconductors[0],
      taiwan: categorization.sections.taiwanEquities[0],
      crypto: categorization.sections.crypto[0],
      usEquities: categorization.sections.usEquities[0],
      earnings: categorization.sections.earnings[0],
    },
  });

  const sections = buildWeeklySections({
    intake,
    past,
    upcoming,
    upcomingEarnings,
    upcomingTaiwan,
    upcomingFedMacro,
    sourcesUsed,
    categorization,
    narrative,
    dailyCoreAggregation,
  });
  const aiSuggestion = buildAiSuggestion(sections, intake, upcoming);
  const slug = force
    ? `weekly-intelligence-${weekEnd}-${now.replace(/[:.]/g, "-")}`
    : `weekly-intelligence-${weekEnd}`;
  const draft: WeeklyIntelligenceDraft = {
    id: crypto.randomUUID(),
    slug,
    title: `IXAI Weekly Intelligence｜${weekStart} - ${weekEnd}`,
    status: "draft",
    weekStart,
    weekEnd,
    publishDate: now,
    generatedAt: now,
    updatedAt: now,
    sourceMode: "ai_assisted",
    summary: sections.intelligenceSummary.pricing,
    sections,
    aiSuggestion,
    editorialNotes: "AI-assisted weekly draft. Editorial review required before publish.",
    complianceNote: "本週報由 IXAI 根據公開新聞標題、摘要與市場脈絡產生草稿，需經人工審閱。內容僅供市場資訊與風險觀察參考，不構成投資建議、買賣指令或報酬承諾。",
    createdBy: "system",
    updatedBy: "system",
  };
  const savedDraft = await saveWeeklyDraftAsync(draft);
  logWeeklyWorkflow("save_completed", {
    draft_id: savedDraft.id,
    generation_completed: true,
    generation_started: true,
    save_completed: true,
    weekly_slug: savedDraft.slug,
    weekly_status: savedDraft.status,
  });

  lastWeeklyGenerationSummary = buildSummary({
    status: "generated",
    draft: savedDraft,
    intake,
    forced: force,
  });

  return { draft: savedDraft, intake, summary: lastWeeklyGenerationSummary };
}

function hasPublishableContent(draft: WeeklyIntelligenceDraft) {
  return Boolean(
    draft.title.trim() &&
      draft.summary?.trim() &&
      draft.sections.marketHighlights.length &&
      draft.sections.intelligenceSummary.pricing.trim(),
  );
}

export async function updateWeeklyDraftAsync(
  id: string,
  patch: Partial<Pick<
    WeeklyIntelligenceDraft,
    "title" | "summary" | "sections" | "editorialNotes" | "complianceNote" | "status" | "updatedBy"
  >>,
) {
  const current = await getWeeklyDraftByIdAsync(id);

  if (!current || current.status === "published" || current.id.startsWith("static-")) {
    return null;
  }

  const next: WeeklyIntelligenceDraft = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
    updatedBy: patch.updatedBy ?? "editorial_studio",
  };

  // v1.30.3 — saveWeeklyDraftAsync now throws on durable persistence
  // failure. We let the throw propagate so PATCH callers (admin Save /
  // Mark as Review) surface a real error instead of fake success.
  return saveWeeklyDraftAsync(next);
}

export async function publishWeeklyDraftAsync(id: string) {
  const current = await getWeeklyDraftByIdAsync(id);

  if (!current || current.id.startsWith("static-")) {
    return {
      draft: null,
      error: "not_found" as const,
    };
  }

  if (!["draft", "review"].includes(current.status)) {
    return {
      draft: current,
      error: "invalid_status" as const,
    };
  }

  if (!hasPublishableContent(current)) {
    return {
      draft: current,
      error: "validation_failed" as const,
    };
  }

  const now = new Date().toISOString();
  const next: WeeklyIntelligenceDraft = {
    ...current,
    status: "published",
    publishedAt: now,
    publishDate: current.publishDate ?? now,
    updatedAt: now,
    updatedBy: "editorial_studio",
  };

  // v1.30.3 — surface persistence failures so the API can return non-OK
  // and the admin UI shows a real error instead of an optimistic success.
  try {
    return {
      draft: await saveWeeklyDraftAsync(next),
      error: null,
    };
  } catch (error) {
    return {
      draft: current,
      error: "persistence_failed" as const,
      message:
        error instanceof Error
          ? error.message
          : "Supabase weekly publish failed.",
    };
  }
}

export function weeklyDraftToBrief(draft: WeeklyIntelligenceDraft): WeeklyBrief {
  // v1.31 — emit real upcoming dates and real sources used. Falls back to
  // the legacy nextWeekFocus list only when no curated upcoming events
  // resolved for this draft's week window.
  const upcomingEvents = draft.sections.upcomingWeek ?? [];
  const sourcesUsed = draft.sections.sourcesUsed ?? [];
  const nextWeekStart = getNextWeekRange(draft.weekEnd).nextWeekStart;
  const nextWeekEnd = getNextWeekRange(draft.weekEnd).nextWeekEnd;
  const upcomingPeriod =
    upcomingEvents.length > 0
      ? `${nextWeekStart} – ${nextWeekEnd}`
      : "下週市場觀察";

  const upcomingFocus =
    upcomingEvents.length > 0
      ? upcomingEvents.map((event) => ({
          date: event.date,
          event: event.title,
          whyItMatters: event.whyItMatters,
          marketImpact: event.marketImpact,
          category: event.category,
          relatedAssets: event.relatedAssets,
        }))
      : draft.sections.nextWeekFocus.map((focus) => ({
          date: nextWeekStart,
          event: focus,
          whyItMatters: "此項目可能影響下週市場風險偏好與資產輪動。",
          marketImpact: "需觀察對利率、AI 科技、台股供應鏈與風險資產的同步影響。",
        }));

  const sources =
    sourcesUsed.length > 0
      ? sourcesUsed.map((source) => ({
          label: source.label,
          type: source.category,
          note:
            source.headlines.length > 0
              ? `${source.usedInSections.join(" / ")}：${source.headlines.slice(0, 2).join("；")}`
              : "本週此來源未使用外部 headline，採用 editorial fallback。",
        }))
      : [
          {
            label: "Editorial Fallback",
            type: "editorial_review" as const,
            note: "本週此分類未使用外部來源，採用 editorial fallback。",
          },
        ];

  return {
    slug: draft.slug,
    title: draft.title,
    date: draft.weekEnd,
    publishedAt: draft.publishedAt ?? draft.publishDate ?? draft.updatedAt,
    coveragePeriod: `${draft.weekStart} – ${draft.weekEnd}`,
    upcomingPeriod,
    editorialNote: draft.editorialNotes ?? "本週報由 IXAI Editorial Studio 審閱發布。",
    executiveSummary: draft.summary ?? draft.aiSuggestion.summarySuggestion,
    marketHighlights: draft.sections.marketHighlights,
    intelligenceSummary: draft.sections.intelligenceSummary,
    fcnMarketObservation: draft.sections.fcnMarketObservation,
    majorEvents: draft.sections.majorEvents.map((event) => ({
      category: event.label,
      headline: event.title,
      summary: event.whyItMatters,
      ixuanView: event.whyItMatters,
    })),
    assetObservations: [
      {
        label: "FED / 利率",
        text: `${draft.sections.fedRates.summary} 利率路徑仍是科技股估值與風險資產配置的主要折現變數。`,
      },
      {
        label: "台股 AI",
        text: `${draft.sections.taiwanAi.summary} 台股 AI supply chain 需要同時觀察外資、法說與全球 AI 資本支出。`,
      },
      {
        label: "FCN 市場觀察",
        text: `${draft.sections.fcnMarketObservation.sentiment} 此處為教育型市場觀察，不包含個人化 FCN 風控或交易建議。`,
      },
    ],
    upcomingFocus,
    riskNotes: draft.aiSuggestion.riskFocus,
    sources,
    cta: {
      primaryLabel: "了解 IXAI Pro",
      primaryHref: "/pro",
      secondaryLabel: "閱讀每日簡報",
      secondaryHref: "/daily-brief",
    },
    // v1.32 — narrative intelligence bundle pass-through. Optional so
    // legacy static / v1.31 rows without narrative still render as
    // event-list briefs.
    narrative: draft.sections.narrative,
  };
}

export function getLastWeeklyGenerationSummary() {
  return lastWeeklyGenerationSummary;
}
