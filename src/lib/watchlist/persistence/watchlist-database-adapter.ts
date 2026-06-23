import {
  readDatabaseTable,
  summarizeTableStatuses,
} from "@/src/lib/persistence/database-activation-utils";
import type {
  WatchlistDatabaseRow,
  WatchlistDatabaseTableReadiness,
  WatchlistItemDatabaseRow,
} from "@/src/lib/watchlist/persistence/watchlist-database-types";
import type { WorkspaceWatchlistItem } from "@/src/lib/watchlist/watchlist-types";

export async function readWatchlistsFromDatabase(): Promise<WatchlistDatabaseRow[]> {
  const result = await readDatabaseTable<WatchlistDatabaseRow>("watchlists");
  return result.rows;
}

export async function readWatchlistItemsFromDatabase(): Promise<WorkspaceWatchlistItem[]> {
  const result = await readDatabaseTable<WatchlistItemDatabaseRow>("watchlist_items");
  return result.rows.map((row) => ({
    alertAbove: row.alert_above ?? undefined,
    alertBelow: row.alert_below ?? undefined,
    assetType:
      row.asset_type === "stock" || row.asset_type === "crypto" || row.asset_type === "fcn_candidate"
        ? row.asset_type
        : "unknown",
    id: row.id,
    name: row.name ?? row.symbol ?? "Watchlist Item",
    note: row.note ?? undefined,
    sourceStatus: "persisted",
    symbol: row.symbol ?? "UNKNOWN",
    targetPrice: row.target_price ?? undefined,
    updatedAt: row.updated_at,
  }));
}

export async function upsertWatchlistDraft() {
  return { ok: false, warning: "Watchlist database writes are disabled by default in V8.30." };
}

export async function upsertWatchlistItemDraft() {
  return { ok: false, warning: "Watchlist item database writes are disabled by default in V8.30." };
}

export async function checkWatchlistTablesReadiness(): Promise<WatchlistDatabaseTableReadiness> {
  const tables = await Promise.all([
    readDatabaseTable<unknown>("watchlists", "id"),
    readDatabaseTable<unknown>("watchlist_items", "id"),
  ]);
  const summary = summarizeTableStatuses(tables);

  return {
    generatedAt: new Date().toISOString(),
    sourceStatus: summary.sourceStatus,
    tables: tables.map((table) => ({
      name: table.table as "watchlist_items" | "watchlists",
      status: table.status,
      warnings: table.warnings,
    })),
    warnings: tables.flatMap((table) => table.warnings),
  };
}
