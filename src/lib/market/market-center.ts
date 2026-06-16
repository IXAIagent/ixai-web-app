import {
  getMarketProvider,
  listMarketProviders,
} from "@/src/lib/market/provider-registry";
import type { MarketProviderId } from "@/src/lib/market/market-provider";
import type { MarketProviderStatusSnapshot } from "@/src/lib/market/market-types";

export async function buildMarketSnapshot(input: {
  providerId?: MarketProviderId;
  symbols: string[];
}) {
  const provider = getMarketProvider(input.providerId);
  return provider.getQuotes(input.symbols);
}

export async function buildMarketNewsSnapshot(input: {
  providerId?: MarketProviderId;
  symbols: string[];
}) {
  const provider = getMarketProvider(input.providerId);
  return provider.getNews(input.symbols);
}

export function getMarketProviderStatus(): MarketProviderStatusSnapshot {
  const providers = listMarketProviders();
  const supportedSymbols = Array.from(
    new Set(providers.flatMap((provider) => provider.supportedSymbols)),
  ).sort((a, b) => a.localeCompare(b));

  return {
    generatedAt: new Date().toISOString(),
    mockProviderCount: providers.filter((provider) => provider.status === "mock").length,
    newsProviderCount: providers.filter((provider) => provider.supportsNews).length,
    providerCount: providers.length,
    providers,
    quoteProviderCount: providers.filter((provider) => provider.supportsQuotes).length,
    summary:
      "Market abstraction registry is available with mock provider metadata only. No external market provider is connected.",
    supportedSymbols,
  };
}
