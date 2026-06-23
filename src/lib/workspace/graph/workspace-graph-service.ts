"use client";

import { getWorkspaceAlertSummary } from "@/src/lib/alerts";
import { getWorkspaceDailyBrief } from "@/src/lib/daily-brief";
import { getWorkspaceFcnRiskSummary } from "@/src/lib/fcn/risk/fcn-risk-service";
import { getWorkspaceFcnScheduleSummary } from "@/src/lib/fcn/schedule";
import { getWorkspaceIntelligenceReport } from "@/src/lib/intelligence/engine/intelligence-service";
import { getMarketReadiness } from "@/src/lib/market/market-service";
import { getWorkspacePortfolioPersistenceSummary } from "@/src/lib/portfolio/persistence";
import { loadPortfolioTruthReadback } from "@/src/lib/portfolio/truth/portfolio-truth-client";
import { getWorkspacePortfolioValuation } from "@/src/lib/portfolio/valuation/portfolio-valuation-service";
import { getWorkspacePortfolioRiskSummary } from "@/src/lib/risk/risk-service";
import { getWorkspaceWatchlistSummary } from "@/src/lib/watchlist/watchlist-service";
import { getAlertPersistenceReadiness } from "@/src/lib/alerts/persistence";
import { getFcnPersistenceReadiness } from "@/src/lib/persistence/fcn";
import { getPortfolioPersistenceReadiness } from "@/src/lib/persistence/portfolio";
import { getWorkspaceOwnershipStatus } from "@/src/lib/persistence/ownership";
import { getWatchlistPersistenceReadiness } from "@/src/lib/watchlist/persistence";
import {
  buildWorkspaceGraphSummary,
  inferWorkspaceGraphStatus,
} from "@/src/lib/workspace/graph/workspace-graph-engine";
import type {
  WorkspaceGraph,
  WorkspaceGraphSummary,
  WorkspaceGraphWarning,
} from "@/src/lib/workspace/graph/workspace-graph-types";

async function safeRead<T>(
  module: string,
  read: () => Promise<T> | T,
): Promise<{ value: T | null; warning: WorkspaceGraphWarning | null }> {
  try {
    return {
      value: await read(),
      warning: null,
    };
  } catch {
    return {
      value: null,
      warning: {
        message: `${module} readback failed; other Workspace modules remain available.`,
        module,
      },
    };
  }
}

export async function getWorkspaceGraph(): Promise<WorkspaceGraph> {
  const [
    portfolioPersistence,
    portfolioTruth,
    valuation,
    risk,
    fcnRisk,
    fcnSchedule,
    watchlist,
    alerts,
    intelligence,
    dailyBrief,
    marketStatus,
    portfolioPersistenceReadiness,
    fcnPersistenceReadiness,
    watchlistPersistenceReadiness,
    alertPersistenceReadiness,
    ownershipReadiness,
  ] = await Promise.all([
    safeRead("Portfolio Persistence", getWorkspacePortfolioPersistenceSummary),
    safeRead("Portfolio Truth", loadPortfolioTruthReadback),
    safeRead("Portfolio Valuation", getWorkspacePortfolioValuation),
    safeRead("Risk Engine", getWorkspacePortfolioRiskSummary),
    safeRead("FCN Risk", getWorkspaceFcnRiskSummary),
    safeRead("FCN Schedule", getWorkspaceFcnScheduleSummary),
    safeRead("Watchlist", getWorkspaceWatchlistSummary),
    safeRead("Alerts", getWorkspaceAlertSummary),
    safeRead("Intelligence", getWorkspaceIntelligenceReport),
    safeRead("Daily Brief", getWorkspaceDailyBrief),
    safeRead("Market Status", () => getMarketReadiness()),
    safeRead("Portfolio Persistence Readiness", getPortfolioPersistenceReadiness),
    safeRead("FCN Persistence Readiness", getFcnPersistenceReadiness),
    safeRead("Watchlist Persistence Readiness", getWatchlistPersistenceReadiness),
    safeRead("Alert Persistence Readiness", getAlertPersistenceReadiness),
    safeRead("Workspace Ownership", () => getWorkspaceOwnershipStatus()),
  ]);
  const warnings = [
    portfolioPersistence.warning,
    portfolioTruth.warning,
    valuation.warning,
    risk.warning,
    fcnRisk.warning,
    fcnSchedule.warning,
    watchlist.warning,
    alerts.warning,
    intelligence.warning,
    dailyBrief.warning,
    marketStatus.warning,
    portfolioPersistenceReadiness.warning,
    fcnPersistenceReadiness.warning,
    watchlistPersistenceReadiness.warning,
    alertPersistenceReadiness.warning,
    ownershipReadiness.warning,
  ].filter((warning): warning is WorkspaceGraphWarning => Boolean(warning));
  const availableModuleCount = [
    portfolioPersistence.value,
    portfolioTruth.value,
    valuation.value,
    risk.value,
    fcnRisk.value,
    fcnSchedule.value,
    watchlist.value,
    alerts.value,
    intelligence.value,
    dailyBrief.value,
    marketStatus.value,
    portfolioPersistenceReadiness.value,
    fcnPersistenceReadiness.value,
    watchlistPersistenceReadiness.value,
    alertPersistenceReadiness.value,
    ownershipReadiness.value,
  ].filter(Boolean).length;

  return {
    alerts: alerts.value,
    dailyBrief: dailyBrief.value,
    fcnRisk: fcnRisk.value,
    fcnSchedule: fcnSchedule.value,
    generatedAt: new Date().toISOString(),
    intelligence: intelligence.value,
    marketStatus: marketStatus.value,
    ownershipReadiness: ownershipReadiness.value,
    portfolioPersistence: portfolioPersistence.value,
    persistenceReadiness: portfolioPersistenceReadiness.value,
    portfolioTruth: portfolioTruth.value,
    risk: risk.value,
    sourceStatus: inferWorkspaceGraphStatus({
      moduleCount: availableModuleCount,
      warnings,
    }),
    valuation: valuation.value,
    warnings,
    watchlist: watchlist.value,
    watchlistPersistenceReadiness: watchlistPersistenceReadiness.value,
    alertPersistenceReadiness: alertPersistenceReadiness.value,
    fcnPersistenceReadiness: fcnPersistenceReadiness.value,
    syncReadiness: {
      generatedAt: new Date().toISOString(),
      sourceStatus: "partial",
      sources: [],
      summary:
        "Workspace Sync readiness is exposed as a V7 foundation. Full sync reporting is available from the sync service and Settings diagnostics.",
      warnings: [],
    },
  };
}

export async function getWorkspaceGraphSummary(): Promise<WorkspaceGraphSummary> {
  return buildWorkspaceGraphSummary(await getWorkspaceGraph());
}
