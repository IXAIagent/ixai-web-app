import type { PortfolioAccountRepository } from "@/src/lib/portfolio/repository/portfolio-account-repository";
import type { PortfolioAssetRepository } from "@/src/lib/portfolio/repository/portfolio-asset-repository";
import type { PortfolioPositionRepository } from "@/src/lib/portfolio/repository/portfolio-position-repository";

export type PortfolioRepository = PortfolioAccountRepository &
  PortfolioAssetRepository &
  PortfolioPositionRepository & {
    getOwnershipValidationStatus(): Promise<PortfolioOwnershipValidationStatus>;
  };

export type PortfolioRepositoryStatus = {
  persistenceLayer: "coming_soon" | "enabled" | "mock" | "supabase";
  repositoryLayer: "enabled";
  source: "mock_repository" | "supabase_repository";
};

export type PortfolioOwnershipValidationStatus = {
  accountCount: number;
  assetCount: number;
  currentAccountId: string | null;
  currentUserId: string | null;
  positionCount: number;
  repositorySource: "mock_repository" | "supabase_repository";
  rlsStatus: "mock_only" | "owner_scoped" | "unauthenticated";
};
