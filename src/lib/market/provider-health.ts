import { listMarketProviders } from "@/src/lib/market/provider-registry";
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
  const primaryProvider = items.find((item) => item.priority === "primary") ?? null;

  return {
    fallbackPolicy: {
      fallbackProviderId: "mock",
      policy: "fallback_to_mock",
      reason:
        "Until real market providers are explicitly approved, Workspace market surfaces should fall back to deterministic mock metadata.",
    },
    generatedAt,
    healthyProviderCount: items.filter((item) => item.status === "healthy").length,
    items,
    mockProviderCount: items.filter((item) => item.status === "mock").length,
    primaryProviderId: primaryProvider?.id ?? null,
    providerCount: items.length,
    summary:
      "Provider Health Framework is enabled with deterministic mock health data only. No external provider is connected.",
    unavailableProviderCount: items.filter((item) => item.status === "unavailable").length,
  };
}
