import {
  fetchBinanceCryptoQuote,
  isSupportedBinanceCryptoSymbol,
} from "@/src/lib/market/providers/binance";
import {
  fetchYahooEquityQuote,
  isSupportedYahooEquitySymbol,
} from "@/src/lib/market/providers/yahoo-finance";
import {
  recordMarketProviderFailure,
  recordMarketProviderSuccess,
} from "@/src/lib/market/provider-health";
import {
  getCachedQuote,
  getMarketCacheSnapshot,
  setCachedQuote,
} from "@/src/lib/market/cache/market-cache-store";
import type {
  MarketAssetType,
  MarketProviderName,
  MarketQuote,
  MarketQuoteError,
  MarketQuoteResult,
} from "@/src/lib/market/types";
import type { MarketCacheEntry } from "@/src/lib/market/cache/market-cache-types";

const EQUITY_CACHE_TTL_MS = 60 * 1000;
const CRYPTO_CACHE_TTL_MS = 30 * 1000;

const DEFAULT_CACHE_WARM_SYMBOLS = [
  "AAPL",
  "TSLA",
  "NVDA",
  "MSFT",
  "GOOGL",
  "BTCUSDT",
  "ETHUSDT",
  "BNBUSDT",
] as const;

const pendingQuoteRequests = new Map<string, Promise<MarketQuoteResult<MarketQuote>>>();

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase();
}

function uniqueSymbols(symbols: string[]) {
  return Array.from(new Set(symbols.map(normalizeSymbol).filter(Boolean)));
}

function addMilliseconds(date: Date, milliseconds: number) {
  return new Date(date.getTime() + milliseconds);
}

function providerForSymbol(symbol: string): {
  assetType: MarketAssetType | "unknown";
  provider: MarketProviderName;
  ttlMs: number;
} {
  if (isSupportedBinanceCryptoSymbol(symbol)) {
    return {
      assetType: "crypto",
      provider: "binance",
      ttlMs: CRYPTO_CACHE_TTL_MS,
    };
  }

  if (isSupportedYahooEquitySymbol(symbol)) {
    return {
      assetType: "equity",
      provider: "yahoo_finance",
      ttlMs: EQUITY_CACHE_TTL_MS,
    };
  }

  return {
    assetType: "unknown",
    provider: "unknown",
    ttlMs: 0,
  };
}

function unavailableQuoteResult(input: {
  assetType?: MarketAssetType | "unknown";
  message: string;
  provider?: MarketProviderName;
  requestedSymbol: string;
  symbol: string;
}): MarketQuoteResult<MarketQuote> {
  const updatedAt = new Date().toISOString();
  const error: MarketQuoteError = {
    assetType: input.assetType ?? "unknown",
    message: input.message,
    provider: input.provider ?? "unknown",
    sourceStatus: "unavailable",
    symbol: input.symbol,
    updatedAt,
  };

  return {
    error,
    quote: null,
    requestedSymbol: input.requestedSymbol,
    sourceStatus: "unavailable",
    symbol: input.symbol,
  };
}

function resultFromCachedEntry(
  entry: MarketCacheEntry,
  requestedSymbol: string,
  staleFallback = false,
): MarketQuoteResult<MarketQuote> {
  if (!entry.quote) {
    return unavailableQuoteResult({
      assetType: "unknown",
      message: "Cached market quote is unavailable.",
      provider: entry.provider,
      requestedSymbol,
      symbol: entry.symbol,
    });
  }

  const quote: MarketQuote = staleFallback
    ? {
        ...entry.quote,
        sourceNote: "Returned from stale IXAI in-memory cache after provider refresh failed.",
        sourceStatus: "stale",
      }
    : entry.quote;

  return {
    error: null,
    quote,
    requestedSymbol,
    sourceStatus: quote.sourceStatus,
    symbol: entry.symbol,
  };
}

