import { listMarketProviders } from "@/src/lib/market/provider-registry";
import type { MarketProviderName } from "@/src/lib/market/types";
import type { MarketProviderStatus } from "@/src/lib/market/market-types";

export type ProviderStatus =
  | "disabled"
  | "healthy"
  | "mock"
  | "placeholder"
  | "unavailable";

export type DataFreshness =
  | "fresh"
  | "mock"
  | "not_connected"
  | "stale"
  | "unknown";

export type ProviderPriority = "fallback" | "primary" | "secondary";

export interface ProviderFallbackPolicy {
  fallbackProviderId: string;
  policy: "fallback_to_mock" | "none";
  reason: string;
}

export interface ProviderHealthItem {
  dataFreshness: DataFreshness;
  fallbackPolicy: ProviderFallbackPolicy;
  id: string;
  label: string;
  lastCheckedAt: string;
  priority: ProviderPriority;
  status: ProviderStatus;
  summary: string;
  supportsNews: boolean;
  supportsQuotes: boolean;
}

export interface ProviderHealthSummary {
  fallbackPolicy: ProviderFallbackPolicy;
  generatedAt: string;
  healthyProviderCount: number;
  items: ProviderHealthItem[];
  mockProviderCount: number;
  primaryProviderId: string | null;
  providerCount: number;
  summary: string;
  unavailableProviderCount: number;
}

type LiveProviderHealthState = {
  lastFailureAt: string | null;
  lastFailureReason: string | null;
  lastSuccessAt: string | null;
};

const liveProviderHealth = new Map<MarketProviderName, LiveProviderHealthState>();

function mapProviderStatus(status: MarketProviderStatus): ProviderStatus {
  if (status === "ready") return "healthy";
  if (status === "mock") return "mock";
  if (status === "disabled") return "disabled";
  if (status === "unavailable") return "unavailable";
  return "placeholder";
}

function getDataFreshness(status: ProviderStatus): DataFreshness {
  if (status === "healthy") return "fresh";
  if (status === "mock") return "mock";
  if (status === "unavailable") return "stale";
  if (status === "disabled") return "not_connected";
  return "unknown";
}

function buildFallbackPolicy(providerId: string): ProviderFallbackPolicy {
  return {
    fallbackProviderId: "mock",
    policy: providerId === "mock" ? "none" : "fallback_to_mock",
    reason:
      providerId === "mock"
        ? "Mock provider is the deterministic foundation provider."
        : "Fallback to mock provider until a real provider health policy is approved.",
  };
}

function getLiveProviderHealth(provider: MarketProviderName): LiveProviderHealthState {
  return (
    liveProviderHealth.get(provider) ?? {
      lastFailureAt: null,
      lastFailureReason: null,
      lastSuccessAt: null,
    }
  );
}

function setLiveProviderHealth(
  provider: MarketProviderName,
  patch: Partial<LiveProviderHealthState>,
) {
  liveProviderHealth.set(provider, {
    ...getLiveProviderHealth(provider),
    ...patch,
  });
}

export function recordMarketProviderSuccess(provider: MarketProviderName) {
  if (provider === "unknown" || provider === "mock") {
    return;
  }

  setLiveProviderHealth(provider, {
    lastFailureReason: null,
    lastSuccessAt: new Date().toISOString(),
  });
}

export function recordMarketProviderFailure(provider: MarketProviderName, reason: string) {
  if (provider === "unknown" || provider === "mock") {
    return;
  }

  setLiveProviderHealth(provider, {
    lastFailureAt: new Date().toISOString(),
    lastFailureReason: reason,
  });
}

function buildLiveProviderHealthItems(generatedAt: string): ProviderHealthItem[] {
  const providers: Array<{
    id: MarketProviderName;
    label: string;
    priority: ProviderPriority;
    supportsQuotes: boolean;
  }> = [
    {
      id: "yahoo_finance",
      label: "Yahoo Finance equity quotes",
      priority: "primary",
      supportsQuotes: true,
    },
    {
      id: "binance",
      label: "Binance crypto quotes",
      priority: "primary",
      supportsQuotes: true,
    },
  ];

  return providers.map((provider) => {
    const state = getLiveProviderHealth(provider.id);
    const hasSuccess = Boolean(state.lastSuccessAt);
    const hasFailure = Boolean(state.lastFailureAt);
    const status: ProviderStatus = hasSuccess
      ? "healthy"
      : hasFailure
        ? "unavailable"
        : "placeholder";

    return {
      dataFreshness: hasSuccess ? "fresh" : hasFailure ? "stale" : "unknown",
      fallbackPolicy: {
        fallbackProviderId: "stale_cache_or_unavailable",
        policy: "none",
        reason:
          "Live providers fall back to fresh cache, stale cache, or unavailable quote results. They do not call browser providers directly.",
      },
      id: provider.id,
      label: provider.label,
      lastCheckedAt: state.lastSuccessAt ?? state.lastFailureAt ?? generatedAt,
      priority: provider.priority,
      status,
      summary: state.lastFailureReason
        ? `Last failure: ${state.lastFailureReason}`
        : hasSuccess
          ? "Latest quote refresh succeeded through the server-side provider route."
          : "Provider is registered; health becomes active after the first quote refresh.",
      supportsNews: false,
      supportsQuotes: provider.supportsQuotes,
    };
  });
}

export function buildProviderHealthSummary(): ProviderHealthSummary {
  const generatedAt = new Date().toISOString();
  const providers = listMarketProviders();
  const items = providers.map((provider, index): ProviderHealthItem => {
    const status = mapProviderStatus(provider.status);

    return {
      dataFreshness: getDataFreshness(status),
      fallbackPolicy: buildFallbackPolicy(provider.id),
      id: provider.id,
      label: provider.label,
      lastCheckedAt: generatedAt,
      priority: index === 0 ? "primary" : "fallback",
      status,
      summary:
        status === "mock"
          ? "Deterministic mock provider is available for contract and UI validation only."
          : "Provider health is registered, but no external connectivity is enabled in v4.07.",
      supportsNews: provider.supportsNews,
      supportsQuotes: provider.supportsQuotes,
    };
  });
  const liveItems = buildLiveProviderHealthItems(generatedAt);
  const allItems = [...liveItems, ...items];
  const primaryProvider = allItems.find((item) => item.priority === "primary") ?? null;

  return {
    fallbackPolicy: {
      fallbackProviderId: "mock",
      policy: "fallback_to_mock",
      reason:
        "Until real market providers are explicitly approved, Workspace market surfaces should fall back to deterministic mock metadata.",
    },
    generatedAt,
    healthyProviderCount: allItems.filter((item) => item.status === "healthy").length,
    items: allItems,
    mockProviderCount: allItems.filter((item) => item.status === "mock").length,
    primaryProviderId: primaryProvider?.id ?? null,
    providerCount: allItems.length,
    summary:
      "Provider Health Framework is enabled for server-side Yahoo equity quotes, Binance crypto quotes, and deterministic mock metadata. Failures return stale cache or unavailable quote results instead of throwing.",
    unavailableProviderCount: allItems.filter((item) => item.status === "unavailable").length,
  };
}
