export type LiveMarketProviderId = "yahoo" | "binance" | "futu" | "ibkr";

export type LiveProviderStatus = "disabled" | "planned" | "unavailable";

export type LiveProviderAssetType = "stock" | "crypto" | "fcn_underlying" | "fx" | "unknown";

export interface ProgramBSafetyFlags {
  aiProviderEnabled: false;
  brokerLiveApiEnabled: false;
  externalFetchEnabled: false;
  marketDataLiveApiEnabled: false;
  notificationSenderEnabled: false;
  orderExecutionEnabled: false;
  readOnly: true;
  recommendationLogicEnabled: false;
  schedulerEnabled: false;
  tradingEnabled: false;
}

export interface LiveProviderConfig {
  assetTypes: LiveProviderAssetType[];
  id: LiveMarketProviderId;
  label: string;
  liveApiEnabled: false;
  requiresCredentials: boolean;
  status: LiveProviderStatus;
}

export interface LiveProviderHealth {
  checkedAt: string;
  id: LiveMarketProviderId;
  reason: string;
  status: LiveProviderStatus;
}

export interface QuoteRequestModel {
  assetType: LiveProviderAssetType;
  providerId?: LiveMarketProviderId;
  symbol: string;
}

export interface QuoteResponseModel {
  asOf: string | null;
  currency: string | null;
  price: number | null;
  providerId: LiveMarketProviderId | "manual_placeholder";
  sourceStatus: "disabled" | "placeholder" | "unavailable";
  symbol: string;
  warningMessage: string;
}

export interface CachePolicyModel {
  maxAgeSeconds: number;
  mode: "disabled_placeholder" | "future_live_cache";
  staleWhileRevalidateSeconds: number;
}

export interface LiveProviderReadinessReport {
  cachePolicy: CachePolicyModel;
  configs: LiveProviderConfig[];
  generatedAt: string;
  health: LiveProviderHealth[];
  phase: "V21_MARKET_DATA_LIVE_PROVIDER_READINESS";
  sampleQuoteResponse: QuoteResponseModel;
  safetyFlags: ProgramBSafetyFlags;
}
