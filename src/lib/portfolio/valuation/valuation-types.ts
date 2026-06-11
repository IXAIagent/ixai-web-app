import type { PortfolioAccount } from "@/src/lib/portfolio/data-model/portfolio-account-types";
import type { PortfolioAsset } from "@/src/lib/portfolio/data-model/portfolio-asset-types";
import type { PortfolioPosition } from "@/src/lib/portfolio/data-model/portfolio-position-types";
import type { PortfolioMarketSnapshot } from "@/src/lib/portfolio/market-data/market-data-types";

export interface PortfolioValuation {
  assetCount: number;
  generatedAt: string;
  positionCount: number;
  totalCostBasis: number;
  totalMarketValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
}

export interface PortfolioAllocationItem {
  key: string;
  label: string;
  marketValue: number;
  sharePercent: number;
}

export interface PortfolioAllocation {
  byAssetType: PortfolioAllocationItem[];
  byProvider: PortfolioAllocationItem[];
  byRegion: PortfolioAllocationItem[];
}

export interface PortfolioValuationReport {
  allocation: PortfolioAllocation;
  providerSource: "mock";
  valuation: PortfolioValuation;
}

export interface PortfolioValuationInput {
  accounts: PortfolioAccount[];
  assets: PortfolioAsset[];
  marketSnapshots: PortfolioMarketSnapshot[];
  positions: PortfolioPosition[];
}
