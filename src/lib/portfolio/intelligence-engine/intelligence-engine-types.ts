import type { PortfolioAsset } from "@/src/lib/portfolio/data-model/portfolio-asset-types";
import type { PortfolioAccount } from "@/src/lib/portfolio/data-model/portfolio-account-types";
import type { PortfolioCommentaryFeed } from "@/src/lib/portfolio/commentary/commentary-types";
import type { PortfolioNewsFeed } from "@/src/lib/portfolio/news/news-types";

export type PortfolioIntelligenceRating =
  | "elevated"
  | "excellent"
  | "good"
  | "high_risk"
  | "moderate";

export interface PortfolioIntelligenceScore {
  concentrationScore: number;
  diversificationScore: number;
  generatedAt: string;
  healthScore: number;
  id: string;
  overallRating: PortfolioIntelligenceRating;
  riskScore: number;
  summary: string;
}

export type PortfolioIntelligenceEngineInput = {
  accounts: PortfolioAccount[];
  assets: PortfolioAsset[];
  commentary: PortfolioCommentaryFeed;
  news: PortfolioNewsFeed;
};
