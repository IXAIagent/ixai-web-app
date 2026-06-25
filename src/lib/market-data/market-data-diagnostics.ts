import type { MarketDataDiagnostics } from "@/src/lib/market-data/market-data-types";

export function buildMarketDataDiagnostics(): MarketDataDiagnostics {
  return {
    apiCallsEnabled: false,
    binanceEnabled: false,
    brokerEnabled: false,
    externalFetchEnabled: false,
    externalProvidersEnabled: false,
    generatedAt: new Date().toISOString(),
    legacyProviderModuleImported: false,
    manualProviderEnabled: true,
    phase: "V17_MARKET_DATA_PROVIDER_FOUNDATION",
    providerInterfaceReady: true,
    readOnly: true,
    yahooEnabled: false,
  };
}
