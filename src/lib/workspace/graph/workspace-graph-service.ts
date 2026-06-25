"use client";

import { getWorkspaceAlertSummary } from "@/src/lib/alerts";
import { getWorkspaceDailyBrief } from "@/src/lib/daily-brief";
import { getWorkspaceFcnRiskSummary } from "@/src/lib/fcn/risk/fcn-risk-service";
import { getWorkspaceFcnScheduleSummary } from "@/src/lib/fcn/schedule";
import { getWorkspaceIntelligenceReport } from "@/src/lib/intelligence/engine/intelligence-service";
import { getMarketReadiness } from "@/src/lib/market/market-service";
import { getWorkspaceMorningSnapshot } from "@/src/lib/morning-brief";
import { getWorkspacePortfolioPersistenceSummary } from "@/src/lib/portfolio/persistence";
import { loadPortfolioTruthReadback } from "@/src/lib/portfolio/truth/portfolio-truth-client";
import { getWorkspacePortfolioValuation } from "@/src/lib/portfolio/valuation/portfolio-valuation-service";
import { getWorkspacePortfolioRiskSummary } from "@/src/lib/risk/risk-service";
import { getWorkspaceLegacyRiskEngineSnapshot } from "@/src/lib/risk/legacy-risk-engine";
import { getWorkspaceWatchlistSummary } from "@/src/lib/watchlist/watchlist-service";
import {
  getAlertPersistenceReadiness,
  getLiveAlertHistoryReadiness,
} from "@/src/lib/alerts/persistence";
import {
  getFcnPersistenceReadiness,
  getLiveFcnPersistenceReadiness,
} from "@/src/lib/persistence/fcn";
import { getDatabaseMigrationHealthReport } from "@/src/lib/persistence/migrations";
import {
  getLivePortfolioPersistenceReadiness,
  getPortfolioPersistenceReadiness,
} from "@/src/lib/persistence/portfolio";
import { getWorkspaceOwnershipStatus } from "@/src/lib/persistence/ownership";
import { getWorkspaceDatabaseReadPriorityStatus } from "@/src/lib/workspace/database-read-priority-status";
import { getV11DatabaseActivationReport } from "@/src/lib/workspace/database-activation";
import { getV11DatabaseCutoverStatus } from "@/src/lib/workspace/database-cutover";
import { getV12DatabaseWriteActivationStatus } from "@/src/lib/workspace/database-write-activation";
import { getV13PortfolioWriteDiagnostics } from "@/src/lib/workspace/portfolio-database-write-activation";
import { getV14FcnWriteDiagnostics } from "@/src/lib/workspace/fcn-database-activation";
import { getWorkspacePlatformCutoverStatus } from "@/src/lib/workspace/platform";
import {
  getLiveWatchlistPersistenceReadiness,
  getWatchlistPersistenceReadiness,
} from "@/src/lib/watchlist/persistence";
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
    livePortfolioPersistence,
    liveFcnPersistence,
    liveWatchlistPersistence,
    liveAlertPersistence,
    migrationHealth,
    databaseReadPriority,
    platformCutover,
    v11DatabaseActivation,
    v11DatabaseCutover,
    v12DatabaseWriteActivation,
    v13PortfolioDatabaseWriteActivation,
    v14FcnDatabaseActivation,
    legacyRiskEngine,
    morningBriefEngine,
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
    safeRead("Live Portfolio Persistence", getLivePortfolioPersistenceReadiness),
    safeRead("Live FCN Persistence", getLiveFcnPersistenceReadiness),
    safeRead("Live Watchlist Persistence", getLiveWatchlistPersistenceReadiness),
    safeRead("Live Alert History", getLiveAlertHistoryReadiness),
    safeRead("Migration Health", getDatabaseMigrationHealthReport),
    safeRead("Database Read Priority", getWorkspaceDatabaseReadPriorityStatus),
    safeRead("Platform Cutover", getWorkspacePlatformCutoverStatus),
    safeRead("V11 Database Activation", getV11DatabaseActivationReport),
    safeRead("V11 Database Cutover", getV11DatabaseCutoverStatus),
    safeRead("V12 Database Write Activation", getV12DatabaseWriteActivationStatus),
    safeRead("V13 Portfolio Database Write Activation", getV13PortfolioWriteDiagnostics),
    safeRead("V14 FCN Database Activation", getV14FcnWriteDiagnostics),
    safeRead("V15 Legacy Risk Engine Migration", getWorkspaceLegacyRiskEngineSnapshot),
    safeRead("V16 Morning Brief Engine", getWorkspaceMorningSnapshot),
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
    livePortfolioPersistence.warning,
    liveFcnPersistence.warning,
    liveWatchlistPersistence.warning,
    liveAlertPersistence.warning,
    migrationHealth.warning,
    databaseReadPriority.warning,
    platformCutover.warning,
    v11DatabaseActivation.warning,
    v11DatabaseCutover.warning,
    v12DatabaseWriteActivation.warning,
    v13PortfolioDatabaseWriteActivation.warning,
    v14FcnDatabaseActivation.warning,
    legacyRiskEngine.warning,
    morningBriefEngine.warning,
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
    livePortfolioPersistence.value,
    liveFcnPersistence.value,
    liveWatchlistPersistence.value,
    liveAlertPersistence.value,
    migrationHealth.value,
    databaseReadPriority.value,
    platformCutover.value,
    v11DatabaseActivation.value,
    v11DatabaseCutover.value,
    v12DatabaseWriteActivation.value,
    v13PortfolioDatabaseWriteActivation.value,
    v14FcnDatabaseActivation.value,
    legacyRiskEngine.value,
    morningBriefEngine.value,
  ].filter(Boolean).length;

  return {
    alerts: alerts.value,
    databaseReadPriority: databaseReadPriority.value,
    v11DatabaseActivation: v11DatabaseActivation.value,
    v11DatabaseCutover: v11DatabaseCutover.value,
    v12DatabaseWriteActivation: v12DatabaseWriteActivation.value,
    v13PortfolioDatabaseWriteActivation: v13PortfolioDatabaseWriteActivation.value,
    v14FcnDatabaseActivation: v14FcnDatabaseActivation.value,
    legacyRiskEngine: legacyRiskEngine.value,
    dailyBrief: dailyBrief.value,
    fcnRisk: fcnRisk.value,
    fcnSchedule: fcnSchedule.value,
    generatedAt: new Date().toISOString(),
    intelligence: intelligence.value,
    marketStatus: marketStatus.value,
    morningBriefEngine: morningBriefEngine.value,
    livePersistence: {
      alerts: liveAlertPersistence.value?.sourceStatus,
      fcn: liveFcnPersistence.value?.sourceStatus,
      portfolio: livePortfolioPersistence.value?.sourceStatus,
      watchlist: liveWatchlistPersistence.value?.sourceStatus,
    },
    migrationHealth: migrationHealth.value,
    ownershipReadiness: ownershipReadiness.value,
    platformCutover: platformCutover.value,
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
