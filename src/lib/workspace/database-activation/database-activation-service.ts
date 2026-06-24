import { readDatabaseTable } from "@/src/lib/persistence/database-activation-utils";
import type {
  V11DatabaseActivationReport,
  V11DatabaseReadbackValidation,
  V11DatabaseWriteActivationReadiness,
  V11ExpectedTable,
  V11TableReadiness,
} from "@/src/lib/workspace/database-activation/database-activation-types";

export const V11_EXPECTED_TABLES: V11ExpectedTable[] = [
  {
    expectedColumns: ["id", "owner_id", "name", "status", "created_at", "updated_at"],
    expectedIndexes: ["workspaces_owner_id_idx", "workspaces_created_at_idx"],
    name: "workspaces",
    requiredFor: "Workspace",
  },
  {
    expectedColumns: ["id", "workspace_id", "user_id", "role", "status", "created_at"],
    expectedIndexes: ["workspace_members_workspace_id_idx", "workspace_members_user_id_idx"],
    name: "workspace_members",
    requiredFor: "Workspace Membership",
  },
  {
    expectedColumns: ["id", "user_id", "owner_id", "workspace_id", "name", "created_at"],
    expectedIndexes: ["portfolios_workspace_id_idx", "portfolios_owner_id_idx"],
    name: "portfolios",
    requiredFor: "Portfolio",
  },
  {
    expectedColumns: ["id", "user_id", "owner_id", "workspace_id", "symbol", "asset_class"],
    expectedIndexes: ["portfolio_positions_workspace_id_idx", "portfolio_positions_symbol_idx"],
    name: "portfolio_positions",
    requiredFor: "Portfolio",
  },
  {
    expectedColumns: ["id", "user_id", "owner_id", "workspace_id", "symbol", "quantity"],
    expectedIndexes: ["stock_positions_workspace_id_idx", "stock_positions_symbol_idx"],
    name: "stock_positions",
    requiredFor: "Portfolio",
  },
  {
    expectedColumns: ["id", "user_id", "owner_id", "workspace_id", "symbol", "quantity"],
    expectedIndexes: ["crypto_positions_workspace_id_idx", "crypto_positions_symbol_idx"],
    name: "crypto_positions",
    requiredFor: "Portfolio",
  },
  {
    expectedColumns: ["id", "user_id", "owner_id", "workspace_id", "name", "portfolio_id"],
    expectedIndexes: ["fcn_positions_workspace_id_idx", "fcn_positions_owner_id_idx"],
    name: "fcn_positions",
    requiredFor: "FCN",
  },
  {
    expectedColumns: ["id", "user_id", "owner_id", "workspace_id", "fcn_position_id", "symbol"],
    expectedIndexes: ["fcn_underlyings_workspace_id_idx", "fcn_underlyings_symbol_idx"],
    name: "fcn_underlyings",
    requiredFor: "FCN",
  },
  {
    expectedColumns: ["id", "owner_id", "workspace_id", "fcn_position_id", "coupon_date"],
    expectedIndexes: ["fcn_coupon_schedules_workspace_id_idx", "fcn_coupon_schedules_coupon_date_idx"],
    name: "fcn_coupon_schedules",
    requiredFor: "FCN",
  },
  {
    expectedColumns: ["id", "owner_id", "workspace_id", "name", "created_at"],
    expectedIndexes: ["watchlists_workspace_id_idx", "watchlists_owner_id_idx"],
    name: "watchlists",
    requiredFor: "Watchlist",
  },
  {
    expectedColumns: ["id", "owner_id", "workspace_id", "watchlist_id", "symbol"],
    expectedIndexes: ["watchlist_items_workspace_id_idx", "watchlist_items_symbol_idx"],
    name: "watchlist_items",
    requiredFor: "Watchlist",
  },
  {
    expectedColumns: ["id", "owner_id", "workspace_id", "dedupe_key", "title", "created_at"],
    expectedIndexes: ["alert_history_workspace_id_idx", "alert_history_dedupe_key_idx"],
    name: "alert_history",
    requiredFor: "Alert History",
  },
  {
    expectedColumns: ["id", "owner_id", "workspace_id", "action", "module", "created_at"],
    expectedIndexes: ["workspace_audit_logs_workspace_id_idx", "workspace_audit_logs_created_at_idx"],
    name: "workspace_audit_logs",
    requiredFor: "Workspace",
  },
];

function selectForColumns(columns: string[]) {
  return columns.join(",");
}

