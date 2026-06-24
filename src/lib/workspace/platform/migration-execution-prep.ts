import { getDatabaseMigrationHealthReport } from "@/src/lib/persistence/migrations";
import type { WorkspaceMigrationExecutionPrep } from "@/src/lib/workspace/platform/platform-types";

export async function getWorkspaceMigrationExecutionPrep(): Promise<WorkspaceMigrationExecutionPrep> {
  try {
    const health = await getDatabaseMigrationHealthReport();
    const expectedTables =
      health.expectedTables.length > 0
        ? health.expectedTables.map((table) => table.name)
        : [
            "profiles",
            "workspace_memberships",
            "portfolio_positions",
            "stock_positions",
            "crypto_positions",
            "fcn_positions",
            "fcn_underlyings",
            "fcn_coupon_schedules",
            "watchlists",
            "watchlist_items",
            "alert_events",
          ];

    return {
      checkedAt: new Date().toISOString(),
      expectedTables,
      migrationOrder: [
        "profiles / ownership identity support",
        "workspace_memberships / workspace roles",
        "portfolio_positions / stock_positions / crypto_positions",
        "fcn_positions / fcn_underlyings / fcn_coupon_schedules",
        "watchlists / watchlist_items",
        "alert_events",
        "indexes and RLS policies after table validation",
      ],
      postMigrationValidation: [
        "Run table readiness diagnostics.",
        "Validate User A / User B ownership isolation.",
        "Validate database-first read priority with fallback still available.",
        "Validate guarded writes with duplicate prevention.",
        "Run lint, build, and mobile smoke QA.",
      ],
      preflightChecks: [
        "Confirm reviewed SQL migration files.",
        "Confirm staging database backup.",
        "Confirm rollback SQL notes.",
        "Confirm RLS policy review.",
        "Confirm no production remote migration command is run by automation.",
      ],
      remoteMigrationExecuted: false,
      rollbackNotes: [
        "Keep migrations additive and reversible where practical.",
        "Disable guarded writes before rollback.",
        "Keep local/draft fallback available during rollback.",
      ],
      status: health.sourceStatus === "ready" ? "ready" : "guarded",
      summary:
        "V10.60 prepares migration execution checklists and table order only. No remote migration is executed.",
      warnings: [
        ...health.warnings,
        "Remote migration execution remains manual and requires explicit approval.",
      ],
    };
  } catch {
    return {
      checkedAt: new Date().toISOString(),
      expectedTables: [],
      migrationOrder: [],
      postMigrationValidation: [],
      preflightChecks: [],
      remoteMigrationExecuted: false,
      rollbackNotes: [],
      status: "unavailable",
      summary: "Migration execution preparation failed safely.",
      warnings: ["No migration command was executed."],
    };
  }
}
