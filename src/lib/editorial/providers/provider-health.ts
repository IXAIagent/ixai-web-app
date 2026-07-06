import type {
  EditorialProviderAdapter,
  EditorialProviderHealth,
} from "@/src/lib/editorial/providers/provider-types";

export function buildProviderHealth(provider: EditorialProviderAdapter): EditorialProviderHealth {
  const storyCount = provider.getStories?.().length ?? 0;
  const status = provider.provider.status;

  return {
    coverage: Math.min(1, provider.provider.coverage.length / 10),
    failureReason:
      status === "offline"
        ? "Provider is offline."
        : status === "maintenance"
          ? "Provider is in maintenance mode."
          : status === "degraded"
            ? "Provider is available with limited coverage."
            : undefined,
    lastFailure: status === "healthy" ? undefined : new Date(0).toISOString(),
    lastSuccess: storyCount > 0 ? new Date().toISOString() : undefined,
    latencyMs: status === "offline" ? null : 0,
    providerId: provider.provider.id,
    providerName: provider.provider.name,
    status,
  };
}

export function buildProviderHealthList(providers: EditorialProviderAdapter[]) {
  return providers.map(buildProviderHealth);
}
