import type { PortfolioAccount } from "@/src/lib/portfolio/data-model/portfolio-account-types";
import type { PortfolioAsset } from "@/src/lib/portfolio/data-model/portfolio-asset-types";
import type { PortfolioPosition } from "@/src/lib/portfolio/data-model/portfolio-position-types";
import type { PortfolioMarketDataFeed } from "@/src/lib/portfolio/market-data/market-data-types";
import { mockPortfolioValuationEngine } from "@/src/lib/portfolio/valuation/mock-valuation-engine";
import type { PortfolioValuationEngine } from "@/src/lib/portfolio/valuation/valuation-engine";
import type { PortfolioValuationReport } from "@/src/lib/portfolio/valuation/valuation-types";

export async function buildPortfolioValuation(input: {
  accounts: PortfolioAccount[];
  assets: PortfolioAsset[];
  marketDataFeed: PortfolioMarketDataFeed;
  positions: PortfolioPosition[];
  valuationEngine?: PortfolioValuationEngine;
}): Promise<PortfolioValuationReport> {
  const engine = input.valuationEngine ?? mockPortfolioValuationEngine;

  return engine.generateValuation({
    accounts: input.accounts,
    assets: input.assets,
    marketSnapshots: input.marketDataFeed.snapshots,
    positions: input.positions,
  });
}
