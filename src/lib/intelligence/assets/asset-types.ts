import type { EditorialThemeId } from "@/src/lib/editorial/intelligence";
import type {
  EditorialProviderCoverageArea,
  EditorialProviderCoverageScore,
  EditorialProviderQualityScore,
} from "@/src/lib/editorial/providers";

export type AssetIntelligenceType =
  | "cash"
  | "crypto"
  | "etf"
  | "fcn"
  | "future_asset"
  | "stock"
  | "watchlist";

export type AssetIntelligenceStatus =
  | "active"
  | "archived"
  | "monitoring"
  | "placeholder"
  | "unavailable"
  | "unknown";

export type AssetHealthStatus = "degraded" | "healthy" | "offline" | "unknown";

export type AssetReadinessLevel = "green" | "red" | "yellow";

export type AssetStateStatus =
  | "available"
  | "limited"
  | "missing"
  | "not_applicable"
  | "unknown";

export type AssetMarket =
  | "cash"
  | "crypto"
  | "eu"
  | "future"
  | "global"
  | "hk"
  | "jp"
  | "kr"
  | "tw"
  | "unknown"
  | "us";

export type AssetCurrency =
  | "EUR"
  | "HKD"
  | "JPY"
  | "KRW"
  | "MIXED"
  | "TWD"
  | "USD"
  | "USDT"
  | "UNKNOWN";

export type AssetRelationshipType =
  | "same_fcn"
  | "same_portfolio"
  | "same_sector"
  | "same_symbol"
  | "same_theme"
  | "same_watchlist";

export type AssetState = {
  asOf?: string | null;
  detail?: string;
  source?: "derived" | "editorial" | "fallback" | "market" | "portfolio" | "watchlist";
  status: AssetStateStatus;
};

export type AssetPriceState = AssetState & {
  changePercent?: number | null;
  currency: AssetCurrency;
  price: number | null;
};

export type AssetRiskState = AssetState & {
  level: "attention" | "critical" | "normal" | "unknown";
};

export type AssetMonitoringState = AssetState & {
  enabled: boolean;
  scope: "manual" | "placeholder" | "portfolio" | "watchlist";
};

export type AssetCoverage = {
  areas: EditorialProviderCoverageArea[];
  missing: EditorialProviderCoverageArea[];
  score: number;
};

export type AssetQuality = {
  confidence: number;
  score: number;
  sourceDiversity: number;
};

export type AssetHealth = {
  reasons: string[];
  status: AssetHealthStatus;
};

export type AssetReadiness = {
  blockingIssues: string[];
  level: AssetReadinessLevel;
  nextAction: string;
  warningIssues: string[];
};

export type RelatedAssetReference = {
  id: string;
  label: string;
  relationship: AssetRelationshipType;
  symbol?: string;
};

export type AssetIntelligence = {
  assetType: AssetIntelligenceType;
  coverage: AssetCoverage;
  currency: AssetCurrency;
  displayName: string;
  eventState: AssetState;
  health: AssetHealth;
  id: string;
  lastUpdated: string;
  market: AssetMarket;
  monitoringState: AssetMonitoringState;
  newsState: AssetState;
  priceState: AssetPriceState;
  quality: AssetQuality;
  readiness: AssetReadiness;
  relatedAssets: RelatedAssetReference[];
  relatedFcn: RelatedAssetReference[];
  relatedWatchlist: RelatedAssetReference[];
  riskState: AssetRiskState;
  status: AssetIntelligenceStatus;
  symbol: string;
  themes: EditorialThemeId[];
};

export type AssetRelationship = {
  confidence: number;
  fromAssetId: string;
  reason: string;
  toAssetId: string;
  type: AssetRelationshipType;
};

export type AssetGraph = {
  assets: AssetIntelligence[];
  generatedAt: string;
  relationships: AssetRelationship[];
};

export type AssetSummaryBucket = {
  assetCount: number;
  label: string;
  score: number;
};

export type AssetSummary = {
  assetCount: number;
  coverageSummary: AssetSummaryBucket;
  generatedAt: string;
  marketSummary: AssetSummaryBucket;
  portfolioAssetSummary: AssetSummaryBucket;
  qualitySummary: AssetSummaryBucket;
  riskSummary: AssetSummaryBucket;
};

export type AssetDiagnostics = {
  assetCount: number;
  generatedAt: string;
  healthyAssets: number;
  missingCoverage: number;
  missingNews: number;
  missingPrice: number;
  offlineAssets: number;
  warningAssets: number;
};

export type AssetIntelligenceInput = {
  fcnPositions?: import("@/src/types/fcn-position").FCNPosition[];
  generatedAt?: string;
  portfolioPositions?: import("@/src/lib/portfolio/valuation/portfolio-valuation-types").PositionValuation[];
  watchlistItems?: import("@/src/lib/watchlist/watchlist-types").WorkspaceWatchlistItemReadback[];
};

export type AssetIntelligenceServiceResult = {
  assets: AssetIntelligence[];
  diagnostics: AssetDiagnostics;
  graph: AssetGraph;
  readiness: AssetReadiness;
  summary: AssetSummary;
};

export type AssetIntelligenceCoverageInput = {
  coverage?: EditorialProviderCoverageScore;
  quality?: EditorialProviderQualityScore;
};
