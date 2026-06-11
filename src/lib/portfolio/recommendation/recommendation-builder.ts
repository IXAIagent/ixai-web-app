import type { PortfolioRecommendationEngine } from "@/src/lib/portfolio/recommendation/recommendation-engine";
import { mockPortfolioRecommendationEngine } from "@/src/lib/portfolio/recommendation/mock-recommendation-engine";
import type { PortfolioRecommendationReport } from "@/src/lib/portfolio/recommendation/recommendation-types";
import type { PortfolioRiskReport } from "@/src/lib/portfolio/risk/risk-types";

export async function buildPortfolioRecommendations(input: {
  recommendationEngine?: PortfolioRecommendationEngine;
  riskReport: PortfolioRiskReport;
}): Promise<PortfolioRecommendationReport> {
  const engine = input.recommendationEngine ?? mockPortfolioRecommendationEngine;

  return engine.generateRecommendations({
    riskReport: input.riskReport,
  });
}
