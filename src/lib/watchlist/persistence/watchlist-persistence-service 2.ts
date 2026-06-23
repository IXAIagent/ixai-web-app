"use client";

import { getWorkspaceWatchlistSummary } from "@/src/lib/watchlist/watchlist-service";
import type {
  WatchlistPersistenceSummary,
  WatchlistPersistenceWarning,
} from "@/src/lib/watchlist/persistence/watchlist-persistence-types";

export async function getWatchlistPersistenceSummary(): Promise<WatchlistPersistenceSummary> {
  try {
    const watchlist = await getWorkspaceWatchlistSummary();
    const items = watchlist.items.map((item) => ({
      alertAbove: item.alertAbove,
      alertBelow: item.alertBelow,
      assetType: item.assetType,
      id: item.id,
      name: item.name,
      note: item.note,
      sourceStatus: item.sourceStatus,
      symbol: item.symbol,
      targetPrice: item.targetPrice,
      updatedAt: item.updatedAt,
    }));
    const localItems = items.filter((item) => item.sourceStatus === "local").length;
    const fallbackItems = items.filter((item) => item.sourceStatus === "fallback").length;
    const warnings: WatchlistPersistenceWarning[] = [
      {
        message:
          "Watchlist persistence is a V6 foundation. Durable Supabase tables are planned but not required at runtime.",
        severity: "info",
      },
    ];

    return {
      fallbackItems,
      generatedAt: new Date().toISOString(),
      informationalOnlyDisclaimer:
        "Watchlist persistence status is informational only. No trading or recommendations are provided.",
      items,
      localItems,
      persistedItems: 0,
      sourceStatus: localItems > 0 ? "local" : fallbackItems > 0 ? "fallback" : "unavailable",
      totalItems: items.length,
      unavailableItems: 0,
      warnings,
    };
  } catch {
    return {
      fallbackItems: 0,
      generatedAt: new Date().toISOString(),
      informationalOnlyDisclaimer:
        "Watchlist persistence status is informational only. No trading or recommendations are provided.",
      items: [],
      localItems: 0,
      persistedItems: 0,
      sourceStatus: "unavailable",
      totalItems: 0,
      unavailableItems: 0,
      warnings: [
        {
          message: "Watchlist persistence readback is unavailable.",
          severity: "warning",
        },
      ],
    };
  }
}
