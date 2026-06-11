import type { PortfolioRiskEngine } from "@/src/lib/portfolio/risk/risk-engine";
import type {
  PortfolioRiskEngineInput,
  PortfolioRiskLevel,
  PortfolioRiskReport,
} from "@/src/lib/portfolio/risk/risk-types";

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function levelFromScore(score: number): PortfolioRiskLevel {
  if (score >= 82) {
    return "CRITICAL";
  }

  if (score >= 62) {
    return "HIGH";
  }

  if (score >= 36) {
    return "MODERATE";
  }

  return "LOW";
}

function countBySymbol(input: PortfolioRiskEngineInput) {
  return input.assets.reduce<Record<string, number>>((counts, asset) => {
    const symbol = asset.symbol.trim().toUpperCase() || asset.name.trim().toUpperCase();
    counts[symbol] = (counts[symbol] ?? 0) + 1;
    return counts;
  }, {});
}

function countByCategory(input: PortfolioRiskEngineInput) {
  return input.assets.reduce<Record<string, number>>((counts, asset) => {
    counts[asset.category] = (counts[asset.category] ?? 0) + 1;
    return counts;
  }, {});
}

function uniqueProviderCount(input: PortfolioRiskEngineInput) {
  return new Set(input.accounts.map((account) => account.provider)).size;
}

function uniqueRegionCount(input: PortfolioRiskEngineInput) {
  return new Set([
    ...input.accounts.map((account) => account.region),
    ...input.assets.map((asset) => asset.region),
  ]).size;
}

function uniqueCategoryCount(input: PortfolioRiskEngineInput) {
  return new Set(input.assets.map((asset) => asset.category)).size;
}

function buildAlerts(input: PortfolioRiskEngineInput, report: Omit<PortfolioRiskReport, "alerts" | "summary">) {
  const symbolCounts = countBySymbol(input);
  const repeatedSymbols = Object.entries(symbolCounts)
    .filter(([, count]) => count >= 2)
    .sort(([, a], [, b]) => b - a)
    .map(([symbol, count]) => `${symbol} appears ${count} times across portfolio assets.`);
  const alerts: string[] = [];

  if (repeatedSymbols.length > 0) {
    alerts.push(...repeatedSymbols.slice(0, 3));
  }

  if (report.fcnRisk === "HIGH" || report.fcnRisk === "CRITICAL") {
    alerts.push("FCN exposure is elevated by asset count and should remain in monitoring mode.");
  }

  if (report.cryptoRisk === "HIGH" || report.cryptoRisk === "CRITICAL") {
    alerts.push("Crypto / Grid / Dual exposure is elevated and should remain visible in risk readback.");
  }

  if (report.diversificationRisk === "HIGH" || report.diversificationRisk === "CRITICAL") {
    alerts.push("Diversification is limited by provider, region, or category concentration.");
  }

  if (alerts.length === 0) {
    alerts.push("No major mock risk alert is triggered by the current repository data.");
  }

  return alerts;
}

function buildSummary(input: PortfolioRiskEngineInput, overallRisk: PortfolioRiskLevel, riskScore: number) {
  if (input.assets.length === 0) {
    return "Portfolio Risk Engine is ready, but no assets are available for risk scoring yet.";
  }

  return `Mock risk engine rates this portfolio as ${overallRisk} with a risk score of ${riskScore}. The score reflects symbol concentration, FCN count, crypto-style assets, cash buffer, and diversification across providers, regions, and categories.`;
}

export const mockPortfolioRiskEngine: PortfolioRiskEngine = {
  async generateRiskReport(input) {
    const assetCount = input.assets.length;
    const symbolCounts = countBySymbol(input);
    const categoryCounts = countByCategory(input);
    const maxSymbolCount = Math.max(0, ...Object.values(symbolCounts));
    const fcnCount = categoryCounts.FCN ?? 0;
    const cryptoLikeCount =
      (categoryCounts.CRYPTO ?? 0) + (categoryCounts.GRID ?? 0) + (categoryCounts.DUAL ?? 0);
    const cashCount = categoryCounts.CASH ?? 0;
    const providerCount = uniqueProviderCount(input);
    const regionCount = uniqueRegionCount(input);
    const categoryCount = uniqueCategoryCount(input);

    const concentrationScore = clampScore(assetCount > 0 ? 18 + maxSymbolCount * 18 : 0);
    const fcnScore = clampScore(fcnCount * 18);
    const cryptoScore = clampScore(cryptoLikeCount * 20);
    const cashBufferScore = clampScore(64 - cashCount * 18);
    const diversificationScore = clampScore(
      84 - providerCount * 12 - regionCount * 8 - categoryCount * 9,
    );
    const riskScore = clampScore(
      concentrationScore * 0.26 +
        fcnScore * 0.2 +
        cryptoScore * 0.2 +
        cashBufferScore * 0.14 +
        diversificationScore * 0.2,
    );
    const baseReport = {
      cashBufferRisk: levelFromScore(cashBufferScore),
      concentrationRisk: levelFromScore(concentrationScore),
      cryptoRisk: levelFromScore(cryptoScore),
      diversificationRisk: levelFromScore(diversificationScore),
      fcnRisk: levelFromScore(fcnScore),
      generatedAt: "2026-06-11T00:00:00.000Z",
      overallRisk: levelFromScore(riskScore),
      riskScore,
    };

    return {
      ...baseReport,
      alerts: buildAlerts(input, baseReport),
      summary: buildSummary(input, baseReport.overallRisk, riskScore),
    };
  },
};
