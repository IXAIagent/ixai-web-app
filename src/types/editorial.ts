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

export type DailyWatchBlock = {
  headline: string;
  whatHappened: string;
  whyItMatters: string;
  marketMeaning: string;
};

export type DailyAiTechWatch = {
  headline: string;
  symbols: string[];
  observations: string[];
};

export type DailyCryptoWatch = {
  headline: string;
  observations: string[];
};

export type DailyRiskRegimeReasoning = {
  current: "Low" | "Moderate" | "Elevated" | "High";
  reasons: string[];
};

export type DailyFcnAwareness = {
  topic: "KO" | "KI" | "Strike" | "Coupon Observation";
  explanation: string;
  reminder: string;
};

export type DailyTopStory = {
  headline: string;
  whatHappened: string;
  whyItMatters: string;
  watchpoint: string;
};

export type DailySocialHooks = {
  primaryHook: string;
  marketPulse: string[];
  aiTechSignal: {
    keySignal: string;
    whyItMatters: string;
    watchNext: string;
  };
  riskHook: string;
  ixuanHook: string;
};

export type DailyWeeklySignals = {
  primaryTheme: string;
  repeatedThemes: string[];
  risingThemes: string[];
  fadingThemes: string[];
  weeklyNarrative: string;
  watchNext: string[];
};

export type DailyCoverageScore = {
  macro: number;
  aiTech: number;
  crypto: number;
  taiwan: number;
  risk: number;
};

export type DailyContentQualityScore = {
  score: number;
  contentLength: number;
  sourceCount: number;
  categoryDiversity: number;
  insightDepth: number;
  status: "Strong" | "Adequate" | "Insufficient Content Depth";
  reasons: string[];
};

export type DailyProviderHealth = {
  provider: string;
  classification?: import("@/src/types/news").NewsProviderClassification;
  status: "success" | "failed" | "disabled" | "fallback" | "empty";
  lastSuccess?: string;
  errorReason?: string;
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
  todaySignal?: string;
  topThreeThings?: DailyTopStory[];
  marketInterpretation?: string;
  investorWatchpoints?: string[];
  executiveSummary?: string[];
  macroWatch?: DailyWatchBlock;
  aiTechWatch?: DailyAiTechWatch;
  cryptoWatch?: DailyCryptoWatch;
  riskRegimeReasoning?: DailyRiskRegimeReasoning;
  fcnAwareness?: DailyFcnAwareness;
  ixuanView?: string;
  socialHooks?: DailySocialHooks;
  weeklySignals?: DailyWeeklySignals;
  marketMemory?: import("@/src/lib/intelligence/memory/types").MarketMemorySnapshot;
  whatChangedSinceLastBrief?: string;
  continuityTags?: string[];
  coverageScore?: DailyCoverageScore;
  contentQuality?: DailyContentQualityScore;
  providerHealth?: DailyProviderHealth[];
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
  coverageScore?: DailyCoverageScore;
  contentQuality?: DailyContentQualityScore;
  sourceStatus: {
    id: string;
    label: string;
    enabled: boolean;
    classification?: import("@/src/types/news").NewsProviderClassification;
    status: "success" | "failed" | "disabled" | "fallback" | "empty";
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
  // v1.43 — Daily Intelligence Core aggregation. Stored inside the
  // sections jsonb object so Weekly can inherit the Daily source of truth
  // without a Supabase schema migration.
  dailyCoreAggregation?: WeeklyDailyCoreAggregation;
};

export type WeeklyDailyCoreAggregation = {
  aggregationWindow: string;
  limitedHistory: boolean;
  recentSignals: string[];
  repeatedThemes: string[];
  risingThemes: string[];
  fadingThemes: string[];
  weeklyNarrative: string;
  whatChanged: string;
  ixuanViewSummary: string;
  nextWeekWatchpoints: string[];
  sourceBriefCount: number;
  sourceBriefSlugs: string[];
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
  revisionNumber?: number;
  parentWeeklyId?: string;
  isCanonical?: boolean;
  supersededAt?: string;
  supersededBy?: string;
  revisionNote?: string;
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
