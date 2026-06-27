import type { YahooQuoteSnapshot } from "@/src/lib/market-data/yahoo";
import type {
  WorkspaceLiveMarketQuote,
  WorkspaceLiveMarketSnapshot,
} from "@/src/lib/market-data/live-market-types";

function normalizeSymbol(value: string | null | undefined) {
  return (value ?? "").trim().toUpperCase();
}

function inferMarketState(quotes: WorkspaceLiveMarketQuote[]): WorkspaceLiveMarketSnapshot["marketState"] {
  const states = Array.from(new Set(quotes.map((quote) => quote.marketState)));

  if (states.length === 0) return "unknown";
  if (states.length === 1) return states[0] ?? "unknown";
  return "mixed";
}

function inferAsOf(quotes: WorkspaceLiveMarketQuote[], generatedAt: string) {
  const timestamps = quotes
    .map((quote) => quote.asOf)
    .filter((value): value is string => Boolean(value))
    .toSorted();

  return timestamps.at(-1) ?? generatedAt;
}

export function buildUnavailableLiveMarketSnapshot(
  requestedSymbols: string[],
): WorkspaceLiveMarketSnapshot {
  const generatedAt = new Date().toISOString();

  return {
    asOf: generatedAt,
    availableQuotes: [],
    cacheStatus: "unavailable",
    dataQuality: "unavailable",
    generatedAt,
    informationalOnlyDisclaimer:
      "Live market data is read-only and informational only. IXAI does not provide investment recommendations, order execution, or trading instructions.",
    marketState: "unknown",
    missingSymbols: requestedSymbols.map(normalizeSymbol).filter(Boolean),
    provider: "yahoo",
    readOnly: true,
    requestedSymbols: requestedSymbols.map(normalizeSymbol).filter(Boolean),
    sourceSnapshot: null,
    staleSymbols: [],
  };
}

export function buildWorkspaceLiveMarketSnapshot(
  yahooSnapshot: YahooQuoteSnapshot | null,
  requestedSymbols: string[],
): WorkspaceLiveMarketSnapshot {
  if (!yahooSnapshot) {
    return buildUnavailableLiveMarketSnapshot(requestedSymbols);
  }

  const availableQuotes: WorkspaceLiveMarketQuote[] = yahooSnapshot.quotes
    .filter((quote) => quote.price !== null && quote.dataQuality !== "unavailable")
    .map((quote) => ({
      asOf: quote.asOf,
      change: quote.change,
      changePercent: quote.changePercent,
      currency: quote.currency,
      marketState: quote.marketState,
      price: quote.price,
      provider: "yahoo",
      sourceQuote: quote,
      sourceStatus: quote.dataQuality,
      symbol: quote.symbol,
    }));

  return {
    asOf: inferAsOf(availableQuotes, yahooSnapshot.generatedAt),
    availableQuotes,
    cacheStatus: yahooSnapshot.cacheStatus,
    dataQuality: yahooSnapshot.dataQuality,
    generatedAt: yahooSnapshot.generatedAt,
    informationalOnlyDisclaimer: yahooSnapshot.informationalOnlyDisclaimer,
    marketState: inferMarketState(availableQuotes),
    missingSymbols: yahooSnapshot.missingQuoteSymbols,
    provider: "yahoo",
    readOnly: true,
    requestedSymbols: yahooSnapshot.requestedSymbols,
    sourceSnapshot: yahooSnapshot,
    staleSymbols: yahooSnapshot.staleQuoteSymbols,
  };
}
