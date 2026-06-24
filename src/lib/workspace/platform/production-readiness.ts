import { getDatabaseMigrationHealthReport } from "@/src/lib/persistence/migrations";
import { getWorkspaceDatabaseReadPriorityStatus } from "@/src/lib/workspace/database-read-priority-status";
import { buildWorkspaceReconciliationPlan } from "@/src/lib/workspace/platform/sync-reconciliation";
import type {
  WorkspacePlatformStatus,
  WorkspaceProductionReadiness,
} from "@/src/lib/workspace/platform/platform-types";

function inferOverall(statuses: WorkspacePlatformStatus[]): WorkspacePlatformStatus {
  if (statuses.some((status) => status === "unavailable")) return "partial";
  if (statuses.some((status) => status === "guarded")) return "guarded";
  if (statuses.some((status) => status === "partial")) return "partial";
  return "ready";
}

export async function getWorkspaceProductionReadiness(): Promise<WorkspaceProductionReadiness> {
  try {
    const [migration, readPriority, reconciliation] = await Promise.all([
      getDatabaseMigrationHealthReport(),
      getWorkspaceDatabaseReadPriorityStatus(),
      buildWorkspaceReconciliationPlan(),
    ]);
    const migrationHealth: WorkspacePlatformStatus =
      migration.sourceStatus === "ready" ? "ready" : "guarded";
    const fallbackStatus: WorkspacePlatformStatus =
      readPriority.sourceStatus === "database_first" ? "ready" : "partial";
    const dataIntegrity: WorkspacePlatformStatus = reconciliation.conflicts > 0 ? "guarded" : "partial";
    const statuses: WorkspacePlatformStatus[] = [
      dataIntegrity,
      fallbackStatus,
      migrationHealth,
      "guarded",
      "guarded",
      "guarded",
      "partial",
      "guarded",
      "guarded",
    ];

    return {
      auditLogReadiness: "guarded",
      backupReadiness: "guarded",
      checkedAt: new Date().toISOString(),
      dataIntegrity,
      duplicateRecordReadiness: reconciliation.conflicts > 0 ? "guarded" : "partial",
      fallbackStatus,
      migrationHealth,
      orphanRecordReadiness: "guarded",
      overallStatus: inferOverall(statuses),
      ownershipCoverage: "partial",
      recoveryReadiness: "guarded",
      summary:
        "V10.70 production readiness is diagnostic-only. Backup, restore, audit logs, orphan checks, and duplicate cleanup remain readiness surfaces, not automated operations.",
      warnings: [
        "No production migration, backup, restore, audit-log delivery, or destructive cleanup is executed.",
        ...migration.warnings,
        ...reconciliation.warnings,
      ],
    };
  } catch {
    return {
      auditLogReadiness: "unavailable",
      backupReadiness: "unavailable",
      checkedAt: new Date().toISOString(),
      dataIntegrity: "unavailable",
      duplicateRecordReadiness: "unavailable",
      fallbackStatus: "partial",
      migrationHealth: "unavailable",
      orphanRecordReadiness: "unavailable",
      overallStatus: "unavailable",
      ownershipCoverage: "unavailable",
      recoveryReadiness: "unavailable",
      summary: "Production readiness diagnostics failed safely.",
      warnings: ["No production operation was attempted."],
    };
  }
}
