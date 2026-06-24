"use client";

import { getLiveAlertHistoryReadiness } from "@/src/lib/alerts/persistence";
import { getLiveFcnPersistenceReadiness } from "@/src/lib/persistence/fcn";
import {
  getLivePortfolioPersistenceReadiness,
  getPortfolioPersistenceReadiness,
} from "@/src/lib/persistence/portfolio";
import { getWorkspaceSyncReport } from "@/src/lib/persistence/sync/workspace-sync-service";
import type {
  WorkspaceSyncPlan,
  WorkspaceSyncPlanRecord,
  WorkspaceSyncPlanStatus,
} from "@/src/lib/persistence/sync/workspace-sync-plan-types";
import { getLiveWatchlistPersistenceReadiness } from "@/src/lib/watchlist/persistence";

function inferStatus(input: {
  databaseCount: number;
  hasLocalFallback: boolean;
  warnings: string[];
}): WorkspaceSyncPlanStatus {
  if (input.warnings.some((warning) => warning.toLowerCase().includes("conflict"))) {
    return "conflict_review_needed";
  }

  if (input.databaseCount > 0 && input.hasLocalFallback) {
    return "partial";
  }

  if (input.databaseCount > 0) {
    return "ready";
  }

  if (input.hasLocalFallback) {
    return "local_only";
  }

  return "database_unavailable";
}

function compactRecords(
  records: Array<WorkspaceSyncPlanRecord | null>,
): WorkspaceSyncPlanRecord[] {
  return records.filter((record): record is WorkspaceSyncPlanRecord => Boolean(record));
}

export async function buildWorkspaceSyncPlan(): Promise<WorkspaceSyncPlan> {
  try {
    const [portfolio, portfolioFallback, fcn, watchlist, alerts, sync] = await Promise.all([
      getLivePortfolioPersistenceReadiness(),
      getPortfolioPersistenceReadiness(),
      getLiveFcnPersistenceReadiness(),
      getLiveWatchlistPersistenceReadiness(),
      getLiveAlertHistoryReadiness(),
      getWorkspaceSyncReport(),
    ]);
    const databaseCount =
      portfolio.livePortfolioPositions +
      portfolio.liveStockPositions +
      portfolio.liveCryptoPositions +
      fcn.livePositions +
      watchlist.liveItems +
      alerts.liveAlertEvents;
    const warnings = [
      ...portfolio.warnings,
      ...fcn.warnings,
      ...watchlist.warnings,
      ...alerts.warnings,
      ...sync.warnings.map((warning) => warning.message),
    ];
    const localOnlyRecords = portfolioFallback.hasLocalFallback
      ? [
          {
            id: "portfolio-local-fallback",
            label: "Portfolio local/fallback readback",
            module: "portfolio" as const,
            recommendedAction: "keep_local_fallback" as const,
            sourceStatus: portfolioFallback.sourceStatus,
          },
        ]
      : [];
    const databaseOnlyRecords = compactRecords([
      portfolio.livePortfolioPositions > 0 ||
      portfolio.liveStockPositions > 0 ||
      portfolio.liveCryptoPositions > 0
        ? {
            id: "portfolio-database-readback",
            label: "Portfolio database readback",
            module: "portfolio",
            recommendedAction: "use_database_readback",
            sourceStatus: portfolio.sourceStatus,
          }
        : null,
      fcn.livePositions > 0
        ? {
            id: "fcn-database-readback",
            label: "FCN database readback",
            module: "fcn",
            recommendedAction: "use_database_readback",
            sourceStatus: fcn.sourceStatus,
          }
        : null,
      watchlist.liveItems > 0
        ? {
            id: "watchlist-database-readback",
            label: "Watchlist database readback",
            module: "watchlist",
            recommendedAction: "use_database_readback",
            sourceStatus: watchlist.sourceStatus,
          }
        : null,
      alerts.liveAlertEvents > 0
        ? {
            id: "alert-database-readback",
            label: "Alert history database readback",
            module: "alerts",
            recommendedAction: "use_database_readback",
            sourceStatus: alerts.sourceStatus,
          }
        : null,
    ]);
    const sourceStatus = inferStatus({
      databaseCount,
      hasLocalFallback: portfolioFallback.hasLocalFallback,
      warnings,
    });

    return {
      conflictCandidates: [],
      databaseOnlyRecords,
      generatedAt: new Date().toISOString(),
      localOnlyRecords,
      matchedRecords: [],
      recommendedAction: databaseCount > 0 ? "use_database_readback" : "keep_local_fallback",
      sourceStatus,
      summary:
        "V9.60 generates a non-destructive sync plan only. It does not reconcile, overwrite, or write records automatically.",
      warnings,
    };
  } catch {
    return {
      conflictCandidates: [],
      databaseOnlyRecords: [],
      generatedAt: new Date().toISOString(),
      localOnlyRecords: [],
      matchedRecords: [],
      recommendedAction: "sync_disabled",
      sourceStatus: "database_unavailable",
      summary: "Workspace Sync plan failed safely.",
      warnings: ["No sync write or destructive reconciliation was attempted."],
    };
  }
}

export async function getWorkspaceSyncPlan(): Promise<WorkspaceSyncPlan> {
  return buildWorkspaceSyncPlan();
}
