import type {
  MarketNewsSnapshot,
  MarketProviderStatus,
  MarketQuote,
  MarketSnapshot,
} from "@/src/lib/market/market-types";

export interface MarketProvider {
  id: string;
  label: string;
  status: MarketProviderStatus;
  description: string;
  supportsNews: boolean;
  supportsQuotes: boolean;
  getNews(symbols: string[]): Promise<MarketNewsSnapshot>;
  getQuotes(symbols: string[]): Promise<MarketSnapshot>;
  supportsSymbol(symbol: string): boolean;
}

export interface MarketProviderRegistryEntry {
  id: string;
  label: string;
  provider: MarketProvider;
  status: MarketProviderStatus;
}

export type MarketProviderId = "mock";

export function emptyMarketSnapshot(input: {
  providerId: string;
  requestedSymbols: string[];
  warnings?: string[];
}): MarketSnapshot {
  return {
    generatedAt: new Date().toISOString(),
    providerId: input.providerId,
    quotes: [],
    requestedSymbols: input.requestedSymbols,
    status: "placeholder",
    warnings: input.warnings ?? [],
  };
}

export function toMarketSnapshot(input: {
  providerId: string;
  quotes: MarketQuote[];
  requestedSymbols: string[];
  warnings?: string[];
}): MarketSnapshot {
  return {
    generatedAt: new Date().toISOString(),
    providerId: input.providerId,
    quotes: input.quotes,
    requestedSymbols: input.requestedSymbols,
    status: input.quotes.length > 0 ? "mock" : "placeholder",
    warnings: input.warnings ?? [],
  };
}
