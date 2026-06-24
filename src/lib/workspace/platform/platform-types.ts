export type WorkspacePlatformStatus = "ready" | "partial" | "guarded" | "unavailable";

export type WorkspacePlatformRole = "owner" | "admin" | "editor" | "viewer";

export type WorkspacePlatformSource =
  | "database"
  | "membership"
  | "owner_fallback"
  | "local"
  | "draft"
  | "diagnostic"
  | "unavailable";

export interface WorkspaceAccessEvaluation {
  canManage: boolean;
  canRead: boolean;
  canWrite: boolean;
  checkedAt: string;
  fallbackUsed: boolean;
  reason: string;
  role: WorkspacePlatformRole | "unknown";
  source: WorkspacePlatformSource;
}

export interface WorkspaceScopedQueryMetadata {
  canScope: boolean;
  checkedAt: string;
  ownerId?: string;
  reason: string;
  userColumn: "owner_id" | "user_id";
}

export interface WorkspacePermissionMetadata {
  checkedAt: string;
  supportedRoles: WorkspacePlatformRole[];
  summary: string;
  warnings: string[];
}

export interface WorkspaceMembershipRecord {
  id: string;
  role: WorkspacePlatformRole;
  source: WorkspacePlatformSource;
  userId?: string;
  workspaceId?: string;
}

export interface WorkspaceMembershipReadiness {
  checkedAt: string;
  fallbackUsed: boolean;
  members: WorkspaceMembershipRecord[];
  sourceStatus: WorkspacePlatformStatus;
  summary: string;
  warnings: string[];
}

export type WorkspaceDatabaseWriteTarget = "database" | "draft" | "local" | "skipped";

export interface WorkspaceDatabaseWriteResult {
  errorMessage?: string;
  fallbackUsed: boolean;
  operationId?: string;
  success: boolean;
  target: WorkspaceDatabaseWriteTarget;
  writtenAt: string;
}

export type WorkspaceReconciliationAction =
  | "blocked"
  | "conflict"
  | "create"
  | "skip"
  | "update";

export type WorkspaceReconciliationConflictReason =
  | "duplicate_key"
  | "missing_owner"
  | "missing_table"
  | "permission_denied"
  | "stale_local_data"
  | "unsupported_operation";

export interface WorkspaceReconciliationItem {
  action: WorkspaceReconciliationAction;
  conflictReason?: WorkspaceReconciliationConflictReason;
  id: string;
  module: "alerts" | "fcn" | "portfolio" | "watchlist";
  reason: string;
  source: "database" | "truth" | "local";
}

export interface WorkspaceReconciliationPlan {
  actionsProposed: number;
  blockedItems: number;
  checkedAt: string;
  conflicts: number;
  items: WorkspaceReconciliationItem[];
  safeToApply: boolean;
  summary: string;
  totalItemsChecked: number;
  warnings: string[];
}

export interface WorkspaceMigrationExecutionPrep {
  checkedAt: string;
  expectedTables: string[];
  migrationOrder: string[];
  postMigrationValidation: string[];
  preflightChecks: string[];
  remoteMigrationExecuted: false;
  rollbackNotes: string[];
  status: WorkspacePlatformStatus;
  summary: string;
  warnings: string[];
}

export interface WorkspaceProductionReadiness {
  auditLogReadiness: WorkspacePlatformStatus;
  backupReadiness: WorkspacePlatformStatus;
  checkedAt: string;
  dataIntegrity: WorkspacePlatformStatus;
  duplicateRecordReadiness: WorkspacePlatformStatus;
  fallbackStatus: WorkspacePlatformStatus;
  migrationHealth: WorkspacePlatformStatus;
  orphanRecordReadiness: WorkspacePlatformStatus;
  overallStatus: WorkspacePlatformStatus;
  ownershipCoverage: WorkspacePlatformStatus;
  recoveryReadiness: WorkspacePlatformStatus;
  summary: string;
  warnings: string[];
}

export interface WorkspacePlatformCutoverStatus {
  access: WorkspaceAccessEvaluation;
  checkedAt: string;
  membership: WorkspaceMembershipReadiness;
  migrationPrep: WorkspaceMigrationExecutionPrep;
  permissions: WorkspacePermissionMetadata;
  productionReadiness: WorkspaceProductionReadiness;
  reconciliation: WorkspaceReconciliationPlan;
  scopedQuery: WorkspaceScopedQueryMetadata;
  sourceStatus: WorkspacePlatformStatus;
  writeCutover: {
    alerts: WorkspaceDatabaseWriteResult;
    fcn: WorkspaceDatabaseWriteResult;
    portfolio: WorkspaceDatabaseWriteResult;
    watchlist: WorkspaceDatabaseWriteResult;
  };
}
