export type DailyBriefDraftStatus = "draft" | "review" | "published";

export type DailyIntelligenceFeedItem = {
  category: string;
  title: string;
  summary: string;
  updatedLabel: string;
};

export type DailyRiskFocus = {
  label: string;
  title: string;
  summary: string;
  updatedLabel: string;
};

export type MarketRegime = "risk-on" | "risk-off" | "mixed";

export type DailyIntelligenceProviderMode = "openai" | "fallback" | "error_fallback";

export type DailyIntelligenceProviderErrorReason =
  | "missing_key"
  | "invalid_api_key"
  | "insufficient_quota"
  | "model_error"
  | "json_parse_error"
  | "unknown_error";

export type DailyIntelligenceProviderStatus = {
  providerMode: DailyIntelligenceProviderMode;
  openAIKeyDetected: boolean;
  model: string;
  errorReason?: DailyIntelligenceProviderErrorReason;
  errorMessage?: string;
};

export type DailyIntelligenceDraft = {
  todayHeadline: string;
  riskFocus: DailyRiskFocus;
  feedItems: DailyIntelligenceFeedItem[];
  marketRegimeNote: string;
  marketRegime: MarketRegime;
  aiTechObservation: string;
  cryptoObservation: string;
  macroRatesObservation?: string;
  whatToMonitor: string[];
  sessionLabel: "Asia Session" | "US Futures" | "Pre-market";
  generatedAt: string;
  sourceMode?: "real" | "fallback";
  providerMode?: DailyIntelligenceProviderMode;
  providerStatus?: DailyIntelligenceProviderStatus;
  inputNewsCount?: number;
  sourceLabels?: string[];
  complianceNote?: string;
  publishedAt?: string;
  // v1.32 — narrative intelligence bundle (optional, jsonb-friendly).
  narrative?: WeeklyNarrativeBundle;
};