async function checkTableReadiness(table: V11ExpectedTable): Promise<V11TableReadiness> {
  const readback = await readDatabaseTable<Record<string, unknown>>(
    table.name,
    selectForColumns(table.expectedColumns),
  );

  return {
    columnReadiness:
      readback.status === "configured"
        ? "ready"
        : readback.status === "error"
          ? "partial"
          : "unavailable",
    indexReadiness: "not_verifiable_client_side",
    name: table.name,
    rlsReadiness: "not_verifiable_client_side",
    rowCount: readback.rows.length,
    status: readback.status,
    warnings:
      readback.status === "configured"
        ? [
            "Index and RLS readiness require reviewed SQL/staging validation; client-side REST cannot verify them directly.",
          ]
        : readback.warnings,
  };
}

function buildReadbackValidation(
  moduleName: V11DatabaseReadbackValidation["module"],
  tables: V11TableReadiness[],
): V11DatabaseReadbackValidation {
  const configured = tables.filter((table) => table.status === "configured");
  const rowCount = tables.reduce((sum, table) => sum + table.rowCount, 0);
  const missing = tables.filter((table) => table.status === "missing");
  const canRead = configured.length > 0;

  return {
    blockingReason: canRead
      ? undefined
      : missing.length > 0
        ? `${missing.map((table) => table.name).join(", ")} missing or not readable.`
        : "Database readback is unavailable from client-safe diagnostics.",
    canRead,
    checkedAt: new Date().toISOString(),
    fallbackUsed: !canRead || rowCount === 0,
    module: moduleName,
    rowCount,
    source: canRead ? "database" : "fallback",
  };
}

function buildWriteReadiness(
  moduleName: V11DatabaseWriteActivationReadiness["module"],
  requiredTables: V11TableReadiness[],
): V11DatabaseWriteActivationReadiness {
  const missingRequirements = requiredTables
    .filter((table) => table.status !== "configured")
    .map((table) => `${table.name}:${table.status}`);

  return {
    canWrite: false,
    fallbackAvailable: true,
    guarded: true,
    missingRequirements,
    module: moduleName,
    recommendedNextStep:
      missingRequirements.length > 0
        ? "Apply reviewed migration in staging, validate RLS/ownership, then enable controlled write tests."
        : "Run staging write validation with explicit feature guard before enabling product writes.",
  };
}

export async function getV11DatabaseActivationReport(): Promise<V11DatabaseActivationReport> {
  const tableReadiness = await Promise.all(V11_EXPECTED_TABLES.map(checkTableReadiness));
  const byName = new Map(tableReadiness.map((table) => [table.name, table]));
  const getTables = (names: string[]) =>
    names.map((name) => byName.get(name)).filter((table): table is V11TableReadiness => Boolean(table));
  const portfolioTables = getTables([
    "portfolios",
    "portfolio_positions",
    "stock_positions",
    "crypto_positions",
  ]);
  const fcnTables = getTables(["fcn_positions", "fcn_underlyings", "fcn_coupon_schedules"]);
  const watchlistTables = getTables(["watchlists", "watchlist_items"]);
  const alertTables = getTables(["alert_history"]);
  const membershipTables = getTables(["workspaces", "workspace_members"]);
  const readbackValidation: V11DatabaseReadbackValidation[] = [
    buildReadbackValidation("Portfolio", portfolioTables),
    buildReadbackValidation("FCN", fcnTables),
    buildReadbackValidation("Watchlist", watchlistTables),
    buildReadbackValidation("Alert History", alertTables),
    buildReadbackValidation("Workspace Membership", membershipTables),
  ];
  const writeReadiness: V11DatabaseWriteActivationReadiness[] = [
    buildWriteReadiness("Portfolio", portfolioTables),
    buildWriteReadiness("FCN", fcnTables),
    buildWriteReadiness("Watchlist", watchlistTables),
    buildWriteReadiness("Alert History", alertTables),
  ];
  const missingTables = tableReadiness
    .filter((table) => table.status === "missing" || table.status === "unavailable")
    .map((table) => table.name);
  const blockingIssues = [
    ...missingTables.map((table) => `${table} is not ready.`),
    ...writeReadiness.flatMap((item) => item.missingRequirements),
  ];

  return {
    activationPhase: "v11.10_database_activation_foundation",
    blockingIssues: Array.from(new Set(blockingIssues)),
    checkedAt: new Date().toISOString(),
    expectedTables: V11_EXPECTED_TABLES,
    migrationReadiness: "prepared_not_executed",
    migrationVersion: "013_v11_database_activation_foundation",
    missingTables,
    readbackValidation,
    safeNextAction:
      missingTables.length > 0
        ? "Review and apply V11.10 migration in staging only; keep local and Truth Layer fallbacks active."
        : "Run controlled staging readback validation, then prepare V11.20 controlled write activation.",
    tableReadiness,
    writeReadiness,
  };
}
