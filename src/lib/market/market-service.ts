import {
  buildMarketNewsSnapshot,
  buildMarketSnapshot,
  getMarketProviderHealth,
  getMarketProviderStatus,
} from "@/src/lib/market/market-center";
import {
  getQuoteWithCache,
  getQuotesWithCache,
} from "@/src/lib/market/cache";
import type { MarketProviderId } from "@/src/lib/market/market-provider";
import type {
  MarketNewsSnapshot,
  MarketProviderStatusSnapshot,
  MarketQuote,
  MarketSnapshot,
} from "@/src/lib/market/market-types";
import type { ProviderHealthSummary } from "@/src/lib/market/provider-health";
import type {
  MarketQuoteResult,
  MarketQuote as UnifiedMarketQuote,
} from "@/src/lib/market/types";

export {
  getMarketCacheSnapshot,
  refreshQuote,
  warmDefaultMarketCache,
} from "@/src/lib/market/cache";

export interface MarketServiceReadiness {
  generatedAt: string;
  health: ProviderHealthSummary;
  readiness: MarketProviderStatusSnapshot;
  serviceEntrypoints: {
    description: string;
    enabled: boolean;
    name: string;
  }[];
  summary: string;
}

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase();
}

function uniqueSymbols(symbols: string[]) {
  return Array.from(new Set(symbols.map(normalizeSymbol).filter(Boolean)));
}

export const DEFAULT_WORKSPACE_MARKET_SYMBOLS = [
  "AAPL",
  "TSLA",
  "NVDA",
  "MSFT",
  "GOOGL",
  "BTCUSDT",
  "ETHUSDT",
  "BNBUSDT",
] as const;

export async function getQuotes(input: {
  providerId?: MarketProviderId;
  symbols: string[];
}): Promise<MarketSnapshot> {
  return buildMarketSnapshot({
    providerId: input.providerId,
    symbols: input.symbols.map(normalizeSymbol).filter(Boolean),
  });
}

export async function getQuote(input: {
  providerId?: MarketProviderId;
  symbol: string;
}): Promise<MarketQuote | null> {
  const snapshot = await getQuotes({
    providerId: input.providerId,
    symbols: [input.symbol],
  });

  return snapshot.quotes[0] ?? null;
}

export async function getMarketSnapshot(input: {
  providerId?: MarketProviderId;
  symbols: string[];
}): Promise<MarketSnapshot> {
  return getQuotes(input);
}

export async function getMarketNews(input: {
  providerId?: MarketProviderId;
  symbols: string[];
}): Promise<MarketNewsSnapshot> {
  return buildMarketNewsSnapshot({
    providerId: input.providerId,
    symbols: input.symbols.map(normalizeSymbol).filter(Boolean),
  });
}

export function getProviderHealth(): ProviderHealthSummary {
  return getMarketProviderHealth();
}

export async function getMarketQuote(
  symbol: string,
): Promise<MarketQuoteResult<UnifiedMarketQuote>> {
  return getQuoteWithCache(symbol);
}

export async function getMarketQuotes(
  symbols: string[],
): Promise<MarketQuoteResult<UnifiedMarketQuote>[]> {
  return getQuotesWithCache(uniqueSymbols(symbols));
}

export async function getDefaultWorkspaceMarketQuotes() {
  return getMarketQuotes([...DEFAULT_WORKSPACE_MARKET_SYMBOLS]);
}

export function getMarketReadiness(): MarketServiceReadiness {
  const readiness = getMarketProviderStatus();
  const health = getProviderHealth();

  return {
    generatedAt: new Date().toISOString(),
    health,
    readiness,
    serviceEntrypoints: [
      {
        description: "Returns the first available quote for one symbol through the provider registry.",
        enabled: true,
        name: "getQuote",
      },
      {
        description: "Returns quote snapshots for a symbol list through the provider registry.",
        enabled: true,
        name: "getQuotes",
      },
      {
        description: "Returns a market snapshot through the same quote contract.",
        enabled: true,
        name: "getMarketSnapshot",
      },
      {
        description: "Returns mock market-news snapshots through the provider contract.",
        enabled: true,
        name: "getMarketNews",
      },
      {
        description: "Returns deterministic provider health and fallback policy metadata.",
        enabled: true,
        name: "getProviderHealth",
      },
      {
        description: "Returns provider registry readiness and service entrypoint metadata.",
        enabled: true,
        name: "getMarketReadiness",
      },
      {
        description: "Returns a unified live/delayed/fallback/unavailable quote result through the v4.70 market cache layer.",
        enabled: true,
        name: "getMarketQuote",
      },
      {
        description: "Returns stable unified quote results for a deduplicated symbol list through the v4.70 market cache layer.",
        enabled: true,
        name: "getMarketQuotes",
      },
      {
        description: "Returns the default Workspace equity and crypto quote set.",
        enabled: true,
        name: "getDefaultWorkspaceMarketQuotes",
      },
    ],
    summary:
      "Market Service Layer is enabled with provider registry metadata, provider health metadata, v4.20 public equity / crypto quote adapters, and a v4.70 memory-only cache layer. Quote failures return stale fallback or unavailable results instead of blocking Workspace readback.",
  };
}
