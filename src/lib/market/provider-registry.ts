import {
  toMarketSnapshot,
  type MarketProvider,
  type MarketProviderId,
  type MarketProviderRegistryEntry,
} from "@/src/lib/market/market-provider";
import type {
  MarketAssetType,
  MarketNews,
  MarketQuote,
  MarketRegion,
} from "@/src/lib/market/market-types";

const MOCK_PROVIDER_ID = "mock" satisfies MarketProviderId;

const mockQuoteData = {
  AAPL: { assetType: "equity", currency: "USD", name: "Apple", price: 255, region: "US" },
  AVGO: { assetType: "equity", currency: "USD", name: "Broadcom", price: 1720, region: "US" },
  BTC: { assetType: "crypto", currency: "USD", name: "Bitcoin", price: 105000, region: "GLOBAL" },
  ETH: { assetType: "crypto", currency: "USD", name: "Ethereum", price: 5200, region: "GLOBAL" },
  GOOGL: { assetType: "equity", currency: "USD", name: "Alphabet", price: 205, region: "US" },
  MDB: { assetType: "equity", currency: "USD", name: "MongoDB", price: 355, region: "US" },
  MSFT: { assetType: "equity", currency: "USD", name: "Microsoft", price: 510, region: "US" },
  NVDA: { assetType: "equity", currency: "USD", name: "NVIDIA", price: 162, region: "US" },
  ORCL: { assetType: "equity", currency: "USD", name: "Oracle", price: 180, region: "US" },
  PLTR: { assetType: "equity", currency: "USD", name: "Palantir", price: 72, region: "US" },
  TSLA: { assetType: "equity", currency: "USD", name: "Tesla", price: 410, region: "US" },
} satisfies Record<
  string,
  {
    assetType: MarketAssetType;
    currency: string;
    name: string;
    price: number;
    region: MarketRegion;
  }
>;
const MOCK_MARKET_SYMBOLS = Object.keys(mockQuoteData).sort((a, b) =>
  a.localeCompare(b),
);

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase();
}

function deterministicChangePercent(symbol: string) {
  const normalized = normalizeSymbol(symbol);
  const codePointTotal = Array.from(normalized).reduce(
    (total, char) => total + char.charCodeAt(0),
    0,
  );

  return Number((((codePointTotal % 41) - 20) / 10).toFixed(2));
}

function buildMockQuote(symbol: string): MarketQuote | null {
  const normalized = normalizeSymbol(symbol);
  const quote = mockQuoteData[normalized as keyof typeof mockQuoteData];

  if (!quote) {
    return null;
  }

  return {
    assetType: quote.assetType,
    currency: quote.currency,
    dailyChangePercent: deterministicChangePercent(normalized),
    marketStatus: "mock",
    name: quote.name,
    price: quote.price,
    providerId: MOCK_PROVIDER_ID,
    region: quote.region,
    symbol: normalized,
    updatedAt: new Date().toISOString(),
  };
}

function buildMockNews(symbol: string): MarketNews | null {
  const normalized = normalizeSymbol(symbol);

  if (!mockQuoteData[normalized as keyof typeof mockQuoteData]) {
    return null;
  }

  return {
    category:
      mockQuoteData[normalized as keyof typeof mockQuoteData].assetType === "crypto"
        ? "crypto"
        : "stock",
    id: `mock-news-${normalized.toLowerCase()}`,
    providerId: MOCK_PROVIDER_ID,
    publishedAt: new Date().toISOString(),
    source: "IXAI Mock Market Provider",
    summary:
      "Mock market news placeholder for provider-contract validation. No external news provider is connected.",
    symbol: normalized,
    title: `${normalized} mock market readiness headline`,
    url: null,
  };
}

export const mockMarketProvider: MarketProvider = {
  id: MOCK_PROVIDER_ID,
  label: "IXAI Mock Market Provider",
  status: "mock",
  description:
    "Deterministic mock provider for Market Abstraction Layer validation. It does not call external APIs.",
  supportsNews: true,
  supportsQuotes: true,
  async getNews(symbols) {
    const requestedSymbols = symbols.map(normalizeSymbol).filter(Boolean);
    const items = requestedSymbols
      .map(buildMockNews)
      .filter((item): item is MarketNews => item !== null);

    return {
      generatedAt: new Date().toISOString(),
      items,
      providerId: MOCK_PROVIDER_ID,
      requestedSymbols,
      status: items.length > 0 ? "mock" : "placeholder",
      warnings:
        items.length === requestedSymbols.length
          ? []
          : ["Some requested symbols are not covered by the mock market news provider."],
    };
  },
  async getQuotes(symbols) {
    const requestedSymbols = symbols.map(normalizeSymbol).filter(Boolean);
    const quotes = requestedSymbols
      .map(buildMockQuote)
      .filter((quote): quote is MarketQuote => quote !== null);

    return toMarketSnapshot({
      providerId: MOCK_PROVIDER_ID,
      quotes,
      requestedSymbols,
      warnings:
        quotes.length === requestedSymbols.length
          ? []
          : ["Some requested symbols are not covered by the mock market quote provider."],
    });
  },
  supportsSymbol(symbol) {
    return normalizeSymbol(symbol) in mockQuoteData;
  },
};

export const MockProvider = mockMarketProvider;

export const marketProviderRegistry = [
  {
    description: mockMarketProvider.description,
    id: mockMarketProvider.id,
    label: mockMarketProvider.label,
    provider: mockMarketProvider,
    status: mockMarketProvider.status,
    supportedSymbols: MOCK_MARKET_SYMBOLS,
    supportsNews: mockMarketProvider.supportsNews,
    supportsQuotes: mockMarketProvider.supportsQuotes,
  },
] satisfies MarketProviderRegistryEntry[];

export function getMarketProvider(providerId: MarketProviderId = MOCK_PROVIDER_ID) {
  return (
    marketProviderRegistry.find((entry) => entry.id === providerId)?.provider ??
    mockMarketProvider
  );
}

export function listMarketProviders() {
  return marketProviderRegistry.map(({
    description,
    id,
    label,
    status,
    supportedSymbols,
    supportsNews,
    supportsQuotes,
  }) => ({
    description,
    id,
    label,
    status,
    supportedSymbols,
    supportsNews,
    supportsQuotes,
  }));
}
