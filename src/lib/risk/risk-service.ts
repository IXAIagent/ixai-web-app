"use client";

import { getWorkspacePortfolioValuation } from "@/src/lib/portfolio/valuation/portfolio-valuation-service";
import { buildPortfolioRiskSummary } from "@/src/lib/risk/risk-engine";
import type { PortfolioRiskResult } from "@/src/lib/risk/risk-engine-types";

export async function getPortfolioRiskSummary(): Promise<PortfolioRiskResult> {
  try {
    const valuation = await getWorkspacePortfolioValuation();
    return buildPortfolioRiskSummary(valuation);
  } catch {
    return buildPortfolioRiskSummary({
      currency: "USD",
      positions: [],
      summary: {
        assetAllocation: [],
        positionCount: 0,
        pricedPositionCount: 0,
        sourceStatus: "unavailable",
        totalCostBasis: 0,
        totalMarketValue: 0,
        totalUnrealizedPnl: 0,
        totalUnrealizedPnlPercent: null,
        unpricedPositionCount: 0,
        updatedAt: new Date().toISOString(),
        warnings: [
          {
            code: "no_positions",
            message: "Portfolio valuation could not be loaded for Risk Engine v1.",
          },
        ],
      },
    });
  }
}

export async function getWorkspacePortfolioRiskSummary() {
  return getPortfolioRiskSummary();
}
