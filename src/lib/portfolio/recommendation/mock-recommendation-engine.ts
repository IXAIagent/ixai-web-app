import type { PortfolioRecommendationEngine } from "@/src/lib/portfolio/recommendation/recommendation-engine";
import type {
  PortfolioRecommendation,
  PortfolioRecommendationCategory,
  PortfolioRecommendationPriority,
  PortfolioRecommendationSeverity,
} from "@/src/lib/portfolio/recommendation/recommendation-types";
import type { PortfolioRiskLevel } from "@/src/lib/portfolio/risk/risk-types";

const GENERATED_AT = "2026-06-11T00:00:00.000Z";

function isHighRisk(level: PortfolioRiskLevel) {
  return level === "HIGH" || level === "CRITICAL";
}

function recommendation(
  input: {
    category: PortfolioRecommendationCategory;
    description: string;
    id: string;
    priority: PortfolioRecommendationPriority;
    severity: PortfolioRecommendationSeverity;
    title: string;
  },
): PortfolioRecommendation {
  return {
    ...input,
    generatedAt: GENERATED_AT,
  };
}

function buildSummary(count: number) {
  if (count === 0) {
    return "Portfolio Recommendation Engine is ready. No deterministic monitoring prompt is triggered by the current mock risk report.";
  }

  return `Portfolio Recommendation Engine generated ${count} monitoring prompts from the current deterministic risk report. These prompts are workflow guidance only, not trading instructions.`;
}

export const mockPortfolioRecommendationEngine: PortfolioRecommendationEngine = {
  async generateRecommendations(input) {
    const { riskReport } = input;
    const recommendations: PortfolioRecommendation[] = [];

    if (isHighRisk(riskReport.concentrationRisk)) {
      recommendations.push(
        recommendation({
          category: "CONCENTRATION",
          description:
            "Symbol concentration is elevated in the current risk report. Keep this exposure visible in portfolio monitoring and review concentration workflow limits.",
          id: "recommendation-concentration-risk",
          priority: "HIGH",
          severity: riskReport.concentrationRisk === "CRITICAL" ? "HIGH" : "MODERATE",
          title: "Reduce concentration risk",
        }),
      );
    }

    if (isHighRisk(riskReport.fcnRisk)) {
      recommendations.push(
        recommendation({
          category: "FCN",
          description:
            "FCN exposure is elevated by asset count. Continue monitoring worst-of behavior, KI context, and basket concentration before relying on portfolio-level readback.",
          id: "recommendation-fcn-risk",
          priority: riskReport.fcnRisk === "CRITICAL" ? "HIGH" : "MEDIUM",
          severity: riskReport.fcnRisk === "CRITICAL" ? "HIGH" : "MODERATE",
          title: "Monitor FCN exposure",
        }),
      );
    }

    if (isHighRisk(riskReport.cryptoRisk)) {
      recommendations.push(
        recommendation({
          category: "CRYPTO",
          description:
            "Crypto, Grid, or Dual exposure is elevated in the current report. Keep volatility, liquidity, and multi-asset interaction visible in the monitoring workflow.",
          id: "recommendation-crypto-risk",
          priority: riskReport.cryptoRisk === "CRITICAL" ? "HIGH" : "MEDIUM",
          severity: riskReport.cryptoRisk === "CRITICAL" ? "HIGH" : "MODERATE",
          title: "Monitor crypto volatility",
        }),
      );
    }

    if (isHighRisk(riskReport.cashBufferRisk)) {
      recommendations.push(
        recommendation({
          category: "CASH",
          description:
            "Cash buffer risk is elevated in the deterministic report. Review liquidity reserve visibility inside the portfolio workflow.",
          id: "recommendation-cash-buffer",
          priority: riskReport.cashBufferRisk === "CRITICAL" ? "HIGH" : "MEDIUM",
          severity: riskReport.cashBufferRisk === "CRITICAL" ? "HIGH" : "MODERATE",
          title: "Review liquidity reserve",
        }),
      );
    }

    if (isHighRisk(riskReport.diversificationRisk)) {
      recommendations.push(
        recommendation({
          category: "DIVERSIFICATION",
          description:
            "Diversification risk is elevated by provider, region, or category concentration. Consider broader diversification as a monitoring objective, not an execution instruction.",
          id: "recommendation-diversification-risk",
          priority: riskReport.diversificationRisk === "CRITICAL" ? "HIGH" : "MEDIUM",
          severity: riskReport.diversificationRisk === "CRITICAL" ? "HIGH" : "MODERATE",
          title: "Consider broader diversification",
        }),
      );
    }

    if (riskReport.overallRisk === "CRITICAL" || riskReport.riskScore >= 82) {
      recommendations.push(
        recommendation({
          category: "RISK",
          description:
            "Overall portfolio risk is elevated by the current deterministic score. Escalate dashboard review frequency and keep the risk report in monitoring mode.",
          id: "recommendation-overall-risk",
          priority: "HIGH",
          severity: "HIGH",
          title: "Portfolio risk elevated",
        }),
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        recommendation({
          category: "GENERAL",
          description:
            "No high-risk monitoring prompt is triggered by the current deterministic report. Continue regular portfolio readback and ownership validation.",
          id: "recommendation-regular-monitoring",
          priority: "LOW",
          severity: "INFO",
          title: "Continue portfolio monitoring",
        }),
      );
    }

    const highPriorityCount = recommendations.filter(
      (item) => item.priority === "HIGH" || item.severity === "HIGH",
    ).length;

    return {
      generatedAt: GENERATED_AT,
      highPriorityCount,
      recommendationCount: recommendations.length,
      recommendations,
      summary: buildSummary(recommendations.length),
    };
  },
};
