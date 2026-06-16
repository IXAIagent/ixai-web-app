import type {
  FCNIntelligenceCenterReadback,
  FCNIntelligenceRiskStatus,
  FCNTimelineEvent,
} from "@/src/lib/fcn/intelligence-center";
import type { PortfolioTruthReadback } from "@/src/lib/portfolio/truth/portfolio-truth-types";

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

export interface GlobalRiskCenterReadback {
  assetReadiness: GlobalRiskAssetReadiness[];
  dataSources: GlobalRiskDataSourceStatus[];
  fcn: FCNIntelligenceCenterReadback;
  fcnRiskBreakdown: Record<FCNIntelligenceRiskStatus, number>;
  generatedAt: string;
  portfolioTruth: PortfolioTruthReadback | null;
  riskScore: GlobalRiskScore;
  upcomingEvents: FCNTimelineEvent[];
}
