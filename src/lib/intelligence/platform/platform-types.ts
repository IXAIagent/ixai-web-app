import type { EditorialProviderDiagnostics } from "@/src/lib/editorial/providers";
import type {
  AssetDiagnostics,
  AssetIntelligence,
  AssetSummary,
} from "@/src/lib/intelligence/assets";
import type {
  MonitoringDiagnostics,
  MonitoringEvent,
  TodayFocusItem,
} from "@/src/lib/intelligence/monitoring";
import type {
  NotificationDeliveryPreview,
} from "@/src/lib/intelligence/notifications";
import type { FcnPortfolioRiskSummary } from "@/src/lib/fcn/risk/fcn-risk-types";
import type { FcnPortfolioScheduleSummary } from "@/src/lib/fcn/schedule/fcn-schedule-types";
import type {
  PortfolioValuationResult,
  ValuationSourceStatus,
} from "@/src/lib/portfolio/valuation/portfolio-valuation-types";
import type { PortfolioRiskResult } from "@/src/lib/risk/risk-engine-types";
import type { WorkspaceWatchlistSummary } from "@/src/lib/watchlist/watchlist-types";

export type IntelligenceDomain =
  | "portfolio"
  | "market"
  | "risk"
  | "fcn"
  | "monitoring"
  | "data-quality";

export type IntelligenceSourceState =
  | "live"
  | "database"
  | "cache"
  | "local"
  | "fallback"
  | "limited"
  | "unavailable";

export type IntelligenceHealth =
  | "healthy"
  | "watch"
  | "elevated"
  | "critical"
  | "unknown";

export type IntelligencePriority = "urgent" | "high" | "normal" | "low";

export type IntelligenceConfidenceLevel =
  | "high"
  | "medium"
  | "low"
  | "limited"
  | "unknown";

export type IntelligenceConfidence = {
  fallbackActive: boolean;
  freshness: "fresh" | "stale" | "unknown";
  level: IntelligenceConfidenceLevel;
  limitations: string[];
  reasons: string[];
  score: number | null;
  sourceCoverage: IntelligenceSourceState[];
};

export type IntelligenceItem = {
  confidence: IntelligenceConfidence;
  domain: IntelligenceDomain;
  freshness: "fresh" | "stale" | "unknown";
  generatedAt: string;
  health: IntelligenceHealth;
  id: string;
  limitations: string[];
  priority: IntelligencePriority;
  relatedAssetIds: string[];
  relatedFcnIds: string[];
  relatedSymbols: string[];
  sourceState: IntelligenceSourceState;
  summary: string;
  title: string;
  whatToInspect: string;
  whyItMatters: string;
};

export type IntelligencePlatformSourceError = {
  message: string;
  source: string;
};

export type IntelligencePlatformContext = {
  assetDiagnostics: AssetDiagnostics | null;
  assetSummary: AssetSummary | null;
  assets: AssetIntelligence[];
  errors: IntelligencePlatformSourceError[];
  fcnRisk: FcnPortfolioRiskSummary | null;
  fcnSchedule: FcnPortfolioScheduleSummary | null;
  generatedAt: string;
  monitoringDiagnostics: MonitoringDiagnostics | null;
  monitoringEvents: MonitoringEvent[];
  notificationPreview: NotificationDeliveryPreview | null;
  portfolioRisk: PortfolioRiskResult | null;
  portfolioValuation: PortfolioValuationResult | null;
  providerDiagnostics: EditorialProviderDiagnostics | null;
  todayFocus: TodayFocusItem[];
  watchlist: WorkspaceWatchlistSummary | null;
};

export type IntelligenceSnapshotBase = {
  confidence: IntelligenceConfidence;
  generatedAt: string;
  health: IntelligenceHealth;
  items: IntelligenceItem[];
  limitations: string[];
  sourceState: IntelligenceSourceState;
};

export type PortfolioIntelligenceSnapshot = IntelligenceSnapshotBase & {
  domain: "portfolio";
  estimatedValue: number | null;
  positionCount: number;
  pricedPositionCount: number;
  topSymbols: string[];
};

export type MarketIntelligenceSnapshot = IntelligenceSnapshotBase & {
  domain: "market";
  affectedSymbols: string[];
  coverageAreas: string[];
  watchlistCount: number;
};

export type RiskIntelligenceSnapshot = IntelligenceSnapshotBase & {
  criticalCount: number;
  domain: "risk";
  elevatedCount: number;
  topRiskSymbols: string[];
};

export type FcnIntelligenceSnapshot = IntelligenceSnapshotBase & {
  domain: "fcn";
  fcnCount: number;
  observationEventCount: number;
  topRiskFcnIds: string[];
};

export type TodayFocusV2Item = IntelligenceItem & {
  focusRank: number;
};

export type TodayFocusV2Snapshot = {
  generatedAt: string;
  items: TodayFocusV2Item[];
  limitations: string[];
};

export type IntelligencePlatformDiagnostics = {
  blockingIssues: string[];
  confidenceCoverage: IntelligenceConfidence;
  degradedDomains: IntelligenceDomain[];
  domainCount: number;
  generatedAt: string;
  itemCount: number;
  rawProviderPayloadExposed: false;
  readiness: "green" | "yellow" | "red";
  requestScopedContext: true;
  singleModuleFailureSafe: true;
  sourceErrors: IntelligencePlatformSourceError[];
  warningIssues: string[];
};

export type IntelligencePlatformSnapshot = {
  diagnostics: IntelligencePlatformDiagnostics;
  fcn: FcnIntelligenceSnapshot;
  generatedAt: string;
  market: MarketIntelligenceSnapshot;
  portfolio: PortfolioIntelligenceSnapshot;
  risk: RiskIntelligenceSnapshot;
  todayFocus: TodayFocusV2Snapshot;
};

export type IntelligencePlatformServiceInput = {
  context?: IntelligencePlatformContext;
  generatedAt?: string;
  providerDiagnostics?: EditorialProviderDiagnostics | null;
};

export type SettledSource<T> = {
  data: T | null;
  error: IntelligencePlatformSourceError | null;
  source: string;
};

export type SourceStateInput =
  | IntelligenceSourceState
  | ValuationSourceStatus
  | "persisted"
  | "partial"
  | "ready"
  | "unavailable"
  | null
  | undefined;
