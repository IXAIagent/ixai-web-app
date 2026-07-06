import type { EditorialThemeId } from "@/src/lib/editorial/intelligence";
import type { EditorialProviderDiagnostics } from "@/src/lib/editorial/providers";
import type {
  AssetDiagnostics,
  AssetGraph,
  AssetIntelligence,
  AssetIntelligenceInput,
  AssetIntelligenceType,
  AssetReadinessLevel,
} from "@/src/lib/intelligence/assets";

export type MonitoringEventType =
  | "crypto-volatility"
  | "data-quality"
  | "earnings"
  | "fcn-coupon"
  | "fcn-ki-risk"
  | "fcn-observation"
  | "macro-event"
  | "news-relevance"
  | "portfolio-risk"
  | "price-move"
  | "provider-fallback"
  | "watchlist-move";

export type MonitoringSeverity = "critical" | "info" | "warning";

export type MonitoringSource =
  | "asset-intelligence"
  | "deterministic-rule"
  | "editorial-intelligence"
  | "provider-diagnostics";

export type MonitoringEvent = {
  actionLabel: string;
  assetId: string;
  assetType: AssetIntelligenceType;
  confidence: number;
  eventType: MonitoringEventType;
  expiresAt: string;
  generatedAt: string;
  id: string;
  priorityScore: number;
  relatedAssetIds: string[];
  relatedFcnIds: string[];
  relatedThemes: EditorialThemeId[];
  severity: MonitoringSeverity;
  source: MonitoringSource;
  summary: string;
  title: string;
  whyItMatters: string;
};

export type MonitoringRuleContext = {
  assetDiagnostics?: AssetDiagnostics;
  assetGraph?: AssetGraph;
  assets: AssetIntelligence[];
  generatedAt: string;
  providerDiagnostics?: EditorialProviderDiagnostics | null;
};

export type MonitoringPriorityInput = {
  asset: AssetIntelligence;
  event: Omit<MonitoringEvent, "priorityScore">;
  generatedAt: string;
  providerDiagnostics?: EditorialProviderDiagnostics | null;
};

export type TodayFocusItem = {
  affectedAssets: string[];
  confidence: number;
  eventIds: string[];
  nextMonitorAction: string;
  summary: string;
  title: string;
  whyItMatters: string;
};

export type MonitoringTimelineBucket = {
  events: MonitoringEvent[];
  label: "expired" | "later" | "next_7_days" | "today";
};

export type MonitoringTimeline = {
  expired: MonitoringTimelineBucket;
  generatedAt: string;
  later: MonitoringTimelineBucket;
  next7Days: MonitoringTimelineBucket;
  today: MonitoringTimelineBucket;
};

export type MonitoringDiagnostics = {
  assetCoverage: number;
  blockingIssues: string[];
  criticalCount: number;
  eventCount: number;
  generatedAt: string;
  infoCount: number;
  providerFallbackCount: number;
  readiness: AssetReadinessLevel;
  staleDataCount: number;
  warningCount: number;
  warningIssues: string[];
};

export type MonitoringServiceInput = AssetIntelligenceInput & {
  assets?: AssetIntelligence[];
  generatedAt?: string;
  providerDiagnostics?: EditorialProviderDiagnostics | null;
};

export type MonitoringServiceResult = {
  diagnostics: MonitoringDiagnostics;
  events: MonitoringEvent[];
  timeline: MonitoringTimeline;
  todayFocus: TodayFocusItem[];
};

export type MonitoringRule = {
  id: string;
  run: (context: MonitoringRuleContext) => MonitoringEvent[];
};
