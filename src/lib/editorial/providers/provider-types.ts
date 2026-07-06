import type {
  EditorialMarket,
  EditorialSourceKind,
  RawEditorialProviderItem,
} from "@/src/lib/editorial/editorial-types";

export type EditorialProviderStatus =
  | "healthy"
  | "degraded"
  | "offline"
  | "maintenance"
  | "unknown";

export type EditorialProviderCoverageArea =
  | "macro"
  | "us"
  | "taiwan"
  | "china"
  | "crypto"
  | "energy"
  | "fcn"
  | "macro_risk"
  | "ai"
  | "technology";

export type EditorialProviderCapability =
  | "daily_brief"
  | "weekly_brief"
  | "market_news"
  | "company_news"
  | "macro_events"
  | "crypto_news"
  | "structured_products"
  | "fallback";

export type EditorialProviderMetadata = {
  capabilities: EditorialProviderCapability[];
  coverage: EditorialProviderCoverageArea[];
  id: string;
  name: string;
  priority: number;
  status: EditorialProviderStatus;
  url?: string;
};

export type EditorialRawStory = {
  categories: string[];
  confidence: number;
  id: string;
  importance: number;
  markets: EditorialMarket[];
  providerId: string;
  providerName: string;
  providerTimestamp: string;
  providerUrl?: string;
  publishedAt?: string;
  sourceKind: EditorialSourceKind;
  summary: string;
  symbols: string[];
  title: string;
  url?: string;
};

export type EditorialProviderAdapter = {
  fetchStories?: () => Promise<EditorialRawStory[]>;
  getStories?: () => EditorialRawStory[];
  provider: EditorialProviderMetadata;
};

export type EditorialProviderHealth = {
  coverage: number;
  failureReason?: string;
  lastFailure?: string;
  lastSuccess?: string;
  latencyMs: number | null;
  providerId: string;
  providerName: string;
  status: EditorialProviderStatus;
};

export type EditorialProviderCacheEntry<T> = {
  createdAt: string;
  expiresAt: string;
  key: string;
  state: "fresh" | "stale" | "miss";
  value: T;
};

export type EditorialProviderCacheDiagnostics = {
  entries: number;
  freshEntries: number;
  staleEntries: number;
};

export type EditorialProviderCoverageScore = {
  areaScores: Record<EditorialProviderCoverageArea, number>;
  coveredAreas: EditorialProviderCoverageArea[];
  missingAreas: EditorialProviderCoverageArea[];
  overall: number;
};

export type EditorialProviderQualityScore = {
  availability: number;
  confidence: number;
  coverage: number;
  duplicates: number;
  freshness: number;
  latency: number;
  overall: number;
};

export type EditorialProviderFallbackState = {
  activeSource: "primary" | "secondary" | "cached" | "limited_brief" | "empty_state";
  cachedAvailable: boolean;
  fallbackReady: boolean;
  limitedBriefAvailable: boolean;
  primaryAvailable: boolean;
  secondaryAvailable: boolean;
};

export type EditorialProviderDiagnostics = {
  cache: EditorialProviderCacheDiagnostics;
  cacheHit: boolean;
  coverage: EditorialProviderCoverageScore;
  degradedProviders: string[];
  errors: string[];
  fallback: EditorialProviderFallbackState;
  fallbackLevel: EditorialProviderFallbackState["activeSource"];
  fetchResult: "real" | "cached" | "fallback" | "empty";
  healthyProviders: string[];
  offlineProviders: string[];
  publicationReadiness: "ready" | "limited" | "unavailable";
  quality: EditorialProviderQualityScore;
  registeredProviders: number;
  sourceStatus: "real" | "mock" | "mixed" | "empty";
};

export type EditorialProviderSourceResult = {
  diagnostics: EditorialProviderDiagnostics;
  health: EditorialProviderHealth[];
  rawStories: EditorialRawStory[];
  stories: RawEditorialProviderItem[];
};
