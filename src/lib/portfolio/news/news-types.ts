import type { PortfolioIntelligenceUniverse } from "@/src/lib/portfolio/intelligence/intelligence-types";

export type PortfolioNewsCategory =
  | "crypto"
  | "fcn_underlying"
  | "market_structure"
  | "stock";

export type PortfolioNewsItem = {
  category: PortfolioNewsCategory;
  id: string;
  publishedAt: string;
  source: string;
  summary: string;
  symbol: string;
  title: string;
  url: string;
};

export type PortfolioNewsFeed = {
  items: PortfolioNewsItem[];
  newsCount: number;
  providerStatus: "mock_enabled";
  trackedSymbols: string[];
  universe: PortfolioIntelligenceUniverse;
};
