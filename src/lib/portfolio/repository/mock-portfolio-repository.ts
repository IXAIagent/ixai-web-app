import type { PortfolioAsset } from "@/src/lib/portfolio/data-model/portfolio-asset-types";
import type { PortfolioPosition } from "@/src/lib/portfolio/data-model/portfolio-position-types";
import { mockPortfolioAccounts } from "@/src/lib/portfolio/data-model/mock/mock-accounts";
import { mockPortfolioDataModelAssets } from "@/src/lib/portfolio/data-model/mock/mock-assets";
import { mockPortfolioPositions } from "@/src/lib/portfolio/data-model/mock/mock-positions";
import type { PortfolioRepository } from "@/src/lib/portfolio/repository/portfolio-repository";
import type {
  PortfolioAssetCreateInput,
  PortfolioAssetUpdateInput,
} from "@/src/lib/portfolio/repository/portfolio-asset-repository";
import type {
  PortfolioPositionCreateInput,
  PortfolioPositionUpdateInput,
} from "@/src/lib/portfolio/repository/portfolio-position-repository";

function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}`;
}

export function createMockPortfolioRepository(): PortfolioRepository {
  let assets = [...mockPortfolioDataModelAssets];
  let positions = [...mockPortfolioPositions];

  return {
    async createAsset(input: PortfolioAssetCreateInput) {
      const now = new Date().toISOString();
      const asset: PortfolioAsset = {
        ...input,
        createdAt: now,
        id: createId("mock-repository-asset"),
        updatedAt: now,
      };
      assets = [asset, ...assets];
      return asset;
    },

    async createPosition(input: PortfolioPositionCreateInput) {
      const now = new Date().toISOString();
      const position: PortfolioPosition = {
        ...input,
        createdAt: now,
        id: createId("mock-repository-position"),
        updatedAt: now,
      };
      positions = [position, ...positions];
      return position;
    },

    async deleteAsset(id: string) {
      const before = assets.length;
      assets = assets.filter((asset) => asset.id !== id);
      positions = positions.filter((position) => position.assetId !== id);
      return {
        id,
        ok: assets.length !== before,
      };
    },

    async deletePosition(id: string) {
      const before = positions.length;
      positions = positions.filter((position) => position.id !== id);
      return {
        id,
        ok: positions.length !== before,
      };
    },

    async getAccounts() {
      return [...mockPortfolioAccounts];
    },

    async getAssets() {
      return [...assets];
    },

    async getOwnershipValidationStatus() {
      return {
        accountCount: mockPortfolioAccounts.length,
        assetCount: assets.length,
        currentAccountId: mockPortfolioAccounts[0]?.id ?? null,
        currentUserId: mockPortfolioAccounts[0]?.userId ?? "mock-user",
        positionCount: positions.length,
        repositorySource: "mock_repository",
        rlsStatus: "mock_only",
      };
    },

    async getPositions() {
      return [...positions];
    },

    async updateAsset(id: string, input: PortfolioAssetUpdateInput) {
      let updatedAsset: PortfolioAsset | null = null;
      assets = assets.map((asset) => {
        if (asset.id !== id) {
          return asset;
        }
        updatedAsset = {
          ...asset,
          ...input,
          updatedAt: new Date().toISOString(),
        };
        return updatedAsset;
      });
      return updatedAsset;
    },

    async updatePosition(id: string, input: PortfolioPositionUpdateInput) {
      let updatedPosition: PortfolioPosition | null = null;
      positions = positions.map((position) => {
        if (position.id !== id) {
          return position;
        }
        updatedPosition = {
          ...position,
          ...input,
          updatedAt: new Date().toISOString(),
        };
        return updatedPosition;
      });
      return updatedPosition;
    },
  };
}

export const mockPortfolioRepository = createMockPortfolioRepository();
