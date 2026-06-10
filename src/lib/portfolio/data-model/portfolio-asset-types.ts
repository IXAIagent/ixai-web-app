import type {
  PortfolioInputAssetCategory,
  PortfolioInputRegion,
} from "@/src/lib/portfolio/input/asset-types";

export type PortfolioAssetMetadata = Record<string, boolean | null | number | string | string[]>;

export type PortfolioAsset = {
  accountId: string;
  category: PortfolioInputAssetCategory;
  createdAt: string;
  currency: string;
  id: string;
  metadata: PortfolioAssetMetadata;
  name: string;
  region: PortfolioInputRegion;
  symbol: string;
  updatedAt: string;
};
