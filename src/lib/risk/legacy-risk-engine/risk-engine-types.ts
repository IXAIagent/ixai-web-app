import type { PortfolioTruthReadback } from "@/src/lib/portfolio/truth/portfolio-truth-types";

export type LegacyRiskLevel =
  | "low"
  | "moderate"
  | "elevated"
  | "high"
  | "critical"
  | "insufficient_data";

export type LegacyRiskSourceStatus =
  | "ready"
  | "partial"
  | "fallback"
  | "insufficient_data"
  | "unavailable";

export type LegacyRiskDataQualityStatus = "complete" | "partial" | "insufficient_data";

export type LegacyRiskWarning = {
  code: string;
  message: string;
  severity: "info" | "warning" | "high" | "critical";
};

export type LegacyRiskExposureBucket = {
  label: string;
  notional: number | null;
  percent: number | null;
  positionCount: number;
  sourceStatus: LegacyRiskSourceStatus;
};

export type LegacyRiskCurrencyExposure = {
  currency: string;
  notional: number | null;
  percent: number | null;
  positionCount: number;
};

export type LegacyRiskSymbolExposure = {
  occurrenceCount: number;
  percentOfPositions: number | null;
  sources: string[];
  symbol: string;
};

export type LegacyPortfolioRiskSummary = {
  assetClassExposure: LegacyRiskExposureBucket[];
  criticalDrivers: string[];
  currencyExposure: LegacyRiskCurrencyExposure[];
  dataQuality: {
    sourceStatus: LegacyRiskDataQualityStatus;
    warningCount: number;
  };
  generatedAt: string;
  positionCount: number;
  riskLevel: LegacyRiskLevel;
  riskScore: number | null;
  singleNameConcentration: LegacyRiskSymbolExposure | null;
  sourceStatus: LegacyRiskSourceStatus;
  totalKnownNotional: number | null;
  warnings: LegacyRiskWarning[];
};

export type LegacyFcnUnderlyingRisk = {
  currentPrice: number | null;
  distanceToKiPercent: number | null;
  distanceToKoPercent: number | null;
  distanceToStrikePercent: number | null;
  hasBreachedKi: boolean;
  hasReachedKo: boolean;
  initialPrice: number | null;
  isWorstOf: boolean;
  kiPrice: number | null;
  koPrice: number | null;
  performancePercent: number | null;
  sourceStatus: LegacyRiskSourceStatus;
  strikePrice: number | null;
  symbol: string;
  warningMessage?: string;
};

export type LegacyFcnPositionRisk = {
  id: string;
  name: string;
  nearestKiDistancePercent: number | null;
  nearestKoDistancePercent: number | null;
  nearestStrikeDistancePercent: number | null;
  riskLevel: LegacyRiskLevel;
  sourceStatus: LegacyRiskSourceStatus;
  underlyings: LegacyFcnUnderlyingRisk[];
  warnings: LegacyRiskWarning[];
  worstOfPerformancePercent: number | null;
  worstOfSymbol: string | null;
};

export type LegacyFcnRiskSummary = {
  criticalCount: number;
  generatedAt: string;
  highRiskCount: number;
  insufficientDataCount: number;
  positionCount: number;
  positions: LegacyFcnPositionRisk[];
  sourceStatus: LegacyRiskSourceStatus;
  topRiskPositions: LegacyFcnPositionRisk[];
  warnings: LegacyRiskWarning[];
};

export type LegacyConcentrationRiskSummary = {
  fcnRepeatedUnderlyings: LegacyRiskSymbolExposure[];
  generatedAt: string;
  riskLevel: LegacyRiskLevel;
  sourceStatus: LegacyRiskSourceStatus;
  topExposures: LegacyRiskSymbolExposure[];
  warnings: LegacyRiskWarning[];
};

export type LegacyExposureRiskSummary = {
  assetClassExposure: LegacyRiskExposureBucket[];
  currencyExposure: LegacyRiskCurrencyExposure[];
  generatedAt: string;
  sourceStatus: LegacyRiskSourceStatus;
  topSymbols: LegacyRiskSymbolExposure[];
  warnings: LegacyRiskWarning[];
};

export type LegacyRiskEngineDiagnostics = {
  actionableTradingInstructions: false;
  calculationOnly: true;
  dataSource: "portfolio_truth_layer";
  dbWritesEnabled: false;
  fallbackPreserved: true;
  generatedAt: string;
  inputReadiness: PortfolioTruthReadback["readinessLevel"] | "unavailable";
  limitationCount: number;
  modules: Array<{
    name: string;
    sourceStatus: LegacyRiskSourceStatus;
  }>;
  phase: "V15_LEGACY_RISK_ENGINE_MIGRATION";
  recommendationLogicEnabled: false;
};

export type LegacyRiskEngineSnapshot = {
  concentrationRisk: LegacyConcentrationRiskSummary;
  diagnostics: LegacyRiskEngineDiagnostics;
  exposureRisk: LegacyExposureRiskSummary;
  fcnRisk: LegacyFcnRiskSummary;
  generatedAt: string;
  informationalOnlyDisclaimer: string;
  limitations: string[];
  phase: "V15_LEGACY_RISK_ENGINE_MIGRATION";
  portfolioRisk: LegacyPortfolioRiskSummary;
};
