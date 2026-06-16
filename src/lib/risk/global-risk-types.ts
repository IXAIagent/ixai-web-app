import type {
  FCNIntelligenceCenterReadback,
  FCNIntelligenceRiskStatus,
  FCNPositionRiskReadback,
  FCNTimelineEvent,
} from "@/src/lib/fcn/intelligence-center";
import type {
  PortfolioTruthConcentrationRisk,
  PortfolioTruthDataQualityRisk,
  PortfolioTruthReadback,
  PortfolioTruthSymbolExposure,
} from "@/src/lib/portfolio/truth/portfolio-truth-types";

export type GlobalRiskDataStatus =
  | "error"
  | "partial"
  | "placeholder"
  | "ready"
  | "unauthenticated"
  | "unavailable";
export type GlobalRiskLevel = "ELEVATED" | "LOW" | "MODERATE" | "UNKNOWN";
export type GlobalRiskAssetClass = "CRYPTO" | "DUAL" | "FCN" | "GRID" | "STOCK";

export interface GlobalRiskAssetReadiness {
  count: number;
  label: string;
  note: string;
  source: string;
  status: GlobalRiskDataStatus;
  type: GlobalRiskAssetClass;
}

export interface GlobalRiskDataSourceStatus {
  label: string;
  note: string;
  status: GlobalRiskDataStatus;
}

export interface GlobalRiskScore {
  label: "Foundation Score";
  level: GlobalRiskLevel;
  score: number | null;
  summary: string;
}

export interface GlobalRiskFcnWorstOfSummary {
  highRiskCount: number;
  missingPriceCount: number;
  summary: string;
  unknownRiskCount: number;
  watchCount: number;
  worstPosition: FCNPositionRiskReadback | null;
}

export interface GlobalRiskIntelligenceReadback {
  concentrationRisk: PortfolioTruthConcentrationRisk;
  dataQualityRisk: PortfolioTruthDataQualityRisk;
  fcnWorstOfRisk: GlobalRiskFcnWorstOfSummary;
  topExposures: PortfolioTruthSymbolExposure[];
}

export interface GlobalRiskCenterReadback {
  assetReadiness: GlobalRiskAssetReadiness[];
  dataSources: GlobalRiskDataSourceStatus[];
  fcn: FCNIntelligenceCenterReadback;
  fcnRiskBreakdown: Record<FCNIntelligenceRiskStatus, number>;
  generatedAt: string;
  portfolioTruth: PortfolioTruthReadback | null;
  riskIntelligence: GlobalRiskIntelligenceReadback;
  riskScore: GlobalRiskScore;
  upcomingEvents: FCNTimelineEvent[];
}
