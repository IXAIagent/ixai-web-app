import type { FCNIntelligenceCenterReadback } from "@/src/lib/fcn/intelligence-center";
import type { PortfolioTruthReadback } from "@/src/lib/portfolio/truth/portfolio-truth-types";

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

export type IntelligenceCenterReadback = {
  commentaryReadiness: IntelligenceCenterSourceStatus[];
  entries: IntelligenceCenterEntry[];
  fcn: FCNIntelligenceCenterReadback;
  generatedAt: string;
  highlights: string[];
  marketSnapshot: IntelligenceCenterSourceStatus[];
  newsReadiness: IntelligenceCenterSourceStatus[];
  portfolioTruth: PortfolioTruthReadback | null;
  portfolioStatus: IntelligenceCenterSourceStatus[];
  sourceStatus: IntelligenceCenterSourceStatus[];
  stats: {
    cryptoCount: number;
    fcnCount: number;
    portfolioCount: number;
    stockCount: number;
  };
};
