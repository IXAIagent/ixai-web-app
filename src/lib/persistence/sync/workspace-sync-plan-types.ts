export type WorkspaceSyncPlanStatus =
  | "conflict_review_needed"
  | "database_unavailable"
  | "local_only"
  | "partial"
  | "ready";

export type WorkspaceSyncRecommendedAction =
  | "keep_local_fallback"
  | "review_conflict"
  | "review_database_only"
  | "sync_disabled"
  | "use_database_readback";

export interface WorkspaceSyncPlanRecord {
  id: string;
  label: string;
  module: "alerts" | "fcn" | "portfolio" | "watchlist";
  recommendedAction: WorkspaceSyncRecommendedAction;
  sourceStatus: string;
}

export interface WorkspaceSyncPlan {
  conflictCandidates: WorkspaceSyncPlanRecord[];
  databaseOnlyRecords: WorkspaceSyncPlanRecord[];
  generatedAt: string;
  localOnlyRecords: WorkspaceSyncPlanRecord[];
  matchedRecords: WorkspaceSyncPlanRecord[];
  recommendedAction: WorkspaceSyncRecommendedAction;
  sourceStatus: WorkspaceSyncPlanStatus;
  summary: string;
  warnings: string[];
}
