import type { FCNIntelligenceCenterReadback } from "@/src/lib/fcn/intelligence-center";
import type { PortfolioTruthReadback } from "@/src/lib/portfolio/truth/portfolio-truth-types";
import type { GlobalRiskCenterReadback } from "@/src/lib/risk/global-risk-types";

export type IntelligenceCenterStatus =
  | "error"
  | "partial"
  | "placeholder"
  | "ready"
  | "unauthenticated"
  | "unavailable";

export type IntelligenceCenterSourceStatus = {
  label: string;
  note: string;
  status: IntelligenceCenterStatus;
};

export type IntelligenceCenterEntry = {
  description: string;
  href: string;
  label: string;
  status: IntelligenceCenterStatus;
};

export type IntelligenceReadbackSummary = {
  note: string;
  status: IntelligenceCenterStatus;
  title: string;
  value: string;
};

export type IntelligenceExposureSummary = {
  note: string;
  topExposures: {
    occurrenceCount: number;
    sources: string[];
    symbol: string;
  }[];
  totalKnownSymbols: number;
};

export type IntelligenceReadinessWarningSummary = {
  sourceWarnings: IntelligenceCenterSourceStatus[];
  warningCount: number;
  warnings: string[];
};

export type IntelligenceCenterReadback = {
  commentaryReadiness: IntelligenceCenterSourceStatus[];
  entries: IntelligenceCenterEntry[];
  exposureIntelligenceSummary: IntelligenceExposureSummary;
  fcn: FCNIntelligenceCenterReadback;
  generatedAt: string;
  highlights: string[];
  marketSnapshot: IntelligenceCenterSourceStatus[];
  newsReadiness: IntelligenceCenterSourceStatus[];
  portfolioIntelligenceSummary: IntelligenceReadbackSummary[];
  portfolioTruth: PortfolioTruthReadback | null;
  portfolioStatus: IntelligenceCenterSourceStatus[];
  readinessWarningSummary: IntelligenceReadinessWarningSummary;
  riskReadback: GlobalRiskCenterReadback;
  riskSnapshotSummary: IntelligenceReadbackSummary[];
  sourceStatus: IntelligenceCenterSourceStatus[];
  stats: {
    cryptoCount: number;
    fcnCount: number;
    portfolioCount: number;
    stockCount: number;
  };
};
