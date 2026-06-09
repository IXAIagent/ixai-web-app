import type { FCNExposureSummary, FCNWorstOfRankingItem } from "@/src/lib/fcn/risk-score";

export type PortfolioStatusLabel = "Elevated Risk" | "Healthy" | "High Risk" | "Watch";

export type PortfolioRiskDistribution = {
  high: number;
  low: number;
  moderate: number;
};

function clampScore(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function calculateRiskDistribution(
  worstOfRanking: FCNWorstOfRankingItem[],
): PortfolioRiskDistribution {
  return worstOfRanking.reduce<PortfolioRiskDistribution>(
    (distribution, item) => {
      if (item.riskLevel === "critical" || item.riskLevel === "elevated") {
        distribution.high += 1;
      } else if (item.riskLevel === "watch" || item.riskLevel === "unavailable") {
        distribution.moderate += 1;
      } else {
        distribution.low += 1;
      }

      return distribution;
    },
    { high: 0, low: 0, moderate: 0 },
  );
}

export function calculatePortfolioHealthScore(input: {
  exposureSummary: FCNExposureSummary[];
  nearKiCount: number;
  riskScore: number;
}) {
  const concentrationPenalty = input.exposureSummary.reduce(
    (score, item) => score + Math.max(0, item.count - 1) * 5,
    0,
  );
  const nearKiPenalty = input.nearKiCount * 6;

  return clampScore(100 - input.riskScore - nearKiPenalty - concentrationPenalty);
}

export function buildPortfolioStatus(healthScore: number): PortfolioStatusLabel {
  if (healthScore >= 80) return "Healthy";
  if (healthScore >= 60) return "Watch";
  if (healthScore >= 40) return "Elevated Risk";
  return "High Risk";
}

export function buildMonitoringHighlights(input: {
  exposureSummary: FCNExposureSummary[];
  nearKiCount: number;
  portfolioHealthScore: number;
  portfolioStatus: PortfolioStatusLabel;
  riskDistribution: PortfolioRiskDistribution;
  worstOfRanking: FCNWorstOfRankingItem[];
}) {
  const highlights: string[] = [];
  const weakest = input.worstOfRanking[0];
  const concentrated = input.exposureSummary.filter((item) => item.count > 1)[0];

  if (weakest?.underlyingSymbol) {
    highlights.push(`${weakest.underlyingSymbol} remains weakest underlying in stored FCN data.`);
  }

  if (input.nearKiCount > 0) {
    highlights.push(`${input.nearKiCount} FCN underlyings remain near KI thresholds.`);
  }

  if (concentrated) {
    highlights.push(`${concentrated.underlyingSymbol} exposure remains concentrated across FCNs.`);
  }

  if (input.riskDistribution.high > 0) {
    highlights.push(`${input.riskDistribution.high} FCN items are in high monitoring state.`);
  }

  highlights.push(
    `Portfolio status is ${input.portfolioStatus} with health score ${input.portfolioHealthScore}.`,
  );

  return highlights.slice(0, 5);
}
