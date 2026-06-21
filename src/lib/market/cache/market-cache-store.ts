import type { MarketProviderName } from "@/src/lib/market/types";
import type {
  MarketCacheEntry,
  MarketCacheSnapshot,
  MarketCacheStatus,
} from "@/src/lib/market/cache/market-cache-types";

const marketCache = new Map<string, MarketCacheEntry>();
let lastRefreshAt: string | null = null;

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase();
}

function buildCacheKey(symbol: string, provider?: MarketProviderName) {
  return `${provider ?? "unknown"}:${normalizeSymbol(symbol)}`;
}

function getEntryStatus(entry: MarketCacheEntry, now = new Date()): MarketCacheStatus {
  if (!entry.quote) {
    return "unavailable";
  }

  const expiresAt = new Date(entry.expiresAt);

  if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= now.getTime()) {
    return "stale";
  }

  return "fresh";
}

function normalizeEntry(entry: MarketCacheEntry): MarketCacheEntry {
  return {
    ...entry,
    status: getEntryStatus(entry),
  };
}

export function getCachedQuote(
  symbol: string,
  provider?: MarketProviderName,
): MarketCacheEntry | null {
  const normalizedSymbol = normalizeSymbol(symbol);

  if (!normalizedSymbol) {
    return null;
  }

  if (provider) {
    const entry = marketCache.get(buildCacheKey(normalizedSymbol, provider));
    return entry ? normalizeEntry(entry) : null;
  }

  const entry = Array.from(marketCache.values()).find(
    (candidate) => candidate.symbol === normalizedSymbol,
  );

  return entry ? normalizeEntry(entry) : null;
}

export function setCachedQuote(entry: MarketCacheEntry): MarketCacheEntry {
  const normalizedEntry: MarketCacheEntry = normalizeEntry({
    ...entry,
    symbol: normalizeSymbol(entry.symbol),
  });

  marketCache.set(
    buildCacheKey(normalizedEntry.symbol, normalizedEntry.provider),
    normalizedEntry,
  );
  lastRefreshAt = normalizedEntry.cachedAt;

  return normalizedEntry;
}

export function invalidateCachedQuote(symbol: string, provider?: MarketProviderName) {
  const normalizedSymbol = normalizeSymbol(symbol);

  if (!normalizedSymbol) {
    return;
  }

  if (provider) {
    marketCache.delete(buildCacheKey(normalizedSymbol, provider));
    return;
  }

  for (const [key, entry] of marketCache.entries()) {
    if (entry.symbol === normalizedSymbol) {
      marketCache.delete(key);
    }
  }
}

export function clearMarketCache() {
  marketCache.clear();
  lastRefreshAt = null;
}

export function getMarketCacheSnapshot(): MarketCacheSnapshot {
  const entries = Array.from(marketCache.values())
    .map(normalizeEntry)
    .sort((a, b) => a.symbol.localeCompare(b.symbol));

  return {
    entries,
    metadata: {
      entryCount: entries.length,
      freshCount: entries.filter((entry) => entry.status === "fresh").length,
      generatedAt: new Date().toISOString(),
      lastRefreshAt,
      staleCount: entries.filter((entry) => entry.status === "stale").length,
      unavailableCount: entries.filter((entry) => entry.status === "unavailable").length,
    },
  };
}
