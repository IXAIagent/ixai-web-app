"use client";

import { getWorkspaceFcnRiskSummary } from "@/src/lib/fcn/risk/fcn-risk-service";
import { getWorkspaceFcnScheduleSummary } from "@/src/lib/fcn/schedule";
import { getWorkspacePortfolioRiskSummary } from "@/src/lib/risk/risk-service";
import { getWorkspaceWatchlistSummary } from "@/src/lib/watchlist/watchlist-service";
import { buildWorkspaceAlertSummary } from "@/src/lib/alerts/alert-engine";
import type { WorkspaceAlertSummary } from "@/src/lib/alerts/alert-types";

export function buildEmptyWorkspaceAlertSummary(): WorkspaceAlertSummary {
  return {
    alertCount: 0,
    alerts: [],
    criticalCount: 0,
    generatedAt: new Date().toISOString(),
    highCount: 0,
    informationalOnlyDisclaimer:
      "Alerts are UI-only monitoring signals. No delivery or investment recommendation is implemented.",
    warningCount: 0,
  };
}

export async function getWorkspaceAlertSummary(): Promise<WorkspaceAlertSummary> {
  try {
    const [watchlist, portfolioRisk, fcnRisk, fcnSchedule] = await Promise.all([
      getWorkspaceWatchlistSummary(),
      getWorkspacePortfolioRiskSummary(),
      getWorkspaceFcnRiskSummary(),
      getWorkspaceFcnScheduleSummary(),
    ]);

    return buildWorkspaceAlertSummary({
      fcnRisk,
      fcnSchedule,
      portfolioRisk,
      watchlist,
    });
  } catch {
    return buildEmptyWorkspaceAlertSummary();
  }
}
