import {
  buildMarketNewsSnapshot,
  buildMarketSnapshot,
  getMarketProviderHealth,
  getMarketProviderStatus,
} from "@/src/lib/market/market-center";
import {
  fetchBinanceCryptoQuote,
  isSupportedBinanceCryptoSymbol,
} from "@/src/lib/market/providers/binance";
import {
  fetchYahooEquityQuote,
  isSupportedYahooEquitySymbol,
} from "@/src/lib/market/providers/yahoo-finance";
import type { MarketProviderId } from "@/src/lib/market/market-provider";
import type {
  MarketNewsSnapshot,
  MarketProviderStatusSnapshot,
  MarketQuote,
  MarketSnapshot,
} from "@/src/lib/market/market-types";
import type { ProviderHealthSummary } from "@/src/lib/market/provider-health";
import type {
  MarketAssetType,
  MarketQuoteError,
  MarketQuoteResult,
  MarketQuote as UnifiedMarketQuote,
} from "@/src/lib/market/types";

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

function unavailableQuoteResult(input: {
  assetType?: MarketAssetType | "unknown";
  message: string;
  provider?: "unknown";
  requestedSymbol: string;
  symbol: string;
}): MarketQuoteResult<UnifiedMarketQuote> {
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
  const requestedSymbol = symbol;
  const normalizedSymbol = normalizeSymbol(symbol);

  if (!normalizedSymbol) {
    return unavailableQuoteResult({
      message: "Market quote request did not include a symbol.",
      requestedSymbol,
      symbol: normalizedSymbol,
    });
  }

  if (isSupportedBinanceCryptoSymbol(normalizedSymbol)) {
    return fetchBinanceCryptoQuote(normalizedSymbol);
  }

  if (isSupportedYahooEquitySymbol(normalizedSymbol)) {
    return fetchYahooEquityQuote(normalizedSymbol);
  }

  return unavailableQuoteResult({
    message: "Symbol is not supported by the v4.20 market-service routing table.",
    requestedSymbol,
    symbol: normalizedSymbol,
  });
}

export async function getMarketQuotes(
  symbols: string[],
): Promise<MarketQuoteResult<UnifiedMarketQuote>[]> {
  const dedupedSymbols = uniqueSymbols(symbols);

  if (dedupedSymbols.length === 0) {
    return [];
  }

  const results = await Promise.allSettled(
    dedupedSymbols.map((symbol) => getMarketQuote(symbol)),
  );

  return results.map((result, index) => {
    const symbol = dedupedSymbols[index] ?? "";

    if (result.status === "fulfilled") {
      return result.value;
    }

    return unavailableQuoteResult({
      message:
        result.reason instanceof Error
          ? result.reason.message
          : "Market quote provider failed before returning a result.",
      requestedSymbol: symbol,
      symbol,
    });
  });
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
        description: "Returns a unified live/delayed/unavailable quote result for one v4.20 supported symbol.",
        enabled: true,
        name: "getMarketQuote",
      },
      {
        description: "Returns stable unified quote results for a deduplicated symbol list.",
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
      "Market Service Layer is enabled with provider registry metadata, provider health metadata, and v4.20 public equity / crypto quote adapters. Quote failures return unavailable results instead of blocking Workspace readback.",
  };
}
