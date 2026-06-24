import { checkAlertTablesReadiness } from "@/src/lib/alerts/persistence/alert-database-adapter";
import { checkFcnTablesReadiness } from "@/src/lib/persistence/fcn/fcn-database-adapter";
import { checkOwnershipTablesReadiness } from "@/src/lib/persistence/ownership/ownership-database-adapter";
import { checkPortfolioTablesReadiness } from "@/src/lib/persistence/portfolio/portfolio-database-adapter";
import type {
  MigrationExpectedTable,
  MigrationHealthReport,
  MigrationHealthStatus,
} from "@/src/lib/persistence/migrations/migration-types";
import { checkWatchlistTablesReadiness } from "@/src/lib/watchlist/persistence/watchlist-database-adapter";

function inferMigrationStatus(tables: MigrationExpectedTable[]): MigrationHealthStatus {
  if (tables.length === 0) return "unavailable";

  const configured = tables.filter((table) => table.status === "configured").length;
  const missing = tables.filter((table) => table.status === "missing").length;
  const unavailable = tables.filter((table) => table.status === "unavailable").length;

  if (configured === tables.length) return "ready";
  if (configured > 0) return "partial";
  if (missing > 0) return "missing_tables";
  if (unavailable > 0) return "unavailable";
  return "draft_only";
}

export async function getDatabaseMigrationHealthReport(): Promise<MigrationHealthReport> {
  try {
    const [portfolio, fcn, watchlist, alerts, ownership] = await Promise.all([
      checkPortfolioTablesReadiness(),
      checkFcnTablesReadiness(),
      checkWatchlistTablesReadiness(),
      checkAlertTablesReadiness(),
      checkOwnershipTablesReadiness(),
    ]);
    const expectedTables: MigrationExpectedTable[] = [
      ...portfolio.tables,
      ...fcn.tables,
      ...watchlist.tables,
      ...alerts.tables,
      ...ownership.tables,
    ].map((table) => ({
      name: table.name,
      requiredForRuntime: false,
      status: table.status,
      warnings: table.warnings,
    }));
    const sourceStatus = inferMigrationStatus(expectedTables);

    return {
      availableTables: expectedTables
        .filter((table) => table.status === "configured")
        .map((table) => table.name),
      expectedTables,
      generatedAt: new Date().toISOString(),
      informationalOnlyDisclaimer:
        "Migration health is diagnostics only. No migration is executed and runtime fallback remains active.",
      migrationStatus: sourceStatus,
      missingTables: expectedTables
        .filter((table) => table.status === "missing")
        .map((table) => table.name),
      rlsStatus: "draft_only",
      sourceStatus,
      warnings: expectedTables.flatMap((table) => table.warnings),
    };
  } catch {
    return {
      availableTables: [],
      expectedTables: [],
      generatedAt: new Date().toISOString(),
      informationalOnlyDisclaimer:
        "Migration health is diagnostics only. No migration is executed and runtime fallback remains active.",
      migrationStatus: "unavailable",
      missingTables: [],
      rlsStatus: "unknown",
      sourceStatus: "unavailable",
      warnings: ["Database migration health check failed safely."],
    };
  }
}
