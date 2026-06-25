import type { DatabaseActivationTableStatus } from "@/src/lib/persistence/database-activation-utils";

export interface AlertEventDatabaseRow {
  category?: string | null;
  created_at?: string;
  dedupe_key?: string | null;
  id: string;
  message?: string | null;
  owner_id?: string | null;
  read_at?: string | null;
  severity?: string | null;
  source_engine?: string | null;
  title?: string | null;
  user_id?: string;
  workspace_id?: string | null;
}

export interface AlertDatabaseTableReadiness {
  generatedAt: string;
  sourceStatus: "partial" | "ready" | "unavailable";
  tables: Array<{
    name: "alert_history";
    status: DatabaseActivationTableStatus;
    warnings: string[];
  }>;
  warnings: string[];
}
