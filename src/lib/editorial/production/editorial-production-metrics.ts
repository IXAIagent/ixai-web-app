import type {
  EditorialProductionInput,
  EditorialProductionMetrics,
} from "@/src/lib/editorial/production/editorial-production-types";

export function buildEditorialProductionMetrics({
  providerDiagnostics,
}: EditorialProductionInput): EditorialProductionMetrics {
  const providerCount = Math.max(1, providerDiagnostics.registeredProviders);
  const failedProviders = providerDiagnostics.offlineProviders.length + providerDiagnostics.degradedProviders.length;

  return {
    cacheHitRate: providerDiagnostics.cacheHit ? 1 : 0,
    fallbackCount: providerDiagnostics.fetchResult === "real" ? 0 : 1,
    generationLatencyMs: 0,
    providerFailureCount: failedProviders,
    providerSuccessRate: Math.max(0, (providerCount - failedProviders) / providerCount),
    publicationReadiness:
      providerDiagnostics.publicationReadiness === "ready"
        ? 1
        : providerDiagnostics.publicationReadiness === "limited"
          ? 0.5
          : 0,
    qualityScore: providerDiagnostics.quality.overall,
    sourceCoverage: providerDiagnostics.coverage.overall,
  };
}
