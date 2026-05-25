// v1.36.3 — IXAI conversion funnel definitions and aggregation.
//
// Stage chain:
//   Landing → Article Open → Read Depth 50 → CTA Click → Subscribe → Return Visit
//
// Each stage maps to one or more PostHog event names we already capture
// (`weekly_open`, `daily_open`, `cta_click`, `email_capture_success`,
// `article_read_depth`). The funnel runs as a single HogQL query against
// the PostHog project; when PostHog env is missing, the API returns the
// empty-state shape so the admin UI can render gracefully.

export type FunnelStageKey =
  | "landing"
  | "article_open"
  | "read_depth_50"
  | "cta_click"
  | "subscribe"
  | "return_visit";

export type FunnelStageDefinition = {
  key: FunnelStageKey;
  label: string;
  description: string;
  // PostHog event names that count toward this stage. Some stages take
  // multiple events (e.g. article_open = weekly_open + daily_open).
  events: string[];
  // Optional HogQL WHERE predicate appended via AND. Used by the
  // read-depth stage to filter on properties['percent'] >= 50.
  predicate?: string;
};

export const FUNNEL_STAGES: FunnelStageDefinition[] = [
  {
    key: "landing",
    label: "Landing",
    description: "Unique sessions that landed on IXAI Public.",
    events: ["page_view"],
  },
  {
    key: "article_open",
    label: "Article open",
    description: "Daily / Weekly / Market / FCN article surfaces opened.",
    events: ["weekly_open", "daily_open", "market_open", "fcn_open"],
  },
  {
    key: "read_depth_50",
    label: "Read depth 50%+",
    description: "Sessions that scrolled at least 50% of an article.",
    events: ["article_read_depth"],
    predicate: "toFloat(properties['percent']) >= 50",
  },
  {
    key: "cta_click",
    label: "CTA click",
    description: "Distribution CTA / subscribe-row clicks.",
    events: ["cta_click", "distribution_cta_click"],
  },
  {
    key: "subscribe",
    label: "Subscribe",
    description: "Email capture success (mock or durable).",
    events: ["email_capture_success"],
  },
  {
    key: "return_visit",
    label: "Return visit",
    description: "Session returning within the 7-day window.",
    events: ["page_view"],
  },
];

export type FunnelStageResult = {
  key: FunnelStageKey;
  label: string;
  description: string;
  count: number;
  conversionFromPrevious: number;
  conversionFromLanding: number;
  dropoffFromPrevious: number;
};

export type FunnelSnapshot = {
  mode: "disabled" | "posthog";
  windowDays: number;
  stages: FunnelStageResult[];
  totalSubscribers: number;
  totalReturningReaders: number;
  topCapturePaths: { path: string; count: number }[];
  generatedAt: string;
};

export function emptyFunnelSnapshot(mode: "disabled" | "posthog" = "disabled"): FunnelSnapshot {
  return {
    mode,
    windowDays: 7,
    stages: FUNNEL_STAGES.map((stage) => ({
      key: stage.key,
      label: stage.label,
      description: stage.description,
      count: 0,
      conversionFromPrevious: 0,
      conversionFromLanding: 0,
      dropoffFromPrevious: 0,
    })),
    totalSubscribers: 0,
    totalReturningReaders: 0,
    topCapturePaths: [],
    generatedAt: new Date().toISOString(),
  };
}

export function decorateFunnelStages(rawCounts: Record<FunnelStageKey, number>): FunnelStageResult[] {
  const landing = rawCounts.landing || 0;
  let previous = landing;

  return FUNNEL_STAGES.map((stage) => {
    const count = rawCounts[stage.key] ?? 0;
    const conversionFromPrevious = previous > 0 ? Math.round((count / previous) * 1000) / 10 : 0;
    const conversionFromLanding = landing > 0 ? Math.round((count / landing) * 1000) / 10 : 0;
    const dropoffFromPrevious = previous > 0 ? Math.max(0, Math.round(((previous - count) / previous) * 1000) / 10) : 0;
    previous = count > 0 ? count : previous;

    return {
      key: stage.key,
      label: stage.label,
      description: stage.description,
      count,
      conversionFromPrevious,
      conversionFromLanding,
      dropoffFromPrevious,
    };
  });
}

// HogQL helper: union of event names for a given stage.
export function eventInClause(stage: FunnelStageDefinition): string {
  const events = stage.events.map((event) => `'${event}'`).join(",");
  return `event IN (${events})`;
}
