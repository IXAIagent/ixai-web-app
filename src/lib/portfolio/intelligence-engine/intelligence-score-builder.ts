import type { PortfolioAccount } from "@/src/lib/portfolio/data-model/portfolio-account-types";
import type { PortfolioAsset } from "@/src/lib/portfolio/data-model/portfolio-asset-types";
import { buildPortfolioCommentary } from "@/src/lib/portfolio/commentary/commentary-builder";
import type { PortfolioCommentaryFeed } from "@/src/lib/portfolio/commentary/commentary-types";
import type { PortfolioCommentaryProvider } from "@/src/lib/portfolio/commentary/commentary-provider";
import type { PortfolioIntelligenceEngine } from "@/src/lib/portfolio/intelligence-engine/intelligence-engine";
import type { PortfolioIntelligenceScore } from "@/src/lib/portfolio/intelligence-engine/intelligence-engine-types";
import { mockPortfolioIntelligenceEngine } from "@/src/lib/portfolio/intelligence-engine/mock-intelligence-engine";
import { buildPortfolioNewsFeed } from "@/src/lib/portfolio/news/news-service";
import type { PortfolioNewsProvider } from "@/src/lib/portfolio/news/news-provider";
import type { PortfolioNewsFeed } from "@/src/lib/portfolio/news/news-types";

export async function buildPortfolioIntelligence(input: {
  accounts: PortfolioAccount[];
  assets: PortfolioAsset[];
  commentary?: PortfolioCommentaryFeed;
  commentaryProvider?: PortfolioCommentaryProvider;
  intelligenceEngine?: PortfolioIntelligenceEngine;
  newsFeed?: PortfolioNewsFeed;
  newsProvider?: PortfolioNewsProvider;
}): Promise<PortfolioIntelligenceScore> {
  const newsFeed =
    input.newsFeed ??
    (await buildPortfolioNewsFeed({
      assets: input.assets,
      newsProvider: input.newsProvider,
    }));
  const commentary =
    input.commentary ??
    (await buildPortfolioCommentary({
      commentaryProvider: input.commentaryProvider,
      newsFeed,
    }));
  const engine = input.intelligenceEngine ?? mockPortfolioIntelligenceEngine;

  return engine.generateIntelligence({
    accounts: input.accounts,
    assets: input.assets,
    commentary,
    news: newsFeed,
  });
}
