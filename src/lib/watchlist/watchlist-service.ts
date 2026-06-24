"use client";

import { getMarketQuotes } from "@/src/lib/market/market-service";
import {
  getWatchlist,
  type WatchlistItem,
} from "@/src/lib/watchlist";
import {
  buildWorkspaceWatchlistSummary,
} from "@/src/lib/watchlist/watchlist-engine";
import { readLiveWatchlistItems } from "@/src/lib/watchlist/persistence";
import type {
  WorkspaceWatchlistAssetType,
  WorkspaceWatchlistItem,
  WorkspaceWatchlistSummary,
} from "@/src/lib/watchlist/watchlist-types";
import {
  getDatabaseReadPriorityMetadata,
  hasArrayData,
  resolveDatabaseReadPriority,
} from "@/src/lib/workspace/database-read-priority";

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase();
}

function toQuoteSymbol(item: WorkspaceWatchlistItem) {
  const symbol = normalizeSymbol(item.symbol);

  if (item.assetType === "crypto" && !symbol.endsWith("USDT")) {
    return `${symbol}USDT`;
  }

  return symbol;
}

function mapLegacyAssetType(item: WatchlistItem): WorkspaceWatchlistAssetType {
  if (item.assetType === "crypto") {
    return "crypto";
  }

  if (item.assetType === "stock" || item.assetType === "etf") {
    return "stock";
  }

  return "unknown";
}

function readLocalWatchlistItems(): WorkspaceWatchlistItem[] {
  try {
    return getWatchlist().map((item) => ({
      assetType: mapLegacyAssetType(item),
      id: `${item.market}:${item.symbol}`,
      name: item.name,
      note: item.note,
      sourceStatus: "local",
      symbol: item.symbol,
      updatedAt: item.addedAt,
    }));
  } catch {
    return [];
  }
}

function fallbackWatchlistItems(): WorkspaceWatchlistItem[] {
  return [
    {
      assetType: "stock",
      id: "fallback-watchlist-nvda",
      name: "NVIDIA",
      note: "Fallback sample only; add symbols in Watchlist to personalize this view.",
      sourceStatus: "fallback",
      symbol: "NVDA",
      updatedAt: new Date().toISOString(),
    },
    {
      assetType: "crypto",
      id: "fallback-watchlist-btc",
      name: "Bitcoin",
      note: "Fallback sample only; no recommendation is implied.",
      sourceStatus: "fallback",
      symbol: "BTC",
      updatedAt: new Date().toISOString(),
    },
  ];
}

export async function getWorkspaceWatchlistSummary(): Promise<WorkspaceWatchlistSummary> {
  const priority = await resolveDatabaseReadPriority<WorkspaceWatchlistItem[]>({
    database: {
      emptyData: [],
      hasData: hasArrayData,
      isDatabaseReady: (items) => items.length > 0,
      read: readLiveWatchlistItems,
    },
    local: {
      emptyData: [],
      hasData: hasArrayData,
      read: () => {
        const localItems = readLocalWatchlistItems();
        return localItems.length > 0 ? localItems : fallbackWatchlistItems();
      },
    },
  });
  const items = priority.data;
  const quoteSymbols = Array.from(new Set(items.map(toQuoteSymbol).filter(Boolean)));
  const quotes = quoteSymbols.length > 0 ? await getMarketQuotes(quoteSymbols) : [];

  return {
    ...buildWorkspaceWatchlistSummary({
    items,
    quotes,
    }),
    readPriority: getDatabaseReadPriorityMetadata(priority),
  };
}
