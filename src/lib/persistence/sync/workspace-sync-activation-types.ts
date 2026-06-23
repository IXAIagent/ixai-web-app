export type WorkspaceDatabaseActivationStatus =
  | "partial"
  | "ready"
  | "unavailable";

export interface WorkspaceDatabaseActivationModule {
  name: string;
  status: WorkspaceDatabaseActivationStatus;
  warnings: string[];
}

export interface WorkspaceDatabaseActivationReport {
  generatedAt: string;
  migrationStatus: "draft_only" | "not_applied";
  modules: WorkspaceDatabaseActivationModule[];
  runtimeRequired: boolean;
  sourceStatus: WorkspaceDatabaseActivationStatus;
  summary: string;
  warnings: string[];
}
