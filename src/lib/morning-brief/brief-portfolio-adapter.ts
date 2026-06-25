import type { LegacyRiskEngineSnapshot } from "@/src/lib/risk/legacy-risk-engine";
import type { MorningBriefPortfolioSummary } from "@/src/lib/morning-brief/brief-types";
import { mapLegacyStatus } from "@/src/lib/morning-brief/brief-types";

export function buildMorningPortfolioSummary(
  snapshot: LegacyRiskEngineSnapshot | null,
): MorningBriefPortfolioSummary {
  const portfolioRisk = snapshot?.portfolioRisk;

  if (!portfolioRisk) {
    return {
      assetClassExposure: [],
      currencyExposure: [],
      dataQuality: "insufficient_data",
      positionCount: 0,
      sourceStatus: "unavailable",
      totalKnownNotional: null,
    };
  }

  return {
    assetClassExposure: portfolioRisk.assetClassExposure.map((item) => ({
      label: item.label,
      percent: item.percent,
      positionCount: item.positionCount,
    })),
    currencyExposure: portfolioRisk.currencyExposure.map((item) => ({
      currency: item.currency,
      percent: item.percent,
      positionCount: item.positionCount,
    })),
    dataQuality: portfolioRisk.dataQuality.sourceStatus,
    positionCount: portfolioRisk.positionCount,
    sourceStatus: mapLegacyStatus(portfolioRisk.sourceStatus),
    totalKnownNotional: portfolioRisk.totalKnownNotional,
  };
}
