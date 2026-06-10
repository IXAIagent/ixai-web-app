import type { PortfolioCrudAsset } from "@/src/lib/portfolio/crud/portfolio-crud-types";
import { mockPortfolioDataModelAssets } from "@/src/lib/portfolio/data-model/mock/mock-assets";

export const mockPortfolioAssets: PortfolioCrudAsset[] = mockPortfolioDataModelAssets.map(
  (asset, index) => ({
    category: asset.category,
    createdAt: asset.createdAt,
    currency: asset.currency,
    id: asset.id.replace("mock-asset", "mock-crud"),
    name: asset.name,
    notes: `Data model mock asset from account ${asset.accountId}.`,
    region: asset.region,
    status: index === 3 ? "draft" : "active",
    updatedAt: asset.updatedAt,
  }),
);
