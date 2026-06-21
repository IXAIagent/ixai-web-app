import type {
  MarketProviderName,
  MarketQuote,
} from "@/src/lib/market/types";

export type MarketCacheStatus = "fresh" | "stale" | "unavailable";

export interface MarketCacheEntry<TQuote extends MarketQuote = MarketQuote> {
  cachedAt: string;
  expiresAt: string;
  provider: MarketProviderName;
  quote: TQuote | null;
  status: MarketCacheStatus;
  symbol: string;
}

export interface MarketCacheMetadata {
  entryCount: number;
  freshCount: number;
  generatedAt: string;
  lastRefreshAt: string | null;
  staleCount: number;
  unavailableCount: number;
}

export interface MarketCacheSnapshot {
  entries: MarketCacheEntry[];
  metadata: MarketCacheMetadata;
}
