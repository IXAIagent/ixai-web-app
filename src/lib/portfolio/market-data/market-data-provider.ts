import type { PortfolioMarketSnapshot } from "@/src/lib/portfolio/market-data/market-data-types";

export interface PortfolioMarketDataProvider {
  getSnapshots(symbols: string[]): Promise<PortfolioMarketSnapshot[]>;
}
