import {
  normalizeMarketDataSymbol,
  uniqueMarketDataSymbols,
  type MarketDataProvider,
} from "@/src/lib/market-data/market-data-provider-interface";
import type {
  MarketDataAssetType,
  MarketDataPoint,
  MarketDataProviderDescriptor,
} from "@/src/lib/market-data/market-data-types";

export const manualMarketDataProviderDescriptor: MarketDataProviderDescriptor = {
  apiCallsEnabled: false,
  externalProvider: false,
  id: "manual-placeholder",
  label: "Manual Market Data Placeholder",
  providerStatus: "placeholder",
  supportedAssetTypes: ["stock", "crypto", "fcn_underlying", "unknown"],
};

function inferAssetType(symbol: string): MarketDataAssetType {
  if (symbol.endsWith("USDT") || symbol.endsWith("USD")) {
    return "crypto";
  }

  if (symbol.length > 0) {
    return "stock";
  }

  return "unknown";
}

export function buildManualMarketDataPoint(symbol: string): MarketDataPoint {
  const normalized = normalizeMarketDataSymbol(symbol);

  return {
    asOf: null,
    assetType: inferAssetType(normalized),
    currency: normalized.endsWith("USDT") ? "USDT" : "USD",
    dataQuality: "placeholder",
    price: null,
    providerStatus: "placeholder",
    source: "manual",
    symbol: normalized,
  };
}

export const manualMarketDataProvider: MarketDataProvider = {
  descriptor: manualMarketDataProviderDescriptor,
  async getQuote(symbol: string) {
    return buildManualMarketDataPoint(symbol);
  },
  async getQuotes(symbols: string[]) {
    return uniqueMarketDataSymbols(symbols).map(buildManualMarketDataPoint);
  },
};
