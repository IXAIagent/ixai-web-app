import type {
  AssetClass,
  ValuationSourceStatus,
} from "@/src/lib/portfolio/valuation/portfolio-valuation-types";

export type RiskLevel = "critical" | "high" | "low" | "medium" | "unavailable";

export type RiskCategory =
  | "asset_allocation"
  | "concentration"
  | "crypto_exposure"
  | "data_quality"
  | "fcn_placeholder"
  | "market_data"
  | "unknown";

export type RiskSignalSeverity = "critical" | "high" | "info" | "warning";

export interface RiskSignal {
  affectedAssetClass?: AssetClass;
  affectedSymbols: string[];
  category: RiskCategory;
  createdAt: string;
  id: string;
  message: string;
  scoreImpact: number;
  severity: RiskSignalSeverity;
  sourceStatus: ValuationSourceStatus;
  title: string;
}

export interface RiskScoreBreakdown {
  category: RiskCategory;
  label: string;
  scoreImpact: number;
  signalCount: number;
}

export interface PortfolioRiskSummary {
  criticalSignalCount: number;
  highSignalCount: number;
  informationalOnlyDisclaimer: string;
  riskLevel: RiskLevel;
  riskScore: number | null;
  scoreBreakdown: RiskScoreBreakdown[];
  signalCount: number;
  sourceStatus: ValuationSourceStatus;
  topSignals: RiskSignal[];
  updatedAt: string;
  warningSignalCount: number;
}

export interface PortfolioRiskResult {
  signals: RiskSignal[];
  summary: PortfolioRiskSummary;
}
