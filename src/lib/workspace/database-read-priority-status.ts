"use client";

import { getAlertPersistenceSummary } from "@/src/lib/alerts/persistence";
import { getFcnPersistenceReadiness } from "@/src/lib/persistence/fcn";
import { getWorkspacePortfolioPersistenceSummary } from "@/src/lib/portfolio/persistence";
import type { WorkspaceDatabaseReadPriorityMetadata } from "@/src/lib/workspace/database-read-priority";
import { getWorkspaceWatchlistSummary } from "@/src/lib/watchlist/watchlist-service";

export interface WorkspaceDatabaseReadPriorityItem {
  databaseReady: boolean;
  fallbackUsed: boolean;
  label: "Alert History" | "FCN" | "Portfolio" | "Watchlist";
  source: WorkspaceDatabaseReadPriorityMetadata["source"];
  statusText: string;
  warning?: string;
}

export interface WorkspaceDatabaseReadPriorityStatus {
  generatedAt: string;
  informationalOnlyDisclaimer: string;
  items: WorkspaceDatabaseReadPriorityItem[];
  sourceStatus: "database_first" | "fallback_active" | "unavailable";
}

function fallbackMetadata(): WorkspaceDatabaseReadPriorityMetadata {
  return {
    checkedAt: new Date().toISOString(),
    fallbackUsed: true,
    isDatabaseReady: false,
    source: "empty",
  };
}

function item(input: {
  label: WorkspaceDatabaseReadPriorityItem["label"];
  metadata?: WorkspaceDatabaseReadPriorityMetadata;
  warning?: string;
}): WorkspaceDatabaseReadPriorityItem {
  const metadata = input.metadata ?? fallbackMetadata();

  return {
    databaseReady: metadata.isDatabaseReady,
    fallbackUsed: metadata.fallbackUsed,
    label: input.label,
    source: metadata.source,
    statusText: `source=${metadata.source}; fallback=${metadata.fallbackUsed ? "active" : "inactive"}; database=${metadata.isDatabaseReady ? "ready" : "not ready"}`,
    warning: input.warning ?? metadata.errorMessage,
  };
}

export async function getWorkspaceDatabaseReadPriorityStatus(): Promise<WorkspaceDatabaseReadPriorityStatus> {
  try {
    const [portfolio, fcn, watchlist, alerts] = await Promise.all([
      getWorkspacePortfolioPersistenceSummary(),
      getFcnPersistenceReadiness(),
      getWorkspaceWatchlistSummary(),
      getAlertPersistenceSummary(),
    ]);
    const items = [
      item({
        label: "Portfolio",
        metadata: portfolio.readPriority,
        warning: portfolio.summary.warnings[0]?.message,
      }),
      item({
        label: "FCN",
        metadata: fcn.readPriority,
        warning: fcn.warnings[0],
      }),
      item({
        label: "Watchlist",
        metadata: watchlist.readPriority,
      }),
      item({
        label: "Alert History",
        metadata: alerts.readPriority,
        warning: alerts.warnings[0],
      }),
    ];

    return {
      generatedAt: new Date().toISOString(),
      informationalOnlyDisclaimer:
        "V10.10 read priority is database-first with Truth Layer and local fallback preserved. No migration, auth, RLS, or write-path cutover is performed.",
      items,
      sourceStatus: items.every((entry) => entry.source === "database")
        ? "database_first"
        : items.some((entry) => entry.fallbackUsed)
          ? "fallback_active"
          : "unavailable",
    };
  } catch {
    return {
      generatedAt: new Date().toISOString(),
      informationalOnlyDisclaimer:
        "V10.10 read priority diagnostics failed safely. Existing fallbacks remain preserved.",
      items: [
        item({ label: "Portfolio" }),
        item({ label: "FCN" }),
        item({ label: "Watchlist" }),
        item({ label: "Alert History" }),
      ],
      sourceStatus: "unavailable",
    };
  }
}
