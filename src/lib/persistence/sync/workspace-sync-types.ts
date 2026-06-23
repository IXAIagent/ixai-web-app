export type WorkspaceSyncStatus =
  | "ready"
  | "partial"
  | "unavailable";

export type WorkspaceSyncSource =
  | "local_fallback"
  | "persistent_foundation"
  | "truth_layer"
  | "workspace_graph";

export type WorkspaceSyncTarget =
  | "alerts"
  | "fcn"
  | "portfolio"
  | "risk"
  | "valuation"
  | "workspace";

export interface WorkspaceSyncWarning {
  message: string;
  source: WorkspaceSyncSource;
}

export interface WorkspaceSyncReport {
  generatedAt: string;
  sourceStatus: WorkspaceSyncStatus;
  sources: Array<{
    source: WorkspaceSyncSource;
    status: WorkspaceSyncStatus;
    target: WorkspaceSyncTarget;
  }>;
  summary: string;
  warnings: WorkspaceSyncWarning[];
}
