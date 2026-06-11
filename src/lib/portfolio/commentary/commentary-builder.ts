import type { PortfolioCommentaryProvider } from "@/src/lib/portfolio/commentary/commentary-provider";
import type {
  PortfolioCommentary,
  PortfolioCommentaryFeed,
  PortfolioCommentarySentiment,
} from "@/src/lib/portfolio/commentary/commentary-types";
import { mockCommentaryProvider } from "@/src/lib/portfolio/commentary/mock-commentary-provider";
import type { PortfolioNewsFeed } from "@/src/lib/portfolio/news/news-types";

function countBySentiment(
  items: PortfolioCommentary[],
  sentiment: PortfolioCommentarySentiment,
) {
  return items.filter((item) => item.sentiment === sentiment).length;
}

export async function buildPortfolioCommentary(input: {
  commentaryProvider?: PortfolioCommentaryProvider;
  newsFeed: PortfolioNewsFeed;
}): Promise<PortfolioCommentaryFeed> {
  const provider = input.commentaryProvider ?? mockCommentaryProvider;
  const items = await provider.generateCommentary(input.newsFeed.items);

  return {
    bearishCount: countBySentiment(items, "bearish"),
    bullishCount: countBySentiment(items, "bullish"),
    commentaryCount: items.length,
    generatedAt: "2026-06-11T00:00:00.000Z",
    items,
    neutralCount: countBySentiment(items, "neutral"),
    providerStatus: "mock_enabled",
    riskWatchCount: countBySentiment(items, "risk_watch"),
    volatileCount: countBySentiment(items, "volatile"),
  };
}
