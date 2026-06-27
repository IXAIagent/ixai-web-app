export type YahooQuoteDataQuality = "live" | "stale" | "unavailable";

export type YahooQuoteCacheStatus =
  | "hit"
  | "miss"
  | "stale_fallback"
  | "unavailable";

export type YahooMarketState =
  | "closed"
  | "postmarket"
  | "premarket"
  | "regular"
  | "unknown";

export type YahooQuoteSource = "yahoo";

export type YahooQuote = {
  asOf: string | null;
  change: number | null;
  changePercent: number | null;
  currency: string | null;
  dataQuality: YahooQuoteDataQuality;
  errorMessage?: string;
  marketState: YahooMarketState;
  previousClose: number | null;
  price: number | null;
  source: YahooQuoteSource;
  symbol: string;
};

export type YahooQuoteSnapshot = {
  cacheStatus: YahooQuoteCacheStatus;
  cacheTtlSeconds: number;
  dataQuality: "live" | "partial" | "stale" | "unavailable";
  generatedAt: string;
  informationalOnlyDisclaimer: string;
  missingQuoteSymbols: string[];
  quotes: YahooQuote[];
  readOnly: true;
  requestedSymbols: string[];
  source: YahooQuoteSource;
  staleQuoteSymbols: string[];
};

export type YahooQuoteCacheEntry = {
  cachedAt: string;
  expiresAt: string;
  quote: YahooQuote;
};

export type YahooQuoteCacheDiagnostics = {
  cacheTtlSeconds: number;
  entryCount: number;
  freshCount: number;
  generatedAt: string;
  staleCount: number;
};

export type YahooQuoteProviderDiagnostics = {
  brokerEnabled: false;
  cacheTtlSeconds: number;
  dbWritesEnabled: false;
  externalFetchEnabled: true;
  generatedAt: string;
  provider: YahooQuoteSource;
  readOnly: true;
  recommendationLogicEnabled: false;
  supportedSymbols: string[];
  tradingEnabled: false;
};
