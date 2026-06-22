"use client";

import { getWorkspaceAlertSummary } from "@/src/lib/alerts";
import { getWorkspaceFcnRiskSummary } from "@/src/lib/fcn/risk/fcn-risk-service";
import { getWorkspaceFcnScheduleSummary } from "@/src/lib/fcn/schedule";
import { getWorkspaceIntelligenceReport } from "@/src/lib/intelligence/engine/intelligence-service";
import { getWorkspacePortfolioPersistenceSummary } from "@/src/lib/portfolio/persistence";
import { getWorkspacePortfolioValuation } from "@/src/lib/portfolio/valuation/portfolio-valuation-service";
import { getWorkspacePortfolioRiskSummary } from "@/src/lib/risk/risk-service";
import { getWorkspaceWatchlistSummary } from "@/src/lib/watchlist/watchlist-service";
import { buildWorkspaceDailyBrief } from "@/src/lib/daily-brief/daily-brief-engine";
import type { WorkspaceDailyBrief } from "@/src/lib/daily-brief/daily-brief-types";

export function buildEmptyWorkspaceDailyBrief(): WorkspaceDailyBrief {
  return {
    generatedAt: new Date().toISOString(),
    informationalOnlyDisclaimer:
      "Workspace Daily Brief is rule-based and informational only. No AI model calls or recommendations are used.",
    sectionCount: 0,
    sections: [],
    summary: "No usable Workspace data is available for a Daily Brief yet.",
  };
}

export async function getWorkspaceDailyBrief(): Promise<WorkspaceDailyBrief> {
  try {
    const [
      persistence,
      valuation,
      portfolioRisk,
      fcnRisk,
      fcnSchedule,
      watchlist,
      alerts,
      intelligence,
    ] = await Promise.all([
      getWorkspacePortfolioPersistenceSummary(),
      getWorkspacePortfolioValuation(),
      getWorkspacePortfolioRiskSummary(),
      getWorkspaceFcnRiskSummary(),
      getWorkspaceFcnScheduleSummary(),
      getWorkspaceWatchlistSummary(),
      getWorkspaceAlertSummary(),
      getWorkspaceIntelligenceReport(),
    ]);

    return buildWorkspaceDailyBrief({
      alerts,
      fcnRisk,
      fcnSchedule,
      intelligence,
      persistence,
      portfolioRisk,
      valuation,
      watchlist,
    });
  } catch {
    return buildEmptyWorkspaceDailyBrief();
  }
}
