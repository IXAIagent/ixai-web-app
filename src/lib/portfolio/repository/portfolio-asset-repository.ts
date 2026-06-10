import type { PortfolioAsset } from "@/src/lib/portfolio/data-model/portfolio-asset-types";

export type PortfolioAssetCreateInput = Omit<
  PortfolioAsset,
  "createdAt" | "id" | "updatedAt"
>;

export type PortfolioAssetUpdateInput = Partial<
  Omit<PortfolioAsset, "accountId" | "createdAt" | "id" | "updatedAt">
>;

export type PortfolioAssetRepository = {
  createAsset(input: PortfolioAssetCreateInput): Promise<PortfolioAsset>;
  deleteAsset(id: string): Promise<{ id: string; ok: boolean }>;
  getAssets(): Promise<PortfolioAsset[]>;
  updateAsset(id: string, input: PortfolioAssetUpdateInput): Promise<PortfolioAsset | null>;
};
