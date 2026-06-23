"use client";

import { getWorkspaceWatchlistSummary } from "@/src/lib/watchlist/watchlist-service";
import { listPersistentWatchlistItems } from "@/src/lib/watchlist/persistence/watchlist-persistence-repository";
import type {
  PersistentWatchlistReadback,
  WatchlistPersistenceReadiness,
  WatchlistPersistenceSummary,
  WatchlistPersistenceWarning,
} from "@/src/lib/watchlist/persistence/watchlist-persistence-types";

export async function getPersistentWatchlistReadback(): Promise<PersistentWatchlistReadback> {
  try {
    return listPersistentWatchlistItems();
  } catch {
    return {
      generatedAt: new Date().toISOString(),
      items: [],
      sourceStatus: "unavailable",
      warnings: ["Persistent watchlist repository failed safely."],
    };
  }
}

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

export async function getWatchlistPersistenceReadiness(): Promise<WatchlistPersistenceReadiness> {
  const [persistent, summary] = await Promise.all([
    getPersistentWatchlistReadback(),
    getWatchlistPersistenceSummary(),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    hasLocalFallback: summary.localItems > 0 || summary.fallbackItems > 0,
    persistedItemCount: persistent.items.length,
    sourceStatus:
      persistent.items.length > 0
        ? "persisted"
        : summary.totalItems > 0
          ? summary.sourceStatus
          : persistent.sourceStatus,
    summary:
      "Watchlist persistence foundation preserves existing local/fallback watchlist readback. Durable tables are not required at runtime.",
    warnings: [...persistent.warnings, ...summary.warnings.map((warning) => warning.message)],
  };
}
