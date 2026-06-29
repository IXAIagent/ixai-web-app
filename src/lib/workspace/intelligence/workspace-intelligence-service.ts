"use client";

import { getWorkspaceAlertSummary } from "@/src/lib/alerts";
import { getWorkspaceFcnRiskSummary } from "@/src/lib/fcn/risk/fcn-risk-service";
import { getWorkspacePortfolioValuation } from "@/src/lib/portfolio/valuation/portfolio-valuation-service";
import { getWorkspacePortfolioRiskSummary } from "@/src/lib/risk/risk-service";
import { getWorkspaceWatchlistSummary } from "@/src/lib/watchlist/watchlist-service";
import { getWorkspaceTimelineSummary } from "@/src/lib/workspace/timeline";
import { buildWorkspaceIntelligenceReportV14 } from "@/src/lib/workspace/intelligence/workspace-intelligence-engine";
import type { WorkspaceIntelligenceReportV14 } from "@/src/lib/workspace/intelligence/workspace-intelligence-types";
import { logWorkspaceRuntimeWarning } from "@/src/lib/workspace/runtime-safety";

const CACHE_TTL_MS = 30_000;

let cachedReport: WorkspaceIntelligenceReportV14 | null = null;
let cachedAt = 0;

function isFresh() {
  return cachedReport && Date.now() - cachedAt < CACHE_TTL_MS;
}

function settledValue<TData>(
  label: string,
  result: PromiseSettledResult<TData>,
  fallback: TData,
) {
  if (result.status === "fulfilled") return result.value;
  logWorkspaceRuntimeWarning("workspace-intelligence-source-fallback", result.reason, { label });
  return fallback;
}

export function buildEmptyWorkspaceIntelligenceReportV14(): WorkspaceIntelligenceReportV14 {
  return buildWorkspaceIntelligenceReportV14({
    alerts: null,
    fcnRisk: null,
    portfolioRisk: null,
    portfolioValuation: null,
    timeline: null,
    watchlist: null,
  });
}

export async function getWorkspaceIntelligenceReportV14(options: { force?: boolean } = {}) {
  if (!options.force && isFresh()) {
    return cachedReport as WorkspaceIntelligenceReportV14;
  }

  try {
    const [
      portfolioValuation,
      portfolioRisk,
      fcnRisk,
      watchlist,
      alerts,
      timeline,
    ] = await Promise.allSettled([
      getWorkspacePortfolioValuation(),
      getWorkspacePortfolioRiskSummary(),
      getWorkspaceFcnRiskSummary(),
      getWorkspaceWatchlistSummary(),
      getWorkspaceAlertSummary(),
      getWorkspaceTimelineSummary(),
    ]);
    const report = buildWorkspaceIntelligenceReportV14({
      alerts: settledValue("alerts", alerts, null),
      fcnRisk: settledValue("fcn-risk", fcnRisk, null),
      portfolioRisk: settledValue("portfolio-risk", portfolioRisk, null),
      portfolioValuation: settledValue("portfolio-valuation", portfolioValuation, null),
      timeline: settledValue("timeline", timeline, null),
      watchlist: settledValue("watchlist", watchlist, null),
    });

    cachedReport = report;
    cachedAt = Date.now();
    return report;
  } catch (error) {
    logWorkspaceRuntimeWarning("workspace-intelligence-report-fallback", error);
    return buildEmptyWorkspaceIntelligenceReportV14();
  }
}
