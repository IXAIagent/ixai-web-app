import { getSupabaseRestConfig } from "@/src/lib/supabase/server";
import type {
  DailyBriefDraft,
  DailyBriefDraftStatus,
  DailyIntelligenceDraft,
  DailyIntelligenceProviderMode,
} from "@/src/types/editorial";
import type { NewsSourceStatus } from "@/src/types/news";

const TABLE = "ixai_daily_intelligence_drafts";
const SUPABASE_TIMEOUT_MS = 6000;

type DailyIntelligenceRow = {
  source_id: string;
  slug: string;
  status: DailyBriefDraftStatus;
  title: string;
  market_summary: string;
  editorial_note?: string | null;
  sections: DailyBriefDraft["sections"];
  risk_focus?: string[] | null;
  watchlist_notes?: unknown;
  intelligence?: DailyIntelligenceDraft | null;
  source_mode?: "real" | "fallback" | null;
  provider_mode?: DailyIntelligenceProviderMode | null;
  input_news_count?: number | null;
  source_status?: NewsSourceStatus[] | null;
  generated_at?: string | null;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
};

function canUseSupabase(write = false) {
  return typeof window === "undefined" && getSupabaseRestConfig({ write }) !== null;
}

function logPersistenceFallback(message: string, error?: unknown) {
  if (typeof window !== "undefined") {
    return;
  }

  const detail = error instanceof Error ? error.message : String(error ?? "");
  console.warn(`[IXAI Daily Intelligence persistence] ${message}${detail ? `: ${detail}` : ""}`);
}

function rowToDraft(row: DailyIntelligenceRow): DailyBriefDraft {
  return {
    id: row.source_id,
    slug: row.slug,
    status: row.status,
    title: row.title,
    marketSummary: row.market_summary,
    editorialNote: row.editorial_note ?? undefined,
    sections: Array.isArray(row.sections) ? row.sections : [],
    riskFocus: Array.isArray(row.risk_focus) ? row.risk_focus : [],
    intelligence: row.intelligence ?? undefined,
    publishedAt: row.published_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function draftToRow(draft: DailyBriefDraft): DailyIntelligenceRow {
  return {
    source_id: draft.id,
    slug: draft.slug,
    status: draft.status,
    title: draft.title,
    market_summary: draft.marketSummary,
    editorial_note: draft.editorialNote ?? null,
    sections: draft.sections,
    risk_focus: draft.riskFocus ?? [],
    watchlist_notes: [],
    intelligence: draft.intelligence ?? null,
    source_mode: draft.intelligence?.sourceMode ?? null,
    provider_mode: draft.intelligence?.providerMode ?? null,
    input_news_count: draft.intelligence?.inputNewsCount ?? null,
    source_status: [],
    generated_at: draft.intelligence?.generatedAt ?? null,
    published_at: draft.publishedAt ?? null,
    created_at: draft.createdAt,
    updated_at: draft.updatedAt,
  };
}

async function supabaseFetch<T>(path: string, init: RequestInit = {}, write = false): Promise<T> {
  const config = getSupabaseRestConfig({ write });

  if (!config) {
    throw new Error(write ? "Supabase write env is not configured." : "Supabase env is not configured.");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SUPABASE_TIMEOUT_MS);

  try {
    const response = await fetch(`${config.restUrl}/${path}`, {
      ...init,
      cache: "no-store",
      signal: controller.signal,
      headers: {
        apikey: config.apiKey,
        authorization: `Bearer ${config.authKey}`,
        "content-type": "application/json",
        ...(init.headers ?? {}),
      },
    });

    if (!response.ok) {
      throw new Error(`Supabase ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function isDailyIntelligencePersistenceReadable() {
  return canUseSupabase(false);
}

export function isDailyIntelligencePersistenceWritable() {
  return canUseSupabase(true);
}

export async function loadDailyIntelligenceDraftsFromSupabase({
  publishedOnly = false,
}: {
  publishedOnly?: boolean;
} = {}): Promise<DailyBriefDraft[] | null> {
  if (!canUseSupabase(false)) {
    return null;
  }

  const query = new URLSearchParams({
    select: "*",
    order: "published_at.desc.nullslast,updated_at.desc",
  });

  if (publishedOnly) {
    query.set("status", "eq.published");
  }

  try {
    const rows = await supabaseFetch<DailyIntelligenceRow[]>(`${TABLE}?${query.toString()}`);

    return rows.map(rowToDraft);
  } catch (error) {
    logPersistenceFallback("read failed; using local fallback", error);
    return null;
  }
}

export async function saveDailyIntelligenceDraftToSupabase(
  draft: DailyBriefDraft,
): Promise<DailyBriefDraft | null> {
  if (!canUseSupabase(true)) {
    return null;
  }

  try {
    const rows = await supabaseFetch<DailyIntelligenceRow[]>(
      `${TABLE}?on_conflict=source_id`,
      {
        body: JSON.stringify([draftToRow(draft)]),
        headers: {
          Prefer: "resolution=merge-duplicates,return=representation",
        },
        method: "POST",
      },
      true,
    );

    return rows[0] ? rowToDraft(rows[0]) : draft;
  } catch (error) {
    logPersistenceFallback("write failed; using local fallback", error);
    return null;
  }
}
