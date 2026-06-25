import type { PortfolioTruthReadback } from "@/src/lib/portfolio/truth/portfolio-truth-types";
import type {
  LegacyExposureRiskSummary,
  LegacyPortfolioRiskSummary,
  LegacyRiskWarning,
} from "@/src/lib/risk/legacy-risk-engine/risk-engine-types";
import { buildLegacyPortfolioRiskSummary } from "@/src/lib/risk/legacy-risk-engine/portfolio-risk-engine";

export function buildLegacyExposureRiskSummary(
  truth: PortfolioTruthReadback | null,
  portfolioRisk: LegacyPortfolioRiskSummary = buildLegacyPortfolioRiskSummary(truth),
): LegacyExposureRiskSummary {
  const generatedAt = new Date().toISOString();
  const warnings: LegacyRiskWarning[] = [];

  if (!truth) {
    warnings.push({
      code: "truth-unavailable",
      message: "Portfolio Truth Layer is unavailable for exposure analysis.",
      severity: "warning",
    });
  }

  const topSymbols =
    truth?.symbols.topExposures.map((exposure) => ({
      occurrenceCount: exposure.occurrenceCount,
      percentOfPositions:
        portfolioRisk.positionCount > 0
          ? Math.round((exposure.occurrenceCount / portfolioRisk.positionCount) * 1000) / 10
          : null,
      sources: exposure.sources,
      symbol: exposure.symbol,
    })) ?? [];

  return {
    assetClassExposure: portfolioRisk.assetClassExposure,
    currencyExposure: portfolioRisk.currencyExposure,
    generatedAt,
    sourceStatus: portfolioRisk.sourceStatus,
    topSymbols,
    warnings,
  };
}
