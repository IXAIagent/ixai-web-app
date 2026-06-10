import type {
  PortfolioInputAssetCategory,
  PortfolioInputRegion,
} from "@/src/lib/portfolio/input/asset-types";

export type PortfolioCrudAssetStatus = "active" | "archived" | "draft";

export type PortfolioCrudAsset = {
  category: PortfolioInputAssetCategory;
  createdAt: string;
  currency: string;
  id: string;
  name: string;
  notes?: string;
  region: PortfolioInputRegion;
  status: PortfolioCrudAssetStatus;
  updatedAt: string;
};

export type PortfolioCrudAssetInput = {
  category: PortfolioInputAssetCategory;
  currency: string;
  name: string;
  notes?: string;
  region: PortfolioInputRegion;
};

export type PortfolioCrudValidationResult = {
  errors: Partial<Record<keyof PortfolioCrudAssetInput, string>>;
  ok: boolean;
};
