import type { DatabaseActivationTableStatus } from "@/src/lib/persistence/database-activation-utils";

export interface OwnershipDatabaseReadiness {
  generatedAt: string;
  sourceStatus: "partial" | "ready" | "unavailable";
  tables: Array<{
    name: "profiles" | "workspace_memberships";
    status: DatabaseActivationTableStatus;
    warnings: string[];
  }>;
  warnings: string[];
}
