import type {
  LiveProviderConfig,
  LiveProviderReadinessReport,
  ProgramBSafetyFlags,
} from "@/src/lib/market-data/live-provider-readiness/live-provider-types";

export const programBSafetyFlags: ProgramBSafetyFlags = {
  aiProviderEnabled: false,
  brokerLiveApiEnabled: false,
  externalFetchEnabled: false,
  marketDataLiveApiEnabled: false,
  notificationSenderEnabled: false,
  orderExecutionEnabled: false,
  readOnly: true,
  recommendationLogicEnabled: false,
  schedulerEnabled: false,
  tradingEnabled: false,
};

export function buildLiveProviderReadinessReport(): LiveProviderReadinessReport {
  const generatedAt = new Date().toISOString();
  const configs: LiveProviderConfig[] = [
    {
      assetTypes: ["stock", "fcn_underlying"],
      id: "yahoo",
      label: "Yahoo Finance",
      liveApiEnabled: false,
      requiresCredentials: false,
      status: "disabled",
    },
    {
      assetTypes: ["crypto"],
      id: "binance",
      label: "Binance Public Market Data",
      liveApiEnabled: false,
      requiresCredentials: false,
      status: "disabled",
    },
    {
      assetTypes: ["stock"],
      id: "futu",
      label: "Futu",
      liveApiEnabled: false,
      requiresCredentials: true,
      status: "disabled",
    },
    {
      assetTypes: ["stock"],
      id: "ibkr",
      label: "Interactive Brokers",
      liveApiEnabled: false,
      requiresCredentials: true,
      status: "disabled",
    },
  ];

  return {
    cachePolicy: {
      maxAgeSeconds: 0,
      mode: "disabled_placeholder",
      staleWhileRevalidateSeconds: 0,
    },
    configs,
    generatedAt,
    health: configs.map((config) => ({
      checkedAt: generatedAt,
      id: config.id,
      reason: `${config.label} remains disabled in Program B; no external fetch is allowed.`,
      status: config.status,
    })),
    phase: "V21_MARKET_DATA_LIVE_PROVIDER_READINESS",
    sampleQuoteResponse: {
      asOf: null,
      currency: null,
      price: null,
      providerId: "manual_placeholder",
      sourceStatus: "disabled",
      symbol: "AAPL",
      warningMessage: "Live provider quote requests are modeled only; no external request is made.",
    },
    safetyFlags: programBSafetyFlags,
  };
}
