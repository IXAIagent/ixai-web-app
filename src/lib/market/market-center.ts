import {
  getMarketProvider,
  listMarketProviders,
} from "@/src/lib/market/provider-registry";
import type { MarketProviderId } from "@/src/lib/market/market-provider";

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

export function getMarketProviderStatus() {
  return {
    generatedAt: new Date().toISOString(),
    providers: listMarketProviders(),
  };
}
