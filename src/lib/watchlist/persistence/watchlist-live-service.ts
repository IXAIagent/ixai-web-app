import {
  checkWatchlistTablesReadiness,
  readWatchlistItemsFromDatabase,
  readWatchlistsFromDatabase,
  upsertWatchlistDraft,
  upsertWatchlistItemDraft,
} from "@/src/lib/watchlist/persistence/watchlist-database-adapter";
import type { WatchlistDatabaseRow } from "@/src/lib/watchlist/persistence/watchlist-database-types";
import type { WorkspaceWatchlistItem } from "@/src/lib/watchlist/watchlist-types";

export interface WatchlistLivePersistenceReadback {
  generatedAt: string;
  items: WorkspaceWatchlistItem[];
  sourceStatus: "partial" | "persisted" | "unavailable";
  warnings: string[];
  watchlists: WatchlistDatabaseRow[];
}

export interface WatchlistLiveWriteResult {
  generatedAt: string;
  ok: boolean;
  sourceStatus: "partial" | "persisted" | "unavailable";
  warning: string;
}

async function guardedWrite(
  write: () => Promise<{ ok: boolean; warning: string }>,
  unavailableWarning: string,
): Promise<WatchlistLiveWriteResult> {
  try {
    const readiness = await checkWatchlistTablesReadiness();

    if (readiness.sourceStatus !== "ready") {
      return {
        generatedAt: new Date().toISOString(),
        ok: false,
        sourceStatus: readiness.sourceStatus === "partial" ? "partial" : "unavailable",
        warning: `${unavailableWarning} Watchlist tables are not fully ready; local fallback remains primary.`,
      };
    }

    const result = await write();

    return {
      generatedAt: new Date().toISOString(),
      ok: result.ok,
      sourceStatus: result.ok ? "persisted" : "partial",
      warning: result.warning,
    };
  } catch {
    return {
      generatedAt: new Date().toISOString(),
      ok: false,
      sourceStatus: "unavailable",
      warning: `${unavailableWarning} Database write guard failed safely; local fallback remains active.`,
    };
  }
}

export async function readLiveWatchlists(): Promise<WatchlistDatabaseRow[]> {
  try {
    return readWatchlistsFromDatabase();
  } catch {
    return [];
  }
}

export async function readLiveWatchlistItems(): Promise<WorkspaceWatchlistItem[]> {
  try {
    return readWatchlistItemsFromDatabase();
  } catch {
    return [];
  }
}

export async function getLiveWatchlistPersistenceReadback(): Promise<WatchlistLivePersistenceReadback> {
  try {
    const [watchlists, items, readiness] = await Promise.all([
      readLiveWatchlists(),
      readLiveWatchlistItems(),
      checkWatchlistTablesReadiness(),
    ]);
    const liveCount = watchlists.length + items.length;

    return {
      generatedAt: new Date().toISOString(),
      items,
      sourceStatus:
        liveCount > 0
          ? "persisted"
          : readiness.sourceStatus === "partial"
            ? "partial"
            : "unavailable",
      warnings:
        liveCount > 0
          ? readiness.warnings
          : [
              "Watchlist live tables are empty or unavailable; local/fallback watchlist remains active.",
              ...readiness.warnings,
            ],
      watchlists,
    };
  } catch {
    return {
      generatedAt: new Date().toISOString(),
      items: [],
      sourceStatus: "unavailable",
      warnings: ["Watchlist live persistence readback failed safely; local fallback remains active."],
      watchlists: [],
    };
  }
}

export async function saveWatchlistToDatabase(): Promise<WatchlistLiveWriteResult> {
  return guardedWrite(upsertWatchlistDraft, "Watchlist was not written to database.");
}

export async function saveWatchlistItemToDatabase(): Promise<WatchlistLiveWriteResult> {
  return guardedWrite(upsertWatchlistItemDraft, "Watchlist item was not written to database.");
}

export async function getLiveWatchlistPersistenceReadiness() {
  const readback = await getLiveWatchlistPersistenceReadback();

  return {
    generatedAt: readback.generatedAt,
    liveItems: readback.items.length,
    liveWatchlists: readback.watchlists.length,
    sourceStatus: readback.sourceStatus,
    summary:
      "V9.30 Watchlist live persistence reads database tables when available while preserving local/fallback watchlist behavior.",
    warnings: readback.warnings,
  };
}
