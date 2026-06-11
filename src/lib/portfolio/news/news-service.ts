import type { PortfolioAsset } from "@/src/lib/portfolio/data-model/portfolio-asset-types";
import { buildPortfolioNewsIntelligenceFoundation } from "@/src/lib/portfolio/intelligence/intelligence-builder";
import { mockNewsProvider } from "@/src/lib/portfolio/news/mock-news-provider";
import type { PortfolioNewsProvider } from "@/src/lib/portfolio/news/news-provider";
import type { PortfolioNewsFeed } from "@/src/lib/portfolio/news/news-types";

export async function buildPortfolioNewsFeed(input: {
  assets: PortfolioAsset[];
  newsProvider?: PortfolioNewsProvider;
}): Promise<PortfolioNewsFeed> {
  const universe = buildPortfolioNewsIntelligenceFoundation(input.assets);
  const provider = input.newsProvider ?? mockNewsProvider;
  const items = await provider.getNewsForSymbols(universe.symbols);

  return {
    items,
    newsCount: items.length,
    providerStatus: "mock_enabled",
    trackedSymbols: universe.symbols,
    universe,
  };
}
