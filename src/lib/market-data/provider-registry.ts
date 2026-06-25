import { manualMarketDataProvider } from "@/src/lib/market-data/manual-market-data-provider";
import type {
  MarketDataProvider,
} from "@/src/lib/market-data/market-data-provider-interface";
import type { MarketDataProviderDescriptor } from "@/src/lib/market-data/market-data-types";

const providers: MarketDataProvider[] = [manualMarketDataProvider];

export function getMarketDataProviders(): MarketDataProvider[] {
  return providers;
}

export function getMarketDataProviderDescriptors(): MarketDataProviderDescriptor[] {
  return providers.map((provider) => provider.descriptor);
}

export function getDefaultMarketDataProvider(): MarketDataProvider {
  return manualMarketDataProvider;
}
