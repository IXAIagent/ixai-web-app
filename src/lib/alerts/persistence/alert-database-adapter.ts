import {
  readDatabaseTable,
  summarizeTableStatuses,
} from "@/src/lib/persistence/database-activation-utils";
import type { WorkspaceAlertCard } from "@/src/lib/alerts";
import type {
  AlertDatabaseTableReadiness,
  AlertEventDatabaseRow,
} from "@/src/lib/alerts/persistence/alert-database-types";

export async function readAlertEventsFromDatabase(): Promise<WorkspaceAlertCard[]> {
  const result = await readDatabaseTable<AlertEventDatabaseRow>("alert_history");
  return result.rows.map((row) => ({
    category:
      row.category === "coupon_due" ||
      row.category === "data_quality" ||
      row.category === "fcn_ki_warning" ||
      row.category === "price_above" ||
      row.category === "price_below" ||
      row.category === "risk_level"
        ? row.category
        : "unknown",
    createdAt: row.created_at ?? new Date().toISOString(),
    id: row.id,
    message: row.message ?? "Persisted alert event",
    severity:
      row.severity === "critical" ||
      row.severity === "high" ||
      row.severity === "info" ||
      row.severity === "warning"
        ? row.severity
        : "info",
    sourceEngine: row.source_engine ?? "alert_history",
    title: row.title ?? "Alert Event",
  }));
}

export async function insertAlertEventDraft() {
  return { ok: false, warning: "Alert event database writes are disabled by default in V8.40." };
}

export async function checkAlertTablesReadiness(): Promise<AlertDatabaseTableReadiness> {
  const tables = [await readDatabaseTable<unknown>("alert_history", "id")];
  const summary = summarizeTableStatuses(tables);

  return {
    generatedAt: new Date().toISOString(),
    sourceStatus: summary.sourceStatus,
    tables: tables.map((table) => ({
      name: "alert_history",
      status: table.status,
      warnings: table.warnings,
    })),
    warnings: tables.flatMap((table) => table.warnings),
  };
}