export type DailyBriefDraft = {
  id: string;
  slug: string;
  status: DailyBriefDraftStatus;
  title: string;
  marketSummary: string;
  editorialNote?: string;
  sections: {
    category: string;
    headline: string;
    summary: string;
    ixaiView?: string;
  }[];
  riskFocus?: string[];
  intelligence?: DailyIntelligenceDraft;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type DailyDraftGenerationSummary = {
  status: "generated" | "existing";
  draftSlug: string;
  generatedAt: string;
  sourceMode: "real" | "fallback";
  itemCount: number;
  providerMode?: DailyIntelligenceProviderMode;
  providerStatus?: DailyIntelligenceProviderStatus;
  inputNewsCount?: number;
  sourceStatus: {
    id: string;
    label: string;
    enabled: boolean;
    status: "success" | "failed" | "disabled" | "fallback";
    itemCount: number;
    reason?: string;
  }[];
  schedulerConfigured: boolean;
  forced: boolean;
};

export type WeeklyIntelligenceStatus = "draft" | "review" | "published" | "archived";

// v1.31 — Weekly sections gain richer optional shapes for past-week
// dedup + curated upcoming calendar + real source tracking. Legacy
// fields (marketHighlights, nextWeekFocus, earningsFocus, fedRates,
// taiwanAi, majorEvents, intelligenceSummary) stay populated so the
// existing public WeeklyBrief schema and any older Supabase rows keep
// rendering. The new optional fields are pure additions; jsonb storage
// happily round-trips extra keys.
export type WeeklyPastWeekItem = {
  label: string;
  headline: string;
  source: string;
  summary?: string;
  url?: string;
  publishedAt?: string;
};

export type WeeklyPastWeekHighlights = {
  usEquities: WeeklyPastWeekItem[];
  taiwanEquities: WeeklyPastWeekItem[];
  aiSemiconductors: WeeklyPastWeekItem[];
  fedRatesMacro: WeeklyPastWeekItem[];
  earnings: WeeklyPastWeekItem[];
  crypto: WeeklyPastWeekItem[];
  geopolitics: WeeklyPastWeekItem[];
};

export type WeeklyUpcomingEvent = {
  date: string;
  title: string;
  category:
    | "fed_rates"
    | "macro_data"
    | "us_earnings"
    | "taiwan_event"
    | "crypto_event"
    | "geopolitics";
  whyItMatters: string;
  relatedAssets: string[];
  marketImpact: string;
};

export type WeeklySourceUsed = {
  label: string;
  category:
    | "official_data"
    | "earnings_calendar"
    | "market_news"
    | "crypto_market"
    | "company_ir"
    | "editorial_review";
  headlines: string[];
  usedInSections: string[];
};

export type WeeklyGeneratorStats = {
  inputNewsCount: number;
  uniqueHeadlinesCount: number;
  duplicatesRemoved: number;
  upcomingEventsCount: number;
  sourcesUsedCount: number;
};

// v1.32 — Narrative Intelligence bundle. Persisted as part of the
// sections jsonb so we don't need a new column. All fields optional for
// back-compat with v1.31 rows.
export type WeeklyNarrativeRegime = {
  regime: "risk_on" | "neutral" | "risk_off";
  aiMomentum: "strong" | "neutral" | "weak";
  macroPressure: "high" | "medium" | "low";
  volatilityState: "compressed" | "normal" | "stressed";
};

export type WeeklyNarrativeCrossMarketLink = {
  from: string;
  to: string;
  note: string;
};

export type WeeklyRankedHeadline = {
  title: string;
  source: string;
  category: string;
  importance: number; // 1-10
  importanceReason: string;
  publishedAt?: string;
};

export type WeeklyNarrativeBundle = {
  marketNarrative: string;
  pricingWhat: string[];
  riskFocus: string;
  crossMarketNarrative: string;
  crossMarketLinks: WeeklyNarrativeCrossMarketLink[];
  volatilityNarrative: string;
  aiNarrative: string;
  taiwanNarrative: string;
  intelligenceTakeaway: string;
  regime: WeeklyNarrativeRegime;
  importanceRanking: WeeklyRankedHeadline[];
};

export type WeeklyIntelligenceSections = {
  marketHighlights: {
    label: string;
    headline: string;
    summary: string;
    ixaiView: string;
  }[];
  majorEvents: {
    label: string;
    title: string;
    whyItMatters: string;
  }[];
  nextWeekFocus: string[];
  earningsFocus: string[];
  fedRates: {
    headline: string;
    summary: string;
  };
  taiwanAi: {
    headline: string;
    summary: string;
  };
  fcnMarketObservation: {
    volatility: string;
    aiBasket: string;
    worstOf: string;
    sentiment: string;
  };
  intelligenceSummary: {
    pricing: string;
    riskTone: string;
    whatChanged: string;
  };
  // v1.31 — new optional richer surfaces.
  pastWeekHighlights?: WeeklyPastWeekHighlights;
  upcomingWeek?: WeeklyUpcomingEvent[];
  sourcesUsed?: WeeklySourceUsed[];
  generatorStats?: WeeklyGeneratorStats;
  // v1.32 — narrative intelligence bundle.
  narrative?: WeeklyNarrativeBundle;
};

export type WeeklyIntelligenceAiSuggestion = {
  summarySuggestion: string;
  keyThemes: string[];
  riskFocus: string[];
  nextWeekWatchlist: string[];
  intelligenceNarrative: string;
  sourceMode: "real" | "fallback";
  inputNewsCount: number;
  sourceLabels: string[];
  generatedAt: string;
};

export type WeeklyIntelligenceDraft = {
  id: string;
  slug: string;
  title: string;
  status: WeeklyIntelligenceStatus;
  weekStart: string;
  weekEnd: string;
  publishDate?: string;
  generatedAt?: string;
  updatedAt: string;
  publishedAt?: string;
  sourceMode: string;
  summary?: string;
  sections: WeeklyIntelligenceSections;
  aiSuggestion: WeeklyIntelligenceAiSuggestion;
  editorialNotes?: string;
  complianceNote?: string;
  createdBy?: string;
  updatedBy?: string;
};

export type WeeklyDraftGenerationSummary = {
  status: "generated" | "existing";
  draftSlug: string;
  generatedAt: string;
  sourceMode: "real" | "fallback";
  itemCount: number;
  sourceStatus: DailyDraftGenerationSummary["sourceStatus"];
  schedulerConfigured: boolean;
  forced: boolean;
};
