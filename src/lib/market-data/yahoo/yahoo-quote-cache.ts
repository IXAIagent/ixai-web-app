import "server-only";

import type {
  YahooQuote,
  YahooQuoteCacheDiagnostics,
  YahooQuoteCacheEntry,
} from "@/src/lib/market-data/yahoo/yahoo-quote-types";
import { normalizeYahooSymbol } from "@/src/lib/market-data/yahoo/yahoo-quote-normalizer";

export const YAHOO_QUOTE_CACHE_TTL_SECONDS = 60;

const cache = new Map<string, YahooQuoteCacheEntry>();

function buildExpiry(now: Date) {
  return new Date(now.getTime() + YAHOO_QUOTE_CACHE_TTL_SECONDS * 1000);
}

export function getCachedYahooQuote(symbol: string): YahooQuoteCacheEntry | null {
  return cache.get(normalizeYahooSymbol(symbol)) ?? null;
}

export function isYahooQuoteCacheEntryFresh(entry: YahooQuoteCacheEntry, now = new Date()) {
  return new Date(entry.expiresAt).getTime() > now.getTime();
}

export function setCachedYahooQuote(symbol: string, quote: YahooQuote) {
  const now = new Date();
  cache.set(normalizeYahooSymbol(symbol), {
    cachedAt: now.toISOString(),
    expiresAt: buildExpiry(now).toISOString(),
    quote,
  });
}

export function clearYahooQuoteCache() {
  cache.clear();
}

export function getYahooQuoteCacheDiagnostics(): YahooQuoteCacheDiagnostics {
  const now = new Date();
  const entries = Array.from(cache.values());
  const freshCount = entries.filter((entry) => isYahooQuoteCacheEntryFresh(entry, now)).length;

  return {
    cacheTtlSeconds: YAHOO_QUOTE_CACHE_TTL_SECONDS,
    entryCount: entries.length,
    freshCount,
    generatedAt: now.toISOString(),
    staleCount: entries.length - freshCount,
  };
}
