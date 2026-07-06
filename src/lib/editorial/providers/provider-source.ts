import { getDailyBrief2MockSourceItems } from "@/src/lib/editorial/daily-brief/daily-brief-mock-source";
import { adaptProviderStories, readProviderStories } from "@/src/lib/editorial/providers/provider-adapter";
import { buildProviderCacheDiagnostics, getProviderCache, setProviderCache } from "@/src/lib/editorial/providers/provider-cache";
import { buildProviderCoverageScore } from "@/src/lib/editorial/providers/provider-coverage";
import { buildProviderFallbackState } from "@/src/lib/editorial/providers/provider-fallback";
import { buildProviderHealthList } from "@/src/lib/editorial/providers/provider-health";
import { buildProviderQualityScore } from "@/src/lib/editorial/providers/provider-quality";
import { listProviders, registerProvider } from "@/src/lib/editorial/providers/provider-registry";
import type {
  EditorialProviderAdapter,
  EditorialProviderDiagnostics,
  EditorialProviderSourceResult,
  EditorialRawStory,
} from "@/src/lib/editorial/providers/provider-types";

function toEditorialRawStory(item: ReturnType<typeof getDailyBrief2MockSourceItems>[number]): EditorialRawStory {
  return {
    categories: item.categories ?? ["market"],
    confidence: item.confidence ?? 0.5,
    id: item.id ?? "mock-story",
    importance: item.importance ?? 0.5,
    markets: item.markets ?? ["global"],
    providerId: item.providerKey ?? "ixai-foundation-provider",
    providerName: item.sourceLabel ?? "IXAI Foundation Provider",
    providerTimestamp: item.updatedAt ?? item.publishedAt ?? new Date().toISOString(),
    providerUrl: "https://app.ixuan.ai",
    publishedAt: item.publishedAt,
    sourceKind: item.sourceKind ?? "manual",
    summary: item.description ?? item.summary ?? "Limited source detail is available.",
    symbols: item.symbols ?? [],
    title: item.headline ?? item.title ?? "Untitled market story",
    url: item.url,
  };
}

function foundationProvider(): EditorialProviderAdapter {
  return {
    getStories: () => getDailyBrief2MockSourceItems().map(toEditorialRawStory),
    provider: {
      capabilities: [
        "daily_brief",
        "weekly_brief",
        "market_news",
        "macro_events",
        "crypto_news",
        "structured_products",
        "fallback",
      ],
      coverage: ["macro", "us", "taiwan", "crypto", "fcn", "macro_risk", "ai", "technology"],
      id: "ixai-foundation-editorial",
      name: "IXAI Foundation Editorial Provider",
      priority: 1,
      status: "healthy",
      url: "https://app.ixuan.ai",
    },
  };
}

export function ensureFoundationEditorialProvider() {
  const existing = listProviders().some((provider) => provider.provider.id === "ixai-foundation-editorial");

  if (!existing) {
    registerProvider(foundationProvider());
  }
}

export function buildEditorialProviderDiagnostics({
  cachedAvailable,
  rawStories,
}: {
  cachedAvailable: boolean;
  rawStories: EditorialRawStory[];
}): EditorialProviderDiagnostics {
  const providers = listProviders();
  const health = buildProviderHealthList(providers);
  const coverage = buildProviderCoverageScore(rawStories);
  const quality = buildProviderQualityScore({ coverage, health, stories: rawStories });
  const fallback = buildProviderFallbackState({
    cachedAvailable,
    health,
    storyCount: rawStories.length,
  });

  return {
    cache: buildProviderCacheDiagnostics(),
    coverage,
    degradedProviders: health.filter((provider) => provider.status === "degraded").map((provider) => provider.providerId),
    fallback,
    healthyProviders: health.filter((provider) => provider.status === "healthy").map((provider) => provider.providerId),
    offlineProviders: health
      .filter((provider) => provider.status === "offline" || provider.status === "maintenance")
      .map((provider) => provider.providerId),
    publicationReadiness: rawStories.length
      ? quality.overall >= 0.55
        ? "ready"
        : "limited"
      : fallback.fallbackReady
        ? "limited"
        : "unavailable",
    quality,
    registeredProviders: providers.length,
  };
}

export function getEditorialProviderSourceResult(): EditorialProviderSourceResult {
  ensureFoundationEditorialProvider();

  const cacheKey = "editorial-provider-source:v16a-3";
  const cached = getProviderCache<EditorialRawStory[]>(cacheKey);
  const providers = listProviders();
  const rawStories = providers.flatMap(readProviderStories);
  const resolvedStories = rawStories.length ? rawStories : cached?.value ?? [];

  if (rawStories.length) {
    setProviderCache(cacheKey, rawStories, 15 * 60 * 1000);
  }

  const health = buildProviderHealthList(providers);
  const diagnostics = buildEditorialProviderDiagnostics({
    cachedAvailable: Boolean(cached?.value?.length),
    rawStories: resolvedStories,
  });

  return {
    diagnostics,
    health,
    rawStories: resolvedStories,
    stories: adaptProviderStories(resolvedStories),
  };
}
