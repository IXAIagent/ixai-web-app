import type {
  PersistentWatchlistReadback,
} from "@/src/lib/watchlist/persistence/watchlist-persistence-types";
import { readWatchlistItemsFromDatabase } from "@/src/lib/watchlist/persistence/watchlist-database-adapter";

export async function listPersistentWatchlistItems(): Promise<PersistentWatchlistReadback> {
  try {
    const items = await readWatchlistItemsFromDatabase();

    if (items.length > 0) {
      return {
        generatedAt: new Date().toISOString(),
        items,
        sourceStatus: "persisted",
        warnings: [],
      };
    }
  } catch {
    // Fall through to safe unavailable readback.
  }

  return {
    generatedAt: new Date().toISOString(),
    items: [],
    sourceStatus: "unavailable",
    warnings: [
      "Persistent watchlists/watchlist_items tables are schema drafts only in V7.50.",
    ],
  };
}
