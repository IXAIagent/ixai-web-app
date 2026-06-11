import type { PortfolioInputAssetCategory } from "@/src/lib/portfolio/input/asset-types";

export type PortfolioMarketStatus = "closed" | "mock_open" | "open";

export interface PortfolioMarketSnapshot {
  assetType: PortfolioInputAssetCategory;
  currency: string;
  dailyChangePercent: number;
  marketStatus: PortfolioMarketStatus;
  price: number;
  symbol: string;
  updatedAt: string;
}

export interface PortfolioMarketDataFeed {
  providerSource: "mock";
  snapshotCount: number;
  snapshots: PortfolioMarketSnapshot[];
  totalSymbols: number;
  trackedSymbols: string[];
  updatedAt: string;
}
