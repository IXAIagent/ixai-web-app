import type {
  PersistentWatchlistReadback,
} from "@/src/lib/watchlist/persistence/watchlist-persistence-types";

export async function listPersistentWatchlistItems(): Promise<PersistentWatchlistReadback> {
  return {
    generatedAt: new Date().toISOString(),
    items: [],
    sourceStatus: "unavailable",
    warnings: [
      "Persistent watchlists/watchlist_items tables are schema drafts only in V7.50.",
    ],
  };
}
