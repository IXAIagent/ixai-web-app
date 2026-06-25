import type { LegacyRiskEngineSnapshot, LegacyRiskLevel, LegacyRiskSourceStatus } from "@/src/lib/risk/legacy-risk-engine";
import type { MarketDataSnapshot } from "@/src/lib/market-data";

export type MorningBriefSourceStatus =
  | "ready"
  | "partial"
  | "placeholder"
  | "insufficient_data"
  | "unavailable";

export type MorningBriefSeverity = "info" | "warning" | "high" | "critical";

export type MorningBriefWarning = {
  message: string;
  severity: MorningBriefSeverity;
  source: string;
};

export type MorningBriefPortfolioSummary = {
  assetClassExposure: Array<{
    label: string;
    percent: number | null;
    positionCount: number;
  }>;
  currencyExposure: Array<{
    currency: string;
    percent: number | null;
    positionCount: number;
  }>;
  dataQuality: string;
  positionCount: number;
  sourceStatus: MorningBriefSourceStatus;
  totalKnownNotional: number | null;
};

export type MorningBriefRiskSummary = {
  criticalDrivers: string[];
  riskLevel: LegacyRiskLevel;
  riskScore: number | null;
  sourceEngine: "V15_LEGACY_RISK_ENGINE";
  sourceStatus: MorningBriefSourceStatus;
  warnings: MorningBriefWarning[];
};

export type MorningBriefFcnSummary = {
  criticalCount: number;
  highRiskCount: number;
  insufficientDataCount: number;
  repeatedUnderlyings: Array<{
    occurrenceCount: number;
    symbol: string;
  }>;
  sourceStatus: MorningBriefSourceStatus;
  topRiskPositions: Array<{
    kiDistancePercent: number | null;
    name: string;
    riskLevel: LegacyRiskLevel;
    strikeDistancePercent: number | null;
    worstOfPerformancePercent: number | null;
    worstOfSymbol: string | null;
  }>;
};

export type MorningBriefNewsSummary = {
  coverage: string[];
  lastRefresh: string | null;
  newsSource: "placeholder";
  sourceStatus: "placeholder";
  status: "not_configured";
};

export type MorningBriefMarketDataSummary = {
  dataQuality: string;
  liveExternalFeedEnabled: false;
  manualProviderSnapshotSupported: true;
  providerStatus: string;
  quoteCount: number;
  source: string;
  sourceStatus: MorningBriefSourceStatus;
  warnings: string[];
};

export type MorningBriefDataQuality = {
  sourceStatus: MorningBriefSourceStatus;
  warnings: MorningBriefWarning[];
};

export type MorningBriefDiagnostics = {
  aiRecommendationEnabled: false;
  brokerEnabled: false;
  dbWritesEnabled: false;
  externalApiCallsEnabled: false;
  fcnSource: string;
  generatedAt: string;
  liveExternalFeedEnabled: false;
  marketDataInputSupported: true;
  marketDataSource: string;
  manualProviderSnapshotSupported: true;
  newsPlaceholderOnly: true;
  newsSource: string;
  phase: "V16_MORNING_BRIEF_ENGINE";
  portfolioSource: string;
  readOnly: true;
  recommendationLogicEnabled: false;
  riskEngineSource: string;
  schedulerEnabled: false;
  telegramEnabled: false;
};

export type MorningBrief = {
  dataQuality: MorningBriefDataQuality;
  date: string;
  diagnostics: MorningBriefDiagnostics;
  fcnSummary: MorningBriefFcnSummary;
  limitations: string[];
  marketDataSummary: MorningBriefMarketDataSummary;
  newsSummary: MorningBriefNewsSummary;
  portfolioSummary: MorningBriefPortfolioSummary;
  riskSummary: MorningBriefRiskSummary;
  sourceSnapshot: Pick<LegacyRiskEngineSnapshot, "generatedAt" | "phase"> | null;
  warnings: MorningBriefWarning[];
};

export type MorningSnapshot = {
  brief: MorningBrief;
  generatedAt: string;
  headline: string;
  readOnly: true;
  sections: Array<{
    label: string;
    sourceStatus: MorningBriefSourceStatus;
    summary: string;
  }>;
};

export type BuildMorningBriefInput = {
  legacyRiskSnapshot: LegacyRiskEngineSnapshot | null;
  marketDataSnapshot?: MarketDataSnapshot | null;
};

export function mapLegacyStatus(status: LegacyRiskSourceStatus): MorningBriefSourceStatus {
  if (status === "ready") return "ready";
  if (status === "fallback") return "partial";
  return status;
}
