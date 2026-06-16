import {
  buildMarketNewsSnapshot,
  buildMarketSnapshot,
  getMarketProviderHealth,
  getMarketProviderStatus,
} from "@/src/lib/market/market-center";
import type { MarketProviderId } from "@/src/lib/market/market-provider";
import type {
  MarketNewsSnapshot,
  MarketProviderStatusSnapshot,
  MarketQuote,
  MarketSnapshot,
} from "@/src/lib/market/market-types";
import type { ProviderHealthSummary } from "@/src/lib/market/provider-health";

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
    ],
    summary:
      "Market Service Layer is enabled with MockProvider, provider registry metadata, and provider health metadata only. No external market provider is connected.",
  };
}
