import { weeklyBriefs, type WeeklyBrief } from "@/content/weekly-briefs";
import { getSupabaseRestConfig } from "@/src/lib/supabase/server";
import { getLatestNewsIntakeResult } from "@/src/lib/news/providers";
import type {
  WeeklyDraftGenerationSummary,
  WeeklyIntelligenceAiSuggestion,
  WeeklyIntelligenceDraft,
  WeeklyIntelligenceSections,
  WeeklyIntelligenceStatus,
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
// public weekly page. Accepts the same 3-arg shape as the strict variant
// (the trailing write flag is ignored — reads never need the service role).
async function supabaseFetchSafe<T>(
  path: string,
  init: RequestInit = {},
  _write = false,
): Promise<T | null> {
  void _write;
  try {
    return await supabaseFetch<T>(path, init, false);
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
  const records = await supabaseFetchSafe<WeeklyPersistenceRecord[]>(
    `${WEEKLY_TABLE}?select=*&order=updated_at.desc`,
    {},
    false,
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
  const encodedId = encodeURIComponent(id);
  const records = await supabaseFetchSafe<WeeklyPersistenceRecord[]>(
    `${WEEKLY_TABLE}?select=*&id=eq.${encodedId}&limit=1`,
    {},
    false,
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

function itemMatches(items: NormalizedNewsItem[], pattern: RegExp) {
  return items.find((item) => pattern.test(`${item.title} ${item.summary ?? ""} ${item.tags?.join(" ") ?? ""}`));
}

function buildWeeklySections(items: NormalizedNewsItem[], intake: NewsIntakeResult): WeeklyIntelligenceSections {
  const fed = itemMatches(items, /fed|fomc|rate|yield|treasury|cpi|非農|利率|殖利率|聯準會/i);
  const taiwan = itemMatches(items, /台積電|tsmc|2330|廣達|緯創|緯穎|技嘉|半導體|cowos|hbm|台股|ai server|ai 伺服器/i);
  const ai = itemMatches(items, /nvidia|nvda|ai|server|gpu|semiconductor|晶片|半導體/i);
  const crypto = itemMatches(items, /bitcoin|btc|ethereum|eth|crypto|coindesk|比特幣|以太坊/i);
  const macro = itemMatches(items, /market|stocks|wall street|macro|tariff|china|geopolitics|市場|美股|地緣/i);
  const sourceText = intake.mode === "real" ? "本週公開新聞來源" : "fallback editorial source";

  return {
    marketHighlights: [
      {
        label: "美股",
        headline: macro?.title ?? "美股維持風險重新定價節奏",
        summary: "市場焦點集中在利率路徑、科技股估值與大型權值股財報能否支撐風險偏好。",
        ixaiView: "IXAI 觀察本週市場並非單一事件驅動，而是利率、美元與科技權重共同影響資金配置。",
      },
      {
        label: "台股",
        headline: taiwan?.title ?? "台股 AI 供應鏈維持市場主軸",
        summary: "台積電、伺服器組裝、散熱與電源供應鏈仍是台股資金判讀重點。",
        ixaiView: "台股 AI 供應鏈的重點不是短線漲跌，而是外資權重、法說展望與訂單能見度是否同步。",
      },
      {
        label: "AI 科技",
        headline: ai?.title ?? "AI infrastructure remains the central growth narrative",
        summary: "AI 晶片、雲端資本支出與伺服器供應鏈仍是本週科技股定價核心。",
        ixaiView: "若殖利率上行，AI 成長敘事仍可能面臨估值壓力；若資金回流，強者恆強格局會更明顯。",
      },
      {
        label: "Crypto",
        headline: crypto?.title ?? "Crypto remains a secondary risk appetite gauge",
        summary: "BTC / ETH 仍可作為風險偏好與流動性情緒的輔助觀察。",
        ixaiView: "Crypto 對本週主線不是主導因素，但有助判斷槓桿情緒是否重新升溫。",
      },
    ],
    majorEvents: [
      {
        label: "FED / Rates",
        title: fed?.title ?? "市場等待 FED 與通膨數據提供利率方向",
        whyItMatters: "利率預期直接影響科技股估值、美元強弱與風險資產折現率。",
      },
      {
        label: "AI / Semiconductors",
        title: ai?.title ?? "AI 供應鏈財報與展望仍是市場主要事件",
        whyItMatters: "AI 資本支出能否延續，決定半導體與伺服器供應鏈的資金集中度。",
      },
      {
        label: "Taiwan",
        title: taiwan?.title ?? "台股 AI 供應鏈觀察外資與法說脈絡",
        whyItMatters: "台灣半導體與 AI server 供應鏈是全球 AI trade 的關鍵映射。",
      },
    ],
    nextWeekFocus: [
      "追蹤 FED 官員談話、通膨數據與美債殖利率是否改變科技股折現率。",
      "觀察 NVIDIA、台積電與 AI server 供應鏈是否仍維持資金聚焦。",
      "留意美元指數與 VIX 是否同步走強，這會影響風險資產承壓程度。",
    ],
    earningsFocus: [
      "大型科技股財報與資本支出 guidance。",
      "半導體與 AI server 供應鏈營收、毛利率與訂單展望。",
      "台股法說與外資報告對 AI 供應鏈的評價變化。",
    ],
    fedRates: {
      headline: fed?.title ?? "FED / 利率仍是本週市場風險定價核心",
      summary: "若美債殖利率維持高檔，科技股估值壓力可能延續；若利率回落，成長股與 AI trade 的風險偏好有機會改善。",
    },
    taiwanAi: {
      headline: taiwan?.title ?? "台股 AI supply chain remains in focus",
      summary: "台積電與 AI server 相關供應鏈仍是台股風險偏好與外資配置的主要觀察窗口。",
    },
    fcnMarketObservation: {
      volatility: "FCN 教育觀察上，波動率升高會影響結構型商品的 worst-of 風險與提前出場機率。",
      aiBasket: "AI basket 若集中於高 beta 科技股，需特別留意單一弱勢標的拖累整籃表現。",
      worstOf: "Worst-of 結構代表最弱標的決定主要風險，不應只看籃子中最強的 AI 題材。",
      sentiment: "本週 FCN sentiment 偏向觀察模式：利率與科技股波動是主要變數。",
    },
    intelligenceSummary: {
      pricing: `市場目前正在 pricing ${sourceText} 中的利率路徑、AI 成長持續性與風險資產流動性。`,
      riskTone: "整體風險基調偏中性到審慎，重點在利率是否壓制科技股估值。",
      whatChanged: "相較前期，市場從單純追逐 AI 成長，轉向同時檢查利率、財報與供應鏈兌現能力。",
    },
  };
}

function buildAiSuggestion(sections: WeeklyIntelligenceSections, intake: NewsIntakeResult): WeeklyIntelligenceAiSuggestion {
  const sourceLabels = [
    ...new Set(
      (intake.sourceStatus ?? intake.sources)
        .filter((source) => source.status === "success" && source.itemCount > 0)
        .map((source) => source.label),
    ),
  ];

  return {
    summarySuggestion: sections.intelligenceSummary.pricing,
    keyThemes: sections.marketHighlights.map((item) => item.label),
    riskFocus: [
      sections.fedRates.summary,
      "若 VIX、美元與殖利率同步上升，風險資產可能進入更審慎的資金環境。",
      "AI 供應鏈仍需檢查財報與訂單能見度，避免單純以題材推估風險承受度。",
    ],
    nextWeekWatchlist: sections.nextWeekFocus,
    intelligenceNarrative: sections.intelligenceSummary.whatChanged,
    sourceMode: intake.mode,
    inputNewsCount: intake.itemCount,
    sourceLabels,
    generatedAt: new Date().toISOString(),
  };
}

async function findWeeklyDraftByRange(weekStart: string, weekEnd: string) {
  const records = await supabaseFetchSafe<WeeklyPersistenceRecord[]>(
    `${WEEKLY_TABLE}?select=*&week_start=eq.${weekStart}&week_end=eq.${weekEnd}&limit=1`,
    {},
    false,
  );

  if (records?.[0]) {
    return toDraft(records[0]);
  }

  return serverWeeklyDrafts.find((draft) => draft.weekStart === weekStart && draft.weekEnd === weekEnd) ?? null;
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
  const intake = await getLatestNewsIntakeResult();
  const existingDraft = await findWeeklyDraftByRange(weekStart, weekEnd);

  if (existingDraft && !force) {
    lastWeeklyGenerationSummary = buildSummary({
      status: "existing",
      draft: existingDraft,
      intake,
      forced: false,
    });

    return { draft: existingDraft, intake, summary: lastWeeklyGenerationSummary };
  }

  const now = new Date().toISOString();
  const sections = buildWeeklySections(intake.items, intake);
  const aiSuggestion = buildAiSuggestion(sections, intake);
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
  return {
    slug: draft.slug,
    title: draft.title,
    date: draft.weekEnd,
    publishedAt: draft.publishedAt ?? draft.publishDate ?? draft.updatedAt,
    coveragePeriod: `${draft.weekStart} – ${draft.weekEnd}`,
    upcomingPeriod: "下週市場觀察",
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
    upcomingFocus: draft.sections.nextWeekFocus.map((focus, index) => ({
      date: index === 0 ? draft.weekEnd : "下週",
      event: focus,
      whyItMatters: "此項目可能影響下週市場風險偏好與資產輪動。",
      marketImpact: "需觀察對利率、AI 科技、台股供應鏈與風險資產的同步影響。",
    })),
    riskNotes: draft.aiSuggestion.riskFocus,
    sources: draft.aiSuggestion.sourceLabels.map((label) => ({
      label,
      type: "market_news",
      note: "Public source headline / summary used for editorial intelligence draft.",
    })),
    cta: {
      primaryLabel: "了解 IXAI Pro",
      primaryHref: "/pro",
      secondaryLabel: "閱讀每日簡報",
      secondaryHref: "/daily-brief",
    },
  };
}

export function getLastWeeklyGenerationSummary() {
  return lastWeeklyGenerationSummary;
}
