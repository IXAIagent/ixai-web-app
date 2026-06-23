import type { DatabaseActivationTableStatus } from "@/src/lib/persistence/database-activation-utils";

export interface WatchlistDatabaseRow {
  created_at?: string;
  id: string;
  name?: string;
  updated_at?: string;
  user_id?: string;
}

export interface WatchlistItemDatabaseRow {
  alert_above?: number | null;
  alert_below?: number | null;
  asset_type?: string | null;
  created_at?: string;
  id: string;
  name?: string | null;
  note?: string | null;
  symbol?: string | null;
  target_price?: number | null;
  updated_at?: string;
  watchlist_id?: string;
}

export interface WatchlistDatabaseTableReadiness {
  generatedAt: string;
  sourceStatus: "partial" | "ready" | "unavailable";
  tables: Array<{
    name: "watchlist_items" | "watchlists";
    status: DatabaseActivationTableStatus;
    warnings: string[];
  }>;
  warnings: string[];
}
