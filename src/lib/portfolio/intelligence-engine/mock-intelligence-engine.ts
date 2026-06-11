import type { PortfolioIntelligenceEngine } from "@/src/lib/portfolio/intelligence-engine/intelligence-engine";
import type {
  PortfolioIntelligenceEngineInput,
  PortfolioIntelligenceRating,
} from "@/src/lib/portfolio/intelligence-engine/intelligence-engine-types";

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function ratingFromHealthScore(healthScore: number): PortfolioIntelligenceRating {
  if (healthScore >= 86) {
    return "excellent";
  }

  if (healthScore >= 72) {
    return "good";
  }

  if (healthScore >= 56) {
    return "moderate";
  }

  if (healthScore >= 40) {
    return "elevated";
  }

  return "high_risk";
}

function countByCategory(input: PortfolioIntelligenceEngineInput) {
  return input.assets.reduce<Record<string, number>>((counts, asset) => {
    counts[asset.category] = (counts[asset.category] ?? 0) + 1;
    return counts;
  }, {});
}

function uniqueProviderCount(input: PortfolioIntelligenceEngineInput) {
  return new Set(input.accounts.map((account) => account.provider)).size;
}

function buildSummary(input: PortfolioIntelligenceEngineInput, rating: PortfolioIntelligenceRating) {
  const assetCount = input.assets.length;
  const providerCount = uniqueProviderCount(input);
  const riskSignals =
    input.commentary.riskWatchCount + input.commentary.volatileCount;

  if (assetCount === 0) {
    return "Portfolio Intelligence Engine is ready, but no assets are available for scoring yet.";
  }

  return `Mock engine rates this portfolio as ${rating} with ${assetCount} assets, ${providerCount} provider source(s), and ${riskSignals} volatile or risk-watch commentary signal(s).`;
}

export const mockPortfolioIntelligenceEngine: PortfolioIntelligenceEngine = {
  async generateIntelligence(input) {
    const categoryCounts = countByCategory(input);
    const assetCount = input.assets.length;
    const providerCount = uniqueProviderCount(input);
    const fcnCount = categoryCounts.FCN ?? 0;
    const cashCount = categoryCounts.CASH ?? 0;
    const largestCategoryCount = Math.max(0, ...Object.values(categoryCounts));
    const concentrationRatio =
      assetCount > 0 ? largestCategoryCount / assetCount : 0;
    const riskSignals =
      input.commentary.riskWatchCount + input.commentary.volatileCount;

    const concentrationScore = clampScore(30 + concentrationRatio * 55 + fcnCount * 4);
    const diversificationScore = clampScore(
      42 + Math.min(providerCount, 4) * 10 + Math.min(Object.keys(categoryCounts).length, 5) * 6,
    );
    const riskScore = clampScore(
      24 + fcnCount * 6 + riskSignals * 7 - cashCount * 5 - providerCount * 3,
    );
    const healthScore = clampScore(
      100 - riskScore * 0.42 - concentrationScore * 0.24 + diversificationScore * 0.28,
    );
    const overallRating = ratingFromHealthScore(healthScore);

    return {
      concentrationScore,
      diversificationScore,
      generatedAt: "2026-06-11T00:00:00.000Z",
      healthScore,
      id: "mock-portfolio-intelligence-score",
      overallRating,
      riskScore,
      summary: buildSummary(input, overallRating),
    };
  },
};
