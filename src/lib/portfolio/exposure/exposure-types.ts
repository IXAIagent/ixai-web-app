import type { PortfolioAccount } from "@/src/lib/portfolio/data-model/portfolio-account-types";
import type { PortfolioAsset } from "@/src/lib/portfolio/data-model/portfolio-asset-types";
import type { PortfolioMarketDataFeed } from "@/src/lib/portfolio/market-data/market-data-types";
import type { PortfolioValuationReport } from "@/src/lib/portfolio/valuation/valuation-types";

export type PortfolioExposureCategory =
  | "asset_type"
  | "cash"
  | "crypto"
  | "fcn_underlying"
  | "provider"
  | "region";

export interface PortfolioExposureItem {
  category: PortfolioExposureCategory;
  key: string;
  label: string;
  marketValue: number;
  percentage: number;
}

export interface PortfolioExposureReport {
  assetTypeExposure: PortfolioExposureItem[];
  generatedAt: string;
  id: string;
  providerExposure: PortfolioExposureItem[];
  regionExposure: PortfolioExposureItem[];
  summary: string;
  symbolExposure: PortfolioExposureItem[];
  topExposures: PortfolioExposureItem[];
  totalMarketValue: number;
}

export interface PortfolioExposureInput {
  accounts: PortfolioAccount[];
  assets: PortfolioAsset[];
  marketDataFeed: PortfolioMarketDataFeed;
  valuationReport: PortfolioValuationReport;
}
