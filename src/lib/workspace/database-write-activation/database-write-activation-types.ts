export type V12WritableModule = "alert_history" | "fcn" | "portfolio" | "watchlist";

export type V12WriteGuardSource =
  | "default_disabled"
  | "environment"
  | "scope_disabled";

export interface V12WriteGuard {
  checkedAt: string;
  enabled: boolean;
  module: V12WritableModule;
  reason: string;
  source: V12WriteGuardSource;
}

export type V12WorkspaceBootstrapSource =
  | "database"
  | "fallback"
  | "skipped"
  | "unavailable";

export interface V12WorkspaceBootstrapResult {
  blockingReason?: string;
  checkedAt: string;
  created: boolean;
  fallbackUsed: boolean;
  source: V12WorkspaceBootstrapSource;
  workspaceId?: string;
}

export type V12DatabaseWriteOperation = "insert" | "update" | "upsert";

export interface V12DatabaseWriteResult {
  blockingReason?: string;
  databaseAttempted: boolean;
  errorMessage?: string;
  fallbackUsed: boolean;
  guardEnabled: boolean;
  module: "alert_history" | "watchlist";
  operation: V12DatabaseWriteOperation;
  success: boolean;
  target: "database" | "fallback" | "skipped";
  workspaceId?: string;
  writtenAt: string;
}

export interface V12ModuleWriteStatus {
  databaseReady: boolean;
  fallbackActive: boolean;
  guard: V12WriteGuard;
  lastCheckedAt: string;
  module: V12WritableModule;
  nextStep: string;
  status: "disabled" | "fallback" | "ready";
}

export interface V12DatabaseWriteActivationStatus {
  alertHistory: V12ModuleWriteStatus;
  bootstrap: V12WorkspaceBootstrapResult;
  checkedAt: string;
  disabledModules: V12ModuleWriteStatus[];
  phase: "v12.00_workspace_database_write_activation";
  safeNextAction: string;
  summary: string;
  watchlist: V12ModuleWriteStatus;
}
