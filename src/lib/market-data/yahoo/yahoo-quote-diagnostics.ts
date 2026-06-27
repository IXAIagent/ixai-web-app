import "server-only";

import { YAHOO_QUOTE_CACHE_TTL_SECONDS } from "@/src/lib/market-data/yahoo/yahoo-quote-cache";
import { LIVE_PRODUCT_1_DEFAULT_SYMBOLS } from "@/src/lib/market-data/yahoo/yahoo-quote-provider";
import type { YahooQuoteProviderDiagnostics } from "@/src/lib/market-data/yahoo/yahoo-quote-types";

export function getYahooQuoteProviderDiagnostics(): YahooQuoteProviderDiagnostics {
  return {
    brokerEnabled: false,
    cacheTtlSeconds: YAHOO_QUOTE_CACHE_TTL_SECONDS,
    dbWritesEnabled: false,
    externalFetchEnabled: true,
    generatedAt: new Date().toISOString(),
    provider: "yahoo",
    readOnly: true,
    recommendationLogicEnabled: false,
    supportedSymbols: LIVE_PRODUCT_1_DEFAULT_SYMBOLS,
    tradingEnabled: false,
  };
}
