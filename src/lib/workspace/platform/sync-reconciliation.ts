import { getWorkspaceDatabaseReadPriorityStatus } from "@/src/lib/workspace/database-read-priority-status";
import { getWorkspaceSyncPlan } from "@/src/lib/persistence/sync";
import type {
  WorkspaceReconciliationItem,
  WorkspaceReconciliationPlan,
} from "@/src/lib/workspace/platform/platform-types";
import type { WorkspaceDatabaseReadPriorityItem } from "@/src/lib/workspace/database-read-priority-status";

function item(input: WorkspaceReconciliationItem): WorkspaceReconciliationItem {
  return input;
}

function moduleFromLabel(
  label: WorkspaceDatabaseReadPriorityItem["label"],
): WorkspaceReconciliationItem["module"] {
  if (label === "Alert History") return "alerts";
  if (label === "FCN") return "fcn";
  if (label === "Watchlist") return "watchlist";
  return "portfolio";
}

function idPrefixFromLabel(label: WorkspaceDatabaseReadPriorityItem["label"]) {
  return label.toLowerCase().replace(/\s+/g, "-");
}

export async function buildWorkspaceReconciliationPlan(): Promise<WorkspaceReconciliationPlan> {
  try {
    const [readPriority, syncPlan] = await Promise.all([
      getWorkspaceDatabaseReadPriorityStatus(),
      getWorkspaceSyncPlan(),
    ]);
    const items: WorkspaceReconciliationItem[] = readPriority.items.map((sourceItem) => {
      const moduleName = moduleFromLabel(sourceItem.label);
      const idPrefix = idPrefixFromLabel(sourceItem.label);

      if (sourceItem.source === "database") {
        return item({
          action: "skip",
          id: `${idPrefix}-database-ready`,
          module: moduleName,
          reason: "Database readback is available; no reconciliation action is needed.",
          source: "database",
        });
      }

      if (!sourceItem.databaseReady) {
        return item({
          action: "blocked",
          conflictReason: "missing_table",
          id: `${idPrefix}-database-not-ready`,
          module: moduleName,
          reason:
            "Database table readiness is unavailable or empty. Keep fallback source active.",
          source: sourceItem.source === "truth" ? "truth" : "local",
        });
      }

      if (sourceItem.fallbackUsed) {
        return item({
          action: "create",
          id: `${idPrefix}-fallback-to-database-candidate`,
          module: moduleName,
          reason:
            "Fallback data is available while database readiness exists. Candidate requires owner and duplicate-key review before any write.",
          source: sourceItem.source === "truth" ? "truth" : "local",
        });
      }

      return item({
        action: "skip",
        id: `${idPrefix}-no-data`,
        module: moduleName,
        reason: "No usable source data is available for reconciliation.",
        source: "local",
      });
    });
    const conflicts = items.filter((planItem) => planItem.action === "conflict").length;
    const blockedItems = items.filter((planItem) => planItem.action === "blocked").length;
    const actionsProposed = items.filter(
      (planItem) => planItem.action === "create" || planItem.action === "update",
    ).length;

    return {
      actionsProposed,
      blockedItems,
      checkedAt: new Date().toISOString(),
      conflicts,
      items,
      safeToApply: false,
      summary:
        "V10.50 produces a deterministic dry-run reconciliation plan only. Apply is disabled by default and no destructive merge is performed.",
      totalItemsChecked:
        items.length +
        syncPlan.localOnlyRecords.length +
        syncPlan.databaseOnlyRecords.length +
        syncPlan.matchedRecords.length +
        syncPlan.conflictCandidates.length,
      warnings: [
        ...syncPlan.warnings,
        "Dry-run only: no database writes, deletes, overwrites, or silent merges are executed.",
      ],
    };
  } catch {
    return {
      actionsProposed: 0,
      blockedItems: 1,
      checkedAt: new Date().toISOString(),
      conflicts: 0,
      items: [
        {
          action: "blocked",
          conflictReason: "unsupported_operation",
          id: "workspace-reconciliation-unavailable",
          module: "portfolio",
          reason: "Reconciliation planning failed safely.",
          source: "local",
        },
      ],
      safeToApply: false,
      summary: "Workspace reconciliation failed safely.",
      totalItemsChecked: 0,
      warnings: ["No sync apply operation was attempted."],
    };
  }
}
