export type EditorialProductLine = "daily" | "weekly";

export type EditorialSourceKind =
  | "news"
  | "rss"
  | "exchange_announcement"
  | "company_filing"
  | "market_data"
  | "crypto"
  | "manual"
  | "fallback";

export type EditorialSourceStatus =
  | "available"
  | "degraded"
  | "failed"
  | "disabled"
  | "placeholder";

export type EditorialFailureCode =
  | "no_sources"
  | "provider_failed"
  | "low_confidence"
  | "duplicate_stories"
  | "missing_ai_provider"
  | "social_pack_failed"
  | "normalization_failed"
  | "unknown";

export type EditorialSeverity = "info" | "warning" | "critical";

export type EditorialSource = {
  id: string;
  label: string;
  kind: EditorialSourceKind;
  providerKey?: string;
  status: EditorialSourceStatus;
  confidence: number;
  fetchedAt?: string;
  url?: string;
  failure?: EditorialFailureState;
};

export type EditorialFailureState = {
  code: EditorialFailureCode;
  severity: EditorialSeverity;
  message: string;
  degraded: boolean;
  publishBlocking: boolean;
  fallbackUsed?: "cached" | "limited_brief" | "rule_based_summary" | "in_app_only" | "none";
};

export type EditorialMarket = "global" | "us" | "tw" | "hk" | "jp" | "kr" | "eu" | "crypto";

export type EditorialStory = {
  id: string;
  title: string;
  summary: string;
  url?: string;
  source: EditorialSource;
  publishedAt?: string;
  updatedAt?: string;
  markets: EditorialMarket[];
  symbols: string[];
  categories: string[];
  importance: number;
  freshness: number;
  marketRelevance: number;
  duplicationRisk: number;
  sourceConfidence: number;
  rankingScore?: number;
  duplicateOf?: string;
};

export type EditorialTopic = {
  id: string;
  title: string;
  summary: string;
  stories: EditorialStory[];
  importance: number;
  storyCount: number;
  sourceDiversity: number;
  marketImpact: number;
  rankingScore?: number;
};

export type EditorialNarrative = {
  productLine: EditorialProductLine;
  title: string;
  marketSummary: string;
  whyItMatters: string;
  keyPoints: string[];
  topics: EditorialTopic[];
  limited: boolean;
  complianceNote: string;
};

export type EditorialQualitySignal = {
  id: string;
  label: string;
  status: "pass" | "degraded" | "fail";
  severity: EditorialSeverity;
  detail: string;
};

export type EditorialBrief = {
  id: string;
  productLine: EditorialProductLine;
  generatedAt: string;
  status: "ready" | "limited" | "unavailable";
  sources: EditorialSource[];
  stories: EditorialStory[];
  topics: EditorialTopic[];
  narrative: EditorialNarrative;
  qualitySignals: EditorialQualitySignal[];
  failures: EditorialFailureState[];
};

export type RawEditorialProviderItem = {
  id?: string;
  title?: string;
  headline?: string;
  summary?: string;
  description?: string;
  url?: string;
  sourceId?: string;
  sourceLabel?: string;
  sourceKind?: EditorialSourceKind;
  providerKey?: string;
  publishedAt?: string;
  updatedAt?: string;
  markets?: EditorialMarket[];
  symbols?: string[];
  categories?: string[];
  importance?: number;
  confidence?: number;
};

export type EditorialPipelineDiagnostics = {
  ready: boolean;
  providerIndependence: EditorialQualitySignal;
  fallbackReadiness: EditorialQualitySignal;
  publicationDependency: EditorialQualitySignal;
  sourceCount: number;
  storyCount: number;
  topicCount: number;
  failures: EditorialFailureState[];
  notes: string[];
};