async function fetchProviderQuote(
  symbol: string,
): Promise<MarketQuoteResult<MarketQuote>> {
  if (isSupportedBinanceCryptoSymbol(symbol)) {
    return fetchBinanceCryptoQuote(symbol);
  }

  if (isSupportedYahooEquitySymbol(symbol)) {
    return fetchYahooEquityQuote(symbol);
  }

  const routing = providerForSymbol(symbol);

  return unavailableQuoteResult({
    assetType: routing.assetType,
    message: "Symbol is not supported by the v4.70 market-cache routing table.",
    provider: routing.provider,
    requestedSymbol: symbol,
    symbol,
  });
}

export async function refreshQuote(
  symbol: string,
): Promise<MarketQuoteResult<MarketQuote>> {
  const requestedSymbol = symbol;
  const normalizedSymbol = normalizeSymbol(symbol);
  const routing = providerForSymbol(normalizedSymbol);

  if (!normalizedSymbol || routing.provider === "unknown") {
    return unavailableQuoteResult({
      assetType: routing.assetType,
      message: "Market cache request did not include a supported symbol.",
      provider: routing.provider,
      requestedSymbol,
      symbol: normalizedSymbol,
    });
  }

  const result = await fetchProviderQuote(normalizedSymbol);
  const now = new Date();

  if (result.quote) {
    recordMarketProviderSuccess(routing.provider);
  } else {
    recordMarketProviderFailure(
      routing.provider,
      result.error?.message ?? "Provider returned an unavailable quote result.",
    );
  }

  setCachedQuote({
    cachedAt: now.toISOString(),
    expiresAt: addMilliseconds(now, result.quote ? routing.ttlMs : 0).toISOString(),
    provider: routing.provider,
    quote: result.quote,
    status: result.quote ? "fresh" : "unavailable",
    symbol: result.symbol || normalizedSymbol,
  });

  return result;
}

export async function getQuoteWithCache(
  symbol: string,
): Promise<MarketQuoteResult<MarketQuote>> {
  const requestedSymbol = symbol;
  const normalizedSymbol = normalizeSymbol(symbol);
  const routing = providerForSymbol(normalizedSymbol);

  if (!normalizedSymbol || routing.provider === "unknown") {
    return unavailableQuoteResult({
      assetType: routing.assetType,
      message: "Market cache request did not include a supported symbol.",
      provider: routing.provider,
      requestedSymbol,
      symbol: normalizedSymbol,
    });
  }

  const cachedEntry = getCachedQuote(normalizedSymbol, routing.provider);

  if (cachedEntry?.status === "fresh" && cachedEntry.quote) {
    return resultFromCachedEntry(cachedEntry, requestedSymbol);
  }

  const pendingKey = `${routing.provider}:${normalizedSymbol}`;
  const pending = pendingQuoteRequests.get(pendingKey);
  const refreshedResult = pending
    ? await pending
    : await (() => {
        const request = refreshQuote(normalizedSymbol).finally(() => {
          pendingQuoteRequests.delete(pendingKey);
        });
        pendingQuoteRequests.set(pendingKey, request);
        return request;
      })();

  if (refreshedResult.quote) {
    return refreshedResult;
  }

  if (cachedEntry?.quote) {
    return resultFromCachedEntry(cachedEntry, requestedSymbol, true);
  }

  return refreshedResult;
}

export async function getQuotesWithCache(
  symbols: string[],
): Promise<MarketQuoteResult<MarketQuote>[]> {
  const dedupedSymbols = uniqueSymbols(symbols);

  if (dedupedSymbols.length === 0) {
    return [];
  }

  const results = await Promise.allSettled(
    dedupedSymbols.map((symbol) => getQuoteWithCache(symbol)),
  );

  return results.map((result, index) => {
    const symbol = dedupedSymbols[index] ?? "";

    if (result.status === "fulfilled") {
      return result.value;
    }

    const routing = providerForSymbol(symbol);

    return unavailableQuoteResult({
      assetType: routing.assetType,
      message:
        result.reason instanceof Error
          ? result.reason.message
          : "Market cache failed before returning a quote result.",
      provider: routing.provider,
      requestedSymbol: symbol,
      symbol,
    });
  });
}

export async function warmDefaultMarketCache(symbols: string[] = [...DEFAULT_CACHE_WARM_SYMBOLS]) {
  await getQuotesWithCache(symbols);
  return getMarketCacheSnapshot();
}
