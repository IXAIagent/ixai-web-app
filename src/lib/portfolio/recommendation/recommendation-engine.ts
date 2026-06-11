import type {
  PortfolioRecommendationEngineInput,
  PortfolioRecommendationReport,
} from "@/src/lib/portfolio/recommendation/recommendation-types";

export interface PortfolioRecommendationEngine {
  generateRecommendations(
    input: PortfolioRecommendationEngineInput,
  ): Promise<PortfolioRecommendationReport>;
}
