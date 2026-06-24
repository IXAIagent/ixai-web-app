export type V11DatabaseCutoverModule = "alerts" | "fcn" | "portfolio" | "watchlist";

export type V11ControlledWriteOperation =
  | "create"
  | "delete"
  | "skipped"
  | "update"
  | "upsert";

export type V11ControlledWriteTarget = "database" | "draft" | "local" | "skipped";

export interface V11ModuleWriteGuard {
  checkedAt: string;
  enabled: boolean;
  module: V11DatabaseCutoverModule;
  reason: string;
}

export interface V11ControlledWriteGuard {
  checkedAt: string;
  enabled: boolean;
  modules: Record<V11DatabaseCutoverModule, V11ModuleWriteGuard>;
  reason: string;
}

export interface V11ControlledWriteResult {
  blockingReason?: string;
  databaseAttempted: boolean;
  errorMessage?: string;
  fallbackUsed: boolean;
  guardEnabled: boolean;
  module: V11DatabaseCutoverModule;
  operation: V11ControlledWriteOperation;
  operationId?: string;
  success: boolean;
  target: V11ControlledWriteTarget;
  writtenAt: string;
}

export interface V11ModuleWriteReadiness {
  blockingReason?: string;
  databaseAttempted: boolean;
  fallbackActive: boolean;
  guardEnabled: boolean;
  module: V11DatabaseCutoverModule;
  readiness: "blocked" | "guarded" | "ready";
  recommendedNextAction: string;
  result: V11ControlledWriteResult;
}

export interface V11ControlledWriteStatus {
  checkedAt: string;
  guard: V11ControlledWriteGuard;
  modules: V11ModuleWriteReadiness[];
  remoteMigrationExecuted: false;
  summary: string;
}

export interface V11MigrationReviewCheck {
  detail: string;
  key: string;
  passed: boolean;
}

export interface V11RemoteMigrationReadiness {
  checkedAt: string;
  expectedIndexesCovered: boolean;
  expectedTablesCovered: boolean;
  manualMigrationRequired: true;
  migrationFile: string;
  migrationFileExists: boolean;
  productionWarningsPresent: boolean;
  remoteMigrationExecuted: false;
  rollbackNotesPresent: boolean;
  seedFile: string;
  seedFileExists: boolean;
  status: "blocked" | "ready_for_manual_review";
  checks: V11MigrationReviewCheck[];
  postMigrationValidationPlan: string[];
  safeNextAction: string;
  workspaceOwnershipLinkagePresent: boolean;
}

export interface V11DatabaseCutoverStatus {
  checkedAt: string;
  controlledWrite: V11ControlledWriteStatus;
  migrationReadiness: V11RemoteMigrationReadiness;
  phase: "v11_database_cutover_program";
  summary: string;
}
