"use client";

import { checkAlertTablesReadiness } from "@/src/lib/alerts/persistence";
import { checkWatchlistTablesReadiness } from "@/src/lib/watchlist/persistence";
import type { V12DatabaseWriteActivationStatus, V12ModuleWriteStatus, V12WritableModule } from "@/src/lib/workspace/database-write-activation/database-write-activation-types";
import { getV12WriteGuard } from "@/src/lib/workspace/database-write-activation/write-guard";
import { getV12WorkspaceBootstrapStatus } from "@/src/lib/workspace/database-write-activation/workspace-bootstrap";

function isReady(sourceStatus?: string) {
  return sourceStatus === "ready" || sourceStatus === "partial";
}

function moduleStatus(input: {
  databaseReady: boolean;
  module: V12WritableModule;
  nextStep?: string;
}): V12ModuleWriteStatus {
  const guard = getV12WriteGuard(input.module);
  const status = guard.enabled && input.databaseReady ? "ready" : guard.enabled ? "fallback" : "disabled";

  return {
    databaseReady: input.databaseReady,
    fallbackActive: !guard.enabled || !input.databaseReady,
    guard,
    lastCheckedAt: new Date().toISOString(),
    module: input.module,
    nextStep:
      input.nextStep ??
      (status === "ready"
        ? "Guard is enabled and database tables are readable; writes may be attempted by explicit user actions only."
        : "Keep local fallback active until write guard and table readiness are both confirmed."),
    status,
  };
}

export async function getV12DatabaseWriteActivationStatus(): Promise<V12DatabaseWriteActivationStatus> {
  const [watchlistTables, alertTables] = await Promise.all([
    checkWatchlistTablesReadiness(),
    checkAlertTablesReadiness(),
  ]);
  const watchlist = moduleStatus({
    databaseReady: isReady(watchlistTables.sourceStatus),
    module: "watchlist",
  });
  const alertHistory = moduleStatus({
    databaseReady: isReady(alertTables.sourceStatus),
    module: "alert_history",
  });
  const bootstrapGuard = watchlist.guard.enabled ? watchlist.guard : alertHistory.guard;
  const bootstrap = await getV12WorkspaceBootstrapStatus({
    allowCreate: false,
    guard: bootstrapGuard,
  });
  const disabledModules = [
    moduleStatus({
      databaseReady: false,
      module: "portfolio",
      nextStep: "Portfolio database writes remain disabled in V12.00; keep V9/V10 read paths and local fallback.",
    }),
    moduleStatus({
      databaseReady: false,
      module: "fcn",
      nextStep: "FCN database writes remain disabled in V12.00; FCN Draft Store and /api/fcn readback stay active.",
    }),
  ];

  return {
    alertHistory,
    bootstrap,
    checkedAt: new Date().toISOString(),
    disabledModules,
    phase: "v12.00_workspace_database_write_activation",
    safeNextAction:
      "Enable V12 watchlist/alert write guards only after staging validation; Portfolio and FCN writes remain readiness-only.",
    summary:
      "V12.00 introduces first guarded database writes for Watchlist and Alert History while preserving local fallback, Truth Layer, and disabled Portfolio/FCN write paths.",
    watchlist,
  };
}
