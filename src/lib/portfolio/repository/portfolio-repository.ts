import type { PortfolioAccountRepository } from "@/src/lib/portfolio/repository/portfolio-account-repository";
import type { PortfolioAssetRepository } from "@/src/lib/portfolio/repository/portfolio-asset-repository";
import type { PortfolioPositionRepository } from "@/src/lib/portfolio/repository/portfolio-position-repository";

export type PortfolioRepository = PortfolioAccountRepository &
  PortfolioAssetRepository &
  PortfolioPositionRepository;

export type PortfolioRepositoryStatus = {
  persistenceLayer: "coming_soon" | "enabled" | "mock" | "supabase";
  repositoryLayer: "enabled";
  source: "mock_repository" | "supabase_repository";
};
