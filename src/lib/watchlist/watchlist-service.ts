"use client";

import type {
  MarketQuote,
  MarketQuoteResult,
  MarketQuoteState,
} from "@/src/lib/market/types";
import { getWorkspaceLiveMarketSnapshot } from "@/src/lib/market-data";
import type { WorkspaceLiveMarketQuote } from "@/src/lib/market-data";
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

function mapMarketState(state: WorkspaceLiveMarketQuote["marketState"]): MarketQuoteState {
  if (state === "regular") return "open";
  if (state === "premarket") return "pre_market";
  if (state === "postmarket") return "post_market";
  if (state === "closed") return "closed";
  return "unknown";
}

function liveQuoteToMarketQuoteResult(
  item: WorkspaceWatchlistItem,
  quote: WorkspaceLiveMarketQuote | null,
): MarketQuoteResult<MarketQuote> {
  const requestedSymbol = toQuoteSymbol(item);
  const normalizedSymbol = normalizeSymbol(item.symbol);

  if (!quote) {
    return {
      error: {
        assetType: item.assetType === "crypto" ? "crypto" : item.assetType === "stock" ? "equity" : "unknown",
        message: "Live Market Service quote unavailable.",
        provider: "yahoo_finance",
        sourceStatus: "unavailable",
        symbol: normalizedSymbol,
        updatedAt: new Date().toISOString(),
      },
      quote: null,
      requestedSymbol,
      sourceStatus: "unavailable",
      symbol: normalizedSymbol,
    };
  }

  return {
    error: null,
    quote: {
      assetType: item.assetType === "crypto" ? "crypto" : "equity",
      change: quote.change,
      changePercent: quote.changePercent,
      currency: quote.currency ?? "USD",
      marketState: mapMarketState(quote.marketState),
      price: quote.price,
      provider: "yahoo_finance",
      sourceStatus: quote.sourceStatus === "stale" ? "fallback" : quote.sourceStatus,
      symbol: normalizedSymbol,
      updatedAt: quote.asOf ?? new Date().toISOString(),
    },
    requestedSymbol,
    sourceStatus: quote.sourceStatus === "stale" ? "fallback" : quote.sourceStatus,
    symbol: normalizedSymbol,
  };
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
  const liveMarketSnapshot = await getWorkspaceLiveMarketSnapshot({
    extraSymbols: quoteSymbols,
    truth: null,
  });
  const liveQuotesBySymbol = new Map(
    liveMarketSnapshot.availableQuotes.map((quote) => [normalizeSymbol(quote.symbol), quote]),
  );
  const quotes = items.map((item) =>
    liveQuoteToMarketQuoteResult(item, liveQuotesBySymbol.get(toQuoteSymbol(item)) ?? null),
  );

  return {
    ...buildWorkspaceWatchlistSummary({
    items,
    quotes,
    }),
    liveMarketAsOf: liveMarketSnapshot.asOf,
    liveMarketSource: liveMarketSnapshot.provider,
    missingQuoteCount: liveMarketSnapshot.missingSymbols.length,
    readPriority: getDatabaseReadPriorityMetadata(priority),
    staleQuoteCount: liveMarketSnapshot.staleSymbols.length,
  };
}
