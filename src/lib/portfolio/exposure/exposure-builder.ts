import type { PortfolioAccount } from "@/src/lib/portfolio/data-model/portfolio-account-types";
import type { PortfolioAsset } from "@/src/lib/portfolio/data-model/portfolio-asset-types";
import type { PortfolioPosition } from "@/src/lib/portfolio/data-model/portfolio-position-types";
import { buildPortfolioMarketSnapshots } from "@/src/lib/portfolio/market-data/market-data-builder";
import type { PortfolioMarketDataFeed } from "@/src/lib/portfolio/market-data/market-data-types";
import { buildPortfolioValuation } from "@/src/lib/portfolio/valuation/valuation-builder";
import type { PortfolioValuationReport } from "@/src/lib/portfolio/valuation/valuation-types";
import { mockPortfolioExposureEngine } from "@/src/lib/portfolio/exposure/mock-exposure-engine";
import type { PortfolioExposureEngine } from "@/src/lib/portfolio/exposure/exposure-engine";
import type { PortfolioExposureReport } from "@/src/lib/portfolio/exposure/exposure-types";

export async function buildPortfolioExposure(input: {
  accounts: PortfolioAccount[];
  assets: PortfolioAsset[];
  exposureEngine?: PortfolioExposureEngine;
  marketDataFeed?: PortfolioMarketDataFeed;
  positions: PortfolioPosition[];
  valuationReport?: PortfolioValuationReport;
}): Promise<PortfolioExposureReport> {
  const marketDataFeed =
    input.marketDataFeed ?? (await buildPortfolioMarketSnapshots({ assets: input.assets }));
  const valuationReport =
    input.valuationReport ??
    (await buildPortfolioValuation({
      accounts: input.accounts,
      assets: input.assets,
      marketDataFeed,
      positions: input.positions,
    }));
  const engine = input.exposureEngine ?? mockPortfolioExposureEngine;

  return engine.generateExposure({
    accounts: input.accounts,
    assets: input.assets,
    marketDataFeed,
    valuationReport,
  });
}
