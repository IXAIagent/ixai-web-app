import type { PortfolioAsset } from "@/src/lib/portfolio/data-model/portfolio-asset-types";
import { buildPortfolioIntelligenceUniverse } from "@/src/lib/portfolio/intelligence/intelligence-universe";

export function buildPortfolioNewsIntelligenceFoundation(assets: PortfolioAsset[]) {
  return buildPortfolioIntelligenceUniverse(assets);
}
