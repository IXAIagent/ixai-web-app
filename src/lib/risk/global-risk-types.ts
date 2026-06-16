import type {
  FCNIntelligenceCenterReadback,
  FCNIntelligenceRiskStatus,
  FCNTimelineEvent,
} from "@/src/lib/fcn/intelligence-center";

export type GlobalRiskDataStatus = "error" | "placeholder" | "ready" | "unauthenticated";
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
  riskScore: GlobalRiskScore;
  upcomingEvents: FCNTimelineEvent[];
}
