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
