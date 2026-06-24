#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const migrationPath = resolve(root, "supabase/migrations/013_v11_database_activation_foundation.sql");
const seedPath = resolve(root, "supabase/seed_v11_database_activation_demo.sql");
const expectedTables = [
  "workspaces",
  "workspace_members",
  "portfolios",
  "portfolio_positions",
  "stock_positions",
  "crypto_positions",
  "fcn_positions",
  "fcn_underlyings",
  "fcn_coupon_schedules",
  "watchlists",
  "watchlist_items",
  "alert_history",
  "workspace_audit_logs",
];
const expectedIndexes = [
  "workspaces_owner_id_idx",
  "workspace_members_workspace_id_idx",
  "portfolio_positions_workspace_id_idx",
  "stock_positions_workspace_id_idx",
  "crypto_positions_workspace_id_idx",
  "fcn_positions_workspace_id_idx",
  "fcn_underlyings_workspace_id_idx",
  "fcn_coupon_schedules_workspace_id_idx",
  "watchlists_workspace_id_idx",
  "watchlist_items_workspace_id_idx",
  "alert_history_workspace_id_idx",
  "workspace_audit_logs_workspace_id_idx",
];

function read(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

const migration = read(migrationPath);
const seed = read(seedPath);
const missingTables = expectedTables.filter((table) => !migration.includes(table));
const missingIndexes = expectedIndexes.filter((index) => !migration.includes(index));
const result = {
  checkedAt: new Date().toISOString(),
  dryRunOnly: true,
  migrationFileExists: existsSync(migrationPath),
  missingIndexes,
  missingTables,
  productionWarningsPresent:
    migration.includes("REVIEW REQUIRED BEFORE PRODUCTION APPLICATION") &&
    migration.includes("Do not run against production automatically"),
  remoteMigrationExecuted: false,
  rollbackNotesPresent:
    migration.includes("reviewed, staged, backed up") ||
    migration.includes("rollback"),
  seedFileExists: existsSync(seedPath),
  seedWarningsPresent:
    seed.includes("DO NOT RUN AGAINST PRODUCTION") &&
    seed.includes("placeholder UUID"),
  workspaceOwnershipLinkagePresent:
    migration.includes("owner_id") &&
    migration.includes("workspace_id") &&
    migration.includes("workspace_members"),
};

console.log(JSON.stringify(result, null, 2));
