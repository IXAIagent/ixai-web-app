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

export type IXAIEvidenceItem = {
  event: string;
  source: string;
  whyItMatters: string;
  category: IXAIInsightCategory;
  score: number;
};

export type IXAISocialFunnel = {
  hook: string;
  conflict: string;
  payoff: string;
  cta: string;
};

export type InsightNarrative = {
  tension: string;
  whyNow: string;
  ixuanView: string;
  watchNext: string;
};

export type QuestionDrivenInsight = {
  centralQuestion: string;
  keyAnswer: string;
  evidence: string[];
  evidenceDetails: IXAIEvidenceItem[];
  counterEvidence: string[];
  whatChangesMyMind: string[];
  watchNext: string[];
  ixuanView: string;
};

export type IXAIInsightOutput = {
  keyEvents: IXAIKeyEvent[];
  marketSignals: IXAIMarketSignal[];
  narrativeTension: string;
  whyNow: string;
  whatChanged: string;
  whyItMatters: string;
  whatToWatchNext: string;
  ixuanView: string;
  insightNarrative: InsightNarrative;
  questionDriven: QuestionDrivenInsight;
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
