import type { PortfolioNewsItem } from "@/src/lib/portfolio/news/news-types";
import type { PortfolioCommentary } from "@/src/lib/portfolio/commentary/commentary-types";

export interface PortfolioCommentaryProvider {
  generateCommentary(
    newsItems: PortfolioNewsItem[],
  ): Promise<PortfolioCommentary[]>;
}
