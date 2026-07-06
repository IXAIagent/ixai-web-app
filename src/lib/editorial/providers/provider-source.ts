import { getDailyBrief2MockSourceItems } from "@/src/lib/editorial/daily-brief/daily-brief-mock-source";
import { googleNewsRssProvider } from "@/src/lib/editorial/providers/google-news-rss-provider";
import { yahooFinanceMarketProvider } from "@/src/lib/editorial/providers/yahoo-finance-market-provider";
import { yahooFinanceNewsProvider } from "@/src/lib/editorial/providers/yahoo-finance-news-provider";
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
  EditorialProviderHealth,
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
      priority: 100,
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

export function ensureLiveEditorialProviders() {
  ensureFoundationEditorialProvider();

  for (const provider of [
    googleNewsRssProvider,
    yahooFinanceNewsProvider,
    yahooFinanceMarketProvider,
  ]) {
    const existing = listProviders().some((candidate) => candidate.provider.id === provider.provider.id);

    if (!existing) {
      registerProvider(provider);
    }
  }
}

export function buildEditorialProviderDiagnostics({
  cachedAvailable,
  errors = [],
  fetchResult,
  health: providedHealth,
  rawStories,
  sourceStatus,
}: {
  cachedAvailable: boolean;
  errors?: string[];
  fetchResult?: EditorialProviderDiagnostics["fetchResult"];
  health?: EditorialProviderHealth[];
  rawStories: EditorialRawStory[];
  sourceStatus?: EditorialProviderDiagnostics["sourceStatus"];
}): EditorialProviderDiagnostics {
  const providers = listProviders();
  const health = providedHealth ?? buildProviderHealthList(providers);
  const coverage = buildProviderCoverageScore(rawStories);
  const quality = buildProviderQualityScore({ coverage, health, stories: rawStories });
  const fallback = buildProviderFallbackState({
    cachedAvailable,
    health,
    storyCount: rawStories.length,
  });

  return {
    cache: buildProviderCacheDiagnostics(),
    cacheHit: cachedAvailable,
    coverage,
    degradedProviders: health.filter((provider) => provider.status === "degraded").map((provider) => provider.providerId),
    errors,
    fallback,
    fallbackLevel: fallback.activeSource,
    fetchResult:
      fetchResult ??
      (rawStories.length
        ? cachedAvailable
          ? "cached"
          : "fallback"
        : "empty"),
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
    sourceStatus:
      sourceStatus ??
      (rawStories.length
        ? rawStories.some((story) => story.providerId === "ixai-foundation-editorial")
          ? "mock"
          : "real"
        : "empty"),
  };
}

export function getEditorialProviderSourceResult(): EditorialProviderSourceResult {
  ensureLiveEditorialProviders();

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

async function fetchProviderWithFallback(provider: EditorialProviderAdapter) {
  const startedAt = Date.now();
  const cacheKey = `editorial-provider:${provider.provider.id}:stories`;
  const cached = getProviderCache<EditorialRawStory[]>(cacheKey);

  if (!provider.fetchStories) {
    return {
      cached,
      error: undefined,
      health: buildProviderHealthList([provider])[0],
      stories: readProviderStories(provider),
    };
  }

  try {
    const stories = await provider.fetchStories();
    const latencyMs = Date.now() - startedAt;

    if (stories.length > 0) {
      setProviderCache(cacheKey, stories, 15 * 60 * 1000);
    }

    return {
      cached,
      error: undefined,
      health: {
        coverage: Math.min(1, provider.provider.coverage.length / 10),
        lastSuccess: new Date().toISOString(),
        latencyMs,
        providerId: provider.provider.id,
        providerName: provider.provider.name,
        status: stories.length > 0 ? "healthy" : "degraded",
      } satisfies EditorialProviderHealth,
      stories,
    };
  } catch (error) {
    const latencyMs = Date.now() - startedAt;
    const message = error instanceof Error ? error.message : "Provider fetch failed.";

    return {
      cached,
      error: `${provider.provider.name}: ${message}`,
      health: {
        coverage: Math.min(1, provider.provider.coverage.length / 10),
        failureReason: message,
        lastFailure: new Date().toISOString(),
        latencyMs,
        providerId: provider.provider.id,
        providerName: provider.provider.name,
        status: cached?.value?.length ? "degraded" : "offline",
      } satisfies EditorialProviderHealth,
      stories: cached?.value ?? [],
    };
  }
}

export async function getEditorialProviderSourceResultAsync(): Promise<EditorialProviderSourceResult> {
  ensureLiveEditorialProviders();

  const providers = listProviders();
  const liveProviders = providers.filter((provider) => provider.provider.id !== "ixai-foundation-editorial");
  const results = await Promise.all(liveProviders.map(fetchProviderWithFallback));
  const realOrCachedStories = results.flatMap((result) => result.stories);
  const errors = results.flatMap((result) => (result.error ? [result.error] : []));
  const cacheHit = results.some((result) => Boolean(result.cached?.value?.length));
  const foundationStories = getDailyBrief2MockSourceItems().map(toEditorialRawStory);
  const resolvedStories = realOrCachedStories.length ? realOrCachedStories : foundationStories;
  const foundationHealth = realOrCachedStories.length
    ? []
    : buildProviderHealthList(listProviders().filter((provider) => provider.provider.id === "ixai-foundation-editorial"));
  const health = [...results.map((result) => result.health), ...foundationHealth];
  const diagnostics = buildEditorialProviderDiagnostics({
    cachedAvailable: cacheHit,
    errors,
    fetchResult: realOrCachedStories.length ? (cacheHit ? "cached" : "real") : "fallback",
    health,
    rawStories: resolvedStories,
    sourceStatus: realOrCachedStories.length
      ? realOrCachedStories.some((story) => story.providerId === "ixai-foundation-editorial")
        ? "mixed"
        : "real"
      : "mock",
  });

  return {
    diagnostics,
    health,
    rawStories: resolvedStories,
    stories: adaptProviderStories(resolvedStories),
  };
}
