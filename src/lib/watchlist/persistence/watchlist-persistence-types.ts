import type { WorkspaceWatchlistItem } from "@/src/lib/watchlist/watchlist-types";

export type WatchlistPersistenceSourceStatus =
  | "fallback"
  | "local"
  | "persisted"
  | "unavailable";

export interface WatchlistPersistenceWarning {
  message: string;
  severity: "info" | "warning";
}

export interface WatchlistPersistenceSummary {
  fallbackItems: number;
  generatedAt: string;
  informationalOnlyDisclaimer: string;
  items: WorkspaceWatchlistItem[];
  localItems: number;
  persistedItems: number;
  sourceStatus: WatchlistPersistenceSourceStatus;
  totalItems: number;
  unavailableItems: number;
  warnings: WatchlistPersistenceWarning[];
}
