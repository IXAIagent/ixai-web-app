import type { PortfolioRepository } from "@/src/lib/portfolio/repository/portfolio-repository";
import { mockPortfolioRepository } from "@/src/lib/portfolio/repository/mock-portfolio-repository";
import { supabasePortfolioRepository } from "@/src/lib/portfolio/repository/supabase-portfolio-repository";

export type RepositoryMode = "mock" | "supabase";

export function getPortfolioRepository(
  mode: RepositoryMode = "supabase",
): PortfolioRepository {
  return mode === "mock" ? mockPortfolioRepository : supabasePortfolioRepository;
}
