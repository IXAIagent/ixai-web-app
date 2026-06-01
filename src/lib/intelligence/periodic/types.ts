import type { NormalizedNewsItem } from "@/src/types/news";

export type PeriodicIntelligencePeriod = "daily" | "weekly" | "monthly" | "yearly";

export type PeriodicIntelligenceInput = {
  period: PeriodicIntelligencePeriod;
  newsItems: NormalizedNewsItem[];
  upcomingEvents?: {
    date: string;
    title: string;
    whyItMatters: string;
    category: string;
  }[];
  continuityContext?: {
    tags?: string[];
    narrative?: string;
    watchpoints?: string[];
  };
};

export type PeriodicIntelligenceNarrative = {
  period: PeriodicIntelligencePeriod;
  whatHappened: string;
  whyItMatters: string;
  whatChanged: string;
  whatToWatchNext: string[];
  mainNarrative: string;
  riskNarrative: string;
  ixuanView: string;
  socialHook: string;
  socialConflict: string;
  socialPayoff: string;
  clearCTA: string;
  risingThemes: string[];
  fadingThemes: string[];
  dominantThemes: string[];
  sourceItemCount: number;
};
