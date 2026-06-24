export type MigrationHealthStatus =
  | "draft_only"
  | "missing_tables"
  | "partial"
  | "ready"
  | "unavailable";

export interface MigrationExpectedTable {
  name: string;
  requiredForRuntime: boolean;
  status: "configured" | "error" | "missing" | "unavailable";
  warnings: string[];
}

export interface MigrationHealthReport {
  availableTables: string[];
  expectedTables: MigrationExpectedTable[];
  generatedAt: string;
  informationalOnlyDisclaimer: string;
  migrationStatus: MigrationHealthStatus;
  missingTables: string[];
  rlsStatus: "draft_only" | "unknown";
  sourceStatus: MigrationHealthStatus;
  warnings: string[];
}
