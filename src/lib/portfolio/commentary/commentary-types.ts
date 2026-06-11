export type PortfolioCommentarySentiment =
  | "bearish"
  | "bullish"
  | "neutral"
  | "risk_watch"
  | "volatile";

export type PortfolioCommentaryRiskLevel = "high" | "low" | "medium";

export type PortfolioCommentaryCategory =
  | "crypto"
  | "dual"
  | "fcn_underlying"
  | "grid"
  | "portfolio"
  | "stock";

export interface PortfolioCommentary {
  category: PortfolioCommentaryCategory;
  confidence: number;
  generatedAt: string;
  headline: string;
  id: string;
  riskLevel: PortfolioCommentaryRiskLevel;
  sentiment: PortfolioCommentarySentiment;
  summary: string;
  symbol: string;
}

export type PortfolioCommentaryFeed = {
  bearishCount: number;
  bullishCount: number;
  commentaryCount: number;
  generatedAt: string;
  items: PortfolioCommentary[];
  neutralCount: number;
  providerStatus: "mock_enabled";
  riskWatchCount: number;
  volatileCount: number;
};
