import { getWorkspaceWriteCutoverPreview } from "@/src/lib/workspace/platform/database-write-cutover";
import {
  buildWorkspaceScopedQueryMetadata,
  evaluateWorkspaceAccess,
  getWorkspacePermissionMetadata,
} from "@/src/lib/workspace/platform/ownership-enforcement";
import { getWorkspaceMigrationExecutionPrep } from "@/src/lib/workspace/platform/migration-execution-prep";
import { getWorkspaceProductionReadiness } from "@/src/lib/workspace/platform/production-readiness";
import { buildWorkspaceReconciliationPlan } from "@/src/lib/workspace/platform/sync-reconciliation";
import { getWorkspaceMembershipReadiness } from "@/src/lib/workspace/platform/workspace-membership";
import type {
  WorkspacePlatformCutoverStatus,
  WorkspacePlatformStatus,
} from "@/src/lib/workspace/platform/platform-types";

function inferStatus(input: WorkspacePlatformCutoverStatus): WorkspacePlatformStatus {
  const statuses: WorkspacePlatformStatus[] = [
    input.membership.sourceStatus,
    input.migrationPrep.status,
    input.productionReadiness.overallStatus,
    input.reconciliation.safeToApply ? "ready" : "guarded",
  ];

  if (statuses.some((status) => status === "unavailable")) return "partial";
  if (statuses.some((status) => status === "guarded")) return "guarded";
  if (statuses.some((status) => status === "partial")) return "partial";
  return "ready";
}

export async function getWorkspacePlatformCutoverStatus(): Promise<WorkspacePlatformCutoverStatus> {
  const [
    membership,
    migrationPrep,
    productionReadiness,
    reconciliation,
    writeCutover,
  ] = await Promise.all([
    getWorkspaceMembershipReadiness(),
    getWorkspaceMigrationExecutionPrep(),
    getWorkspaceProductionReadiness(),
    buildWorkspaceReconciliationPlan(),
    getWorkspaceWriteCutoverPreview(),
  ]);
  const access = evaluateWorkspaceAccess();
  const scopedQuery = buildWorkspaceScopedQueryMetadata();
  const permissions = getWorkspacePermissionMetadata();
  const status: WorkspacePlatformCutoverStatus = {
    access,
    checkedAt: new Date().toISOString(),
    membership,
    migrationPrep,
    permissions,
    productionReadiness,
    reconciliation,
    scopedQuery,
    sourceStatus: "guarded",
    writeCutover,
  };

  return {
    ...status,
    sourceStatus: inferStatus(status),
  };
}
