export type MarketDataAssetType = "stock" | "crypto" | "fcn_underlying" | "unknown";

export type MarketDataQuality =
  | "manual"
  | "placeholder"
  | "stale"
  | "unavailable";

export type MarketDataProviderStatus =
  | "ready"
  | "disabled"
  | "placeholder"
  | "unavailable";

export type MarketDataSource = "manual" | "provider_interface" | "placeholder";

export interface MarketDataPoint {
  asOf: string | null;
  assetType: MarketDataAssetType;
  currency: string | null;
  dataQuality: MarketDataQuality;
  price: number | null;
  providerStatus: MarketDataProviderStatus;
  source: MarketDataSource;
  symbol: string;
}

export interface MarketDataProviderDescriptor {
  apiCallsEnabled: boolean;
  externalProvider: boolean;
  id: string;
  label: string;
  providerStatus: MarketDataProviderStatus;
  supportedAssetTypes: MarketDataAssetType[];
}

export interface MarketDataSnapshot {
  dataQuality: MarketDataQuality;
  diagnostics: MarketDataDiagnostics;
  generatedAt: string;
  providerStatus: MarketDataProviderStatus;
  quotes: MarketDataPoint[];
  source: MarketDataSource;
  warnings: string[];
}

export interface MarketDataDiagnostics {
  apiCallsEnabled: false;
  brokerEnabled: false;
  externalFetchEnabled: false;
  externalProvidersEnabled: false;
  generatedAt: string;
  legacyProviderModuleImported: false;
  manualProviderEnabled: true;
  phase: "V17_MARKET_DATA_PROVIDER_FOUNDATION";
  providerInterfaceReady: true;
  readOnly: true;
  binanceEnabled: false;
  yahooEnabled: false;
}
