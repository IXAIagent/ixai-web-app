import type { WorkspaceWatchlistItem } from "@/src/lib/watchlist/watchlist-types";

export type WatchlistPersistenceSourceStatus =
  | "error"
  | "fallback"
  | "local"
  | "partial"
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

export interface PersistentWatchlistReadback {
  generatedAt: string;
  items: WorkspaceWatchlistItem[];
  sourceStatus: WatchlistPersistenceSourceStatus;
  warnings: string[];
}

export interface WatchlistPersistenceReadiness {
  generatedAt: string;
  hasLocalFallback: boolean;
  persistedItemCount: number;
  sourceStatus: WatchlistPersistenceSourceStatus;
  summary: string;
  warnings: string[];
}
