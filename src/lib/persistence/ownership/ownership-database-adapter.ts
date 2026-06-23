import {
  readDatabaseTable,
  summarizeTableStatuses,
} from "@/src/lib/persistence/database-activation-utils";
import type { OwnershipDatabaseReadiness } from "@/src/lib/persistence/ownership/ownership-database-types";

export async function checkOwnershipTablesReadiness(): Promise<OwnershipDatabaseReadiness> {
  const tables = await Promise.all([
    readDatabaseTable<unknown>("profiles", "id"),
    readDatabaseTable<unknown>("workspace_memberships", "id"),
  ]);
  const summary = summarizeTableStatuses(tables);

  return {
    generatedAt: new Date().toISOString(),
    sourceStatus: summary.sourceStatus,
    tables: tables.map((table) => ({
      name: table.table as "profiles" | "workspace_memberships",
      status: table.status,
      warnings: table.warnings,
    })),
    warnings: tables.flatMap((table) => table.warnings),
  };
}
