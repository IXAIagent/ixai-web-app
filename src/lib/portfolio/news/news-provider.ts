import type { PortfolioNewsItem } from "@/src/lib/portfolio/news/news-types";

export type PortfolioNewsProvider = {
  getNewsForSymbols(symbols: string[]): Promise<PortfolioNewsItem[]>;
};
