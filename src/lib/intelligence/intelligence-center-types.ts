import type { FCNIntelligenceCenterReadback } from "@/src/lib/fcn/intelligence-center";

export type IntelligenceCenterStatus = "error" | "placeholder" | "ready" | "unauthenticated";

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
  portfolioStatus: IntelligenceCenterSourceStatus[];
  sourceStatus: IntelligenceCenterSourceStatus[];
  stats: {
    cryptoCount: number;
    fcnCount: number;
    portfolioCount: number;
    stockCount: number;
  };
};
