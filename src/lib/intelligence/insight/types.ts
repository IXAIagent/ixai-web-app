import type { NewsCategory, NormalizedNewsItem } from "@/src/types/news";

export type IXAIInsightCategory =
  | "macro"
  | "ai-tech"
  | "taiwan"
  | "crypto"
  | "risk"
  | "fcn";

export type IXAIInsightPeriod = "daily" | "weekly" | "monthly" | "yearly";

export type IXAIKeyEvent = {
  title: string;
  sourceContext: string;
  category: IXAIInsightCategory;
  whyItMatters: string;
};

export type IXAIMarketSignal = {
  signal: string;
  evidence: string;
  implication: string;
};

export type IXAISocialFunnel = {
  hook: string;
  conflict: string;
  payoff: string;
  cta: string;
};

export type IXAIInsightOutput = {
  keyEvents: IXAIKeyEvent[];
  marketSignals: IXAIMarketSignal[];
  narrativeTension: string;
  whatChanged: string;
  whyItMatters: string;
  whatToWatchNext: string;
  ixuanView: string;
  socialFunnel: IXAISocialFunnel;
};

export type IXAIInsightInput = {
  newsItems: NormalizedNewsItem[];
  period: IXAIInsightPeriod;
  upcomingEvents?: {
    date?: string;
    title: string;
    whyItMatters?: string;
    category?: string;
  }[];
  continuityContext?: {
    narrative?: string;
    tags?: string[];
    watchpoints?: string[];
  };
};

export type InsightCategoryMap = Partial<Record<NewsCategory, IXAIInsightCategory>>;
