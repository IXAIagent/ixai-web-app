import type { PortfolioAsset } from "@/src/lib/portfolio/data-model/portfolio-asset-types";
import { buildPortfolioNewsIntelligenceFoundation } from "@/src/lib/portfolio/intelligence/intelligence-builder";
import { mockMarketDataProvider } from "@/src/lib/portfolio/market-data/mock-market-data-provider";
import type { PortfolioMarketDataProvider } from "@/src/lib/portfolio/market-data/market-data-provider";
import type { PortfolioMarketDataFeed } from "@/src/lib/portfolio/market-data/market-data-types";

export async function buildPortfolioMarketSnapshots(input: {
  assets: PortfolioAsset[];
  marketDataProvider?: PortfolioMarketDataProvider;
}): Promise<PortfolioMarketDataFeed> {
  const universe = buildPortfolioNewsIntelligenceFoundation(input.assets);
  const provider = input.marketDataProvider ?? mockMarketDataProvider;
  const snapshots = await provider.getSnapshots(universe.symbols);
  const updatedAt = snapshots[0]?.updatedAt ?? "2026-06-11T00:00:00.000Z";

  return {
    providerSource: "mock",
    snapshotCount: snapshots.length,
    snapshots,
    totalSymbols: universe.totalTrackedSymbols,
    trackedSymbols: universe.symbols,
    updatedAt,
  };
}
