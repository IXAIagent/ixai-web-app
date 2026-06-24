import type { DatabaseActivationTableStatus } from "@/src/lib/persistence/database-activation-utils";

export type V11DatabaseActivationPhase = "v11.10_database_activation_foundation";

export type V11ReadbackModule =
  | "Alert History"
  | "FCN"
  | "Portfolio"
  | "Watchlist"
  | "Workspace Membership";

export interface V11ExpectedTable {
  expectedColumns: string[];
  expectedIndexes: string[];
  name: string;
  requiredFor: V11ReadbackModule | "Workspace";
}

export interface V11TableReadiness {
  columnReadiness: "not_checked" | "partial" | "ready" | "unavailable";
  indexReadiness: "not_verifiable_client_side";
  name: string;
  rlsReadiness: "draft" | "not_verifiable_client_side";
  rowCount: number;
  status: DatabaseActivationTableStatus;
  warnings: string[];
}

export interface V11DatabaseReadbackValidation {
  blockingReason?: string;
  canRead: boolean;
  checkedAt: string;
  fallbackUsed: boolean;
  module: V11ReadbackModule;
  rowCount: number;
  source: "database" | "fallback" | "unavailable";
}

export interface V11DatabaseWriteActivationReadiness {
  canWrite: boolean;
  fallbackAvailable: boolean;
  guarded: boolean;
  missingRequirements: string[];
  module: "Alert History" | "FCN" | "Portfolio" | "Watchlist";
  recommendedNextStep: string;
}

export interface V11DatabaseActivationReport {
  activationPhase: V11DatabaseActivationPhase;
  blockingIssues: string[];
  checkedAt: string;
  expectedTables: V11ExpectedTable[];
  migrationReadiness: "prepared_not_executed";
  migrationVersion: "013_v11_database_activation_foundation";
  missingTables: string[];
  readbackValidation: V11DatabaseReadbackValidation[];
  safeNextAction: string;
  tableReadiness: V11TableReadiness[];
  writeReadiness: V11DatabaseWriteActivationReadiness[];
}
