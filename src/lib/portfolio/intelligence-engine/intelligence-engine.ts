import type {
  PortfolioIntelligenceEngineInput,
  PortfolioIntelligenceScore,
} from "@/src/lib/portfolio/intelligence-engine/intelligence-engine-types";

export interface PortfolioIntelligenceEngine {
  generateIntelligence(
    input: PortfolioIntelligenceEngineInput,
  ): Promise<PortfolioIntelligenceScore>;
}
