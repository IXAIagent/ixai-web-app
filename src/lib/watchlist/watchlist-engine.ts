import type { MarketQuoteResult } from "@/src/lib/market/types";
import type {
  WorkspaceWatchlistItem,
  WorkspaceWatchlistItemReadback,
  WorkspaceWatchlistSourceStatus,
  WorkspaceWatchlistSummary,
} from "@/src/lib/watchlist/watchlist-types";

const DISCLAIMER =
  "Watchlist is for monitoring and workflow organization only. It does not provide buy/sell instructions, target-price advice, order execution, or return promises.";

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase();
}

function quoteKey(result: MarketQuoteResult) {
  return normalizeSymbol(result.symbol || result.requestedSymbol);
}

function inferSourceStatus(items: WorkspaceWatchlistItem[]): WorkspaceWatchlistSourceStatus {
  if (items.length === 0) {
    return "unavailable";
  }

  const statuses = new Set(items.map((item) => item.sourceStatus));

  if (statuses.size === 1) {
    return items[0]?.sourceStatus ?? "unavailable";
  }

  return "partial";
}

export function buildWorkspaceWatchlistSummary(input: {
  items: WorkspaceWatchlistItem[];
  quotes: MarketQuoteResult[];
}): WorkspaceWatchlistSummary {
  const quotesBySymbol = new Map(
    input.quotes.map((quote) => [quoteKey(quote), quote]),
  );
  const items: WorkspaceWatchlistItemReadback[] = input.items.map((item) => {
    const normalized = normalizeSymbol(item.symbol);
    const quote = quotesBySymbol.get(normalized) ?? null;

    return {
      ...item,
      quote,
      quoteStatus: quote?.quote?.price ? "available" : "unavailable",
      symbol: normalized,
    };
  });
  const quotedItemCount = items.filter((item) => item.quoteStatus === "available")
    .length;

  return {
    generatedAt: new Date().toISOString(),
    informationalOnlyDisclaimer: DISCLAIMER,
    itemCount: items.length,
    items,
    quotedItemCount,
    sourceStatus: inferSourceStatus(input.items),
    unquotedItemCount: items.length - quotedItemCount,
  };
}
