import "server-only";

import {
  getCachedYahooQuote,
  isYahooQuoteCacheEntryFresh,
  setCachedYahooQuote,
  YAHOO_QUOTE_CACHE_TTL_SECONDS,
} from "@/src/lib/market-data/yahoo/yahoo-quote-cache";
import {
  buildUnavailableYahooQuote,
  normalizeYahooChartResponse,
  normalizeYahooSymbol,
} from "@/src/lib/market-data/yahoo/yahoo-quote-normalizer";
import type {
  YahooQuote,
  YahooQuoteCacheStatus,
  YahooQuoteSnapshot,
} from "@/src/lib/market-data/yahoo/yahoo-quote-types";

const YAHOO_CHART_ENDPOINT = "https://query1.finance.yahoo.com/v8/finance/chart";

export const LIVE_PRODUCT_1_DEFAULT_SYMBOLS = [
  "AAPL",
  "MSFT",
  "NVDA",
  "TSLA",
  "GOOGL",
  "PLTR",
  "AVGO",
  "MDB",
  "AFRM",
  "MRVL",
];

function dedupeSymbols(symbols: string[]) {
  return Array.from(
    new Set(
      symbols
        .map((symbol) => normalizeYahooSymbol(symbol))
        .filter(Boolean),
    ),
  );
}

async function fetchYahooQuote(symbol: string): Promise<YahooQuote> {
  const normalized = normalizeYahooSymbol(symbol);
  const response = await fetch(
    `${YAHOO_CHART_ENDPOINT}/${encodeURIComponent(normalized)}?range=1d&interval=1m`,
    {
      cache: "no-store",
      headers: {
        accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    return buildUnavailableYahooQuote(
      normalized,
      `Yahoo quote request failed with HTTP ${response.status}.`,
    );
  }

  return normalizeYahooChartResponse(normalized, await response.json());
}

async function readQuoteWithCache(symbol: string): Promise<{
  cacheStatus: YahooQuoteCacheStatus;
  quote: YahooQuote;
}> {
  const normalized = normalizeYahooSymbol(symbol);
  const cached = getCachedYahooQuote(normalized);

  if (cached && isYahooQuoteCacheEntryFresh(cached)) {
    return {
      cacheStatus: "hit",
      quote: cached.quote,
    };
  }

  try {
    const quote = await fetchYahooQuote(normalized);

    if (quote.dataQuality === "live") {
      setCachedYahooQuote(normalized, quote);
      return {
        cacheStatus: "miss",
        quote,
      };
    }

    if (cached) {
      return {
        cacheStatus: "stale_fallback",
        quote: {
          ...cached.quote,
          dataQuality: "stale",
          errorMessage: quote.errorMessage,
        },
      };
    }

    return {
      cacheStatus: "unavailable",
      quote,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Yahoo quote request failed.";

    if (cached) {
      return {
        cacheStatus: "stale_fallback",
        quote: {
          ...cached.quote,
          dataQuality: "stale",
          errorMessage,
        },
      };
    }

    return {
      cacheStatus: "unavailable",
      quote: buildUnavailableYahooQuote(normalized, errorMessage),
    };
  }
}

function inferSnapshotCacheStatus(statuses: YahooQuoteCacheStatus[]): YahooQuoteCacheStatus {
  if (statuses.length === 0) return "unavailable";
  if (statuses.every((status) => status === "hit")) return "hit";
  if (statuses.some((status) => status === "stale_fallback")) return "stale_fallback";
  if (statuses.some((status) => status === "miss")) return "miss";
  return "unavailable";
}

function inferSnapshotDataQuality(quotes: YahooQuote[]): YahooQuoteSnapshot["dataQuality"] {
  if (quotes.length === 0 || quotes.every((quote) => quote.dataQuality === "unavailable")) {
    return "unavailable";
  }

  if (quotes.some((quote) => quote.dataQuality === "unavailable")) {
    return "partial";
  }

  if (quotes.some((quote) => quote.dataQuality === "stale")) {
    return "stale";
  }

  return "live";
}

export async function getYahooQuote(symbol: string): Promise<YahooQuote> {
  return (await readQuoteWithCache(symbol)).quote;
}

export async function getYahooQuoteSnapshot(symbols: string[]): Promise<YahooQuoteSnapshot> {
  const requestedSymbols = dedupeSymbols(symbols);
  const results = await Promise.all(requestedSymbols.map(readQuoteWithCache));
  const quotes = results.map((result) => result.quote);
  const missingQuoteSymbols = quotes
    .filter((quote) => quote.dataQuality === "unavailable" || quote.price === null)
    .map((quote) => quote.symbol);
  const staleQuoteSymbols = quotes
    .filter((quote) => quote.dataQuality === "stale")
    .map((quote) => quote.symbol);

  return {
    cacheStatus: inferSnapshotCacheStatus(results.map((result) => result.cacheStatus)),
    cacheTtlSeconds: YAHOO_QUOTE_CACHE_TTL_SECONDS,
    dataQuality: inferSnapshotDataQuality(quotes),
    generatedAt: new Date().toISOString(),
    informationalOnlyDisclaimer:
      "Yahoo quotes are read-only informational market data. IXAI does not provide investment recommendations, order execution, or trading instructions.",
    missingQuoteSymbols,
    quotes,
    readOnly: true,
    requestedSymbols,
    source: "yahoo",
    staleQuoteSymbols,
  };
}
