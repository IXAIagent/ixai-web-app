"use client";

import { getAlertDatabaseActivationReadiness } from "@/src/lib/alerts/persistence";
import { getFcnDatabaseActivationReadiness } from "@/src/lib/persistence/fcn";
import { getDatabaseMigrationHealthReport } from "@/src/lib/persistence/migrations";
import { checkOwnershipActivationReadiness } from "@/src/lib/persistence/ownership";
import { getPortfolioDatabaseActivationReadiness } from "@/src/lib/persistence/portfolio";
import type {
  WorkspaceDatabaseActivationModule,
  WorkspaceDatabaseActivationReport,
  WorkspaceDatabaseActivationStatus,
} from "@/src/lib/persistence/sync/workspace-sync-activation-types";
import { getWorkspaceApiGatewayStatus } from "@/src/lib/workspace/api/workspace-api-status";
import { getWorkspaceGraphSummary } from "@/src/lib/workspace/graph";
import { getWatchlistDatabaseActivationReadiness } from "@/src/lib/watchlist/persistence";

function moduleStatus(status: string): WorkspaceDatabaseActivationStatus {
  return status === "ready" ? "ready" : status === "partial" ? "partial" : "unavailable";
}

function summarize(modules: WorkspaceDatabaseActivationModule[]): WorkspaceDatabaseActivationStatus {
  if (modules.every((module) => module.status === "ready")) return "ready";
  if (modules.some((module) => module.status !== "unavailable")) return "partial";
  return "unavailable";
}

export async function getWorkspaceDatabaseActivationReport(): Promise<WorkspaceDatabaseActivationReport> {
  const [portfolio, fcn, watchlist, alerts, ownership, graph, migrationHealth] = await Promise.all([
    getPortfolioDatabaseActivationReadiness(),
    getFcnDatabaseActivationReadiness(),
    getWatchlistDatabaseActivationReadiness(),
    getAlertDatabaseActivationReadiness(),
    checkOwnershipActivationReadiness(),
    getWorkspaceGraphSummary(),
    getDatabaseMigrationHealthReport(),
  ]);
  const api = getWorkspaceApiGatewayStatus();
  const modules: WorkspaceDatabaseActivationModule[] = [
    { name: "Portfolio", status: moduleStatus(portfolio.sourceStatus), warnings: portfolio.warnings },
    { name: "FCN", status: moduleStatus(fcn.sourceStatus), warnings: fcn.warnings },
    { name: "Watchlist", status: moduleStatus(watchlist.sourceStatus), warnings: watchlist.warnings },
    { name: "Alerts", status: moduleStatus(alerts.sourceStatus), warnings: alerts.warnings },
    { name: "Ownership", status: moduleStatus(ownership.sourceStatus), warnings: ownership.warnings },
    {
      name: "Workspace Graph",
      status: graph.sourceStatus === "healthy" ? "ready" : "partial",
      warnings: graph.warningCount > 0 ? [`Workspace Graph has ${graph.warningCount} warning(s).`] : [],
    },
    {
      name: "Workspace API",
      status: api.routeHandlersEnabled ? "ready" : "partial",
      warnings: api.routeHandlersEnabled ? [] : ["Workspace API route handlers are not enabled."],
    },
    {
      name: "Migration Health",
      status:
        migrationHealth.sourceStatus === "ready"
          ? "ready"
          : migrationHealth.sourceStatus === "partial"
            ? "partial"
            : "unavailable",
      warnings: migrationHealth.warnings,
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    migrationStatus: "draft_only",
    modules,
    runtimeRequired: false,
    sourceStatus: summarize(modules),
    summary:
      "Database activation report compares database readiness, fallback availability, Workspace Graph, and API readiness. No background sync, automatic write, or destructive reconciliation is implemented.",
    warnings: modules.flatMap((module) => module.warnings),
  };
}

export async function getWorkspaceSyncActivationReadiness() {
  return getWorkspaceDatabaseActivationReport();
}
