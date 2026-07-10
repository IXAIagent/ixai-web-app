import { buildIntelligenceConfidence } from "@/src/lib/intelligence/platform/platform-confidence";
import {
  createStableItemId,
  normalizeSourceState,
  strongestSourceState,
  uniqueStrings,
} from "@/src/lib/intelligence/platform/platform-normalization";
import { sortIntelligenceItems } from "@/src/lib/intelligence/platform/platform-priority";
import type {
  IntelligenceItem,
  IntelligencePlatformContext,
  MarketIntelligenceSnapshot,
} from "@/src/lib/intelligence/platform/platform-types";

function providerCoverageAreas(context: IntelligencePlatformContext) {
  return context.providerDiagnostics?.coverage.coveredAreas ?? [];
}

function buildMarketItems(context: IntelligencePlatformContext): IntelligenceItem[] {
  const watchlist = context.watchlist;
  const providerDiagnostics = context.providerDiagnostics;
  const sourceState = providerDiagnostics
    ? providerDiagnostics.sourceStatus === "real"
      ? "live"
      : providerDiagnostics.sourceStatus === "mixed"
        ? "limited"
        : providerDiagnostics.sourceStatus === "mock"
          ? "fallback"
          : "unavailable"
    : normalizeSourceState(watchlist?.sourceStatus);

  const marketEvents = context.monitoringEvents.filter((event) =>
    event.eventType === "news-relevance" ||
    event.eventType === "macro-event" ||
    event.eventType === "watchlist-move" ||
    event.eventType === "price-move" ||
    event.eventType === "crypto-volatility",
  );

  const items: IntelligenceItem[] = [];

  if (watchlist) {
    items.push({
      confidence: buildIntelligenceConfidence({
        freshness: "unknown",
        limitations: watchlist.missingQuoteCount ? [`${watchlist.missingQuoteCount} watchlist quotes are unavailable.`] : [],
        reasons: ["Watchlist summary provides market context for tracked symbols."],
        score: watchlist.itemCount ? watchlist.quotedItemCount / Math.max(1, watchlist.itemCount) : 0.35,
        sourceCoverage: [normalizeSourceState(watchlist.sourceStatus)],
      }),
      domain: "market",
      freshness: "unknown",
      generatedAt: context.generatedAt,
      health: watchlist.unquotedItemCount > 0 ? "watch" : "healthy",
      id: "intel:market:watchlist-coverage",
      limitations: watchlist.missingQuoteCount ? [`${watchlist.missingQuoteCount} quotes unavailable.`] : [],
      priority: watchlist.unquotedItemCount > 0 ? "normal" : "low",
      relatedAssetIds: watchlist.items.map((item) => item.id),
      relatedFcnIds: [],
      relatedSymbols: uniqueStrings(watchlist.items.map((item) => item.symbol)),
      sourceState: normalizeSourceState(watchlist.sourceStatus),
      summary: `${watchlist.itemCount} watchlist items are available for market context.`,
      title: "Watchlist market context",
      whatToInspect: "Review watchlist movers and missing quote coverage.",
      whyItMatters: "Watchlist context helps identify external market movement connected to tracked assets.",
    });
  }

  if (marketEvents.length > 0) {
    items.push(...marketEvents.slice(0, 4).map((event): IntelligenceItem => ({
      confidence: buildIntelligenceConfidence({
        freshness: "fresh",
        reasons: ["Market item is derived from Monitoring Engine events."],
        score: event.confidence,
        sourceCoverage: [sourceState],
      }),
      domain: "market",
      freshness: "fresh",
      generatedAt: context.generatedAt,
      health: event.severity === "critical" ? "critical" : event.severity === "warning" ? "watch" : "healthy",
      id: createStableItemId({
        domain: "market",
        relatedFcnIds: event.relatedFcnIds,
        relatedSymbols: event.relatedAssetIds,
        title: event.title,
      }),
      limitations: [],
      priority: event.severity === "critical" ? "urgent" : event.severity === "warning" ? "high" : "normal",
      relatedAssetIds: event.relatedAssetIds,
      relatedFcnIds: event.relatedFcnIds,
      relatedSymbols: event.relatedAssetIds,
      sourceState,
      summary: event.summary,
      title: event.title,
      whatToInspect: event.actionLabel,
      whyItMatters: event.whyItMatters,
    })));
  }

  if (items.length === 0) {
    items.push({
      confidence: buildIntelligenceConfidence({
        freshness: "unknown",
        limitations: ["Market provider diagnostics or watchlist context is unavailable."],
        reasons: ["No market-facing monitoring events were available."],
        score: 0.25,
        sourceCoverage: ["limited"],
      }),
      domain: "market",
      freshness: "unknown",
      generatedAt: context.generatedAt,
      health: "unknown",
      id: "intel:market:limited",
      limitations: ["Market intelligence is limited."],
      priority: "normal",
      relatedAssetIds: [],
      relatedFcnIds: [],
      relatedSymbols: [],
      sourceState: "limited",
      summary: "Market intelligence is waiting for provider, watchlist, or monitoring context.",
      title: "Market context is limited",
      whatToInspect: "Verify editorial provider diagnostics and watchlist availability.",
      whyItMatters: "Market context explains what external events may affect assets.",
    });
  }

  return sortIntelligenceItems(items);
}

export function buildMarketIntelligenceSnapshot(context: IntelligencePlatformContext): MarketIntelligenceSnapshot {
  const items = buildMarketItems(context);
  const states = items.map((item) => item.sourceState);

  return {
    affectedSymbols: uniqueStrings(items.flatMap((item) => item.relatedSymbols)),
    confidence: buildIntelligenceConfidence({
      freshness: "unknown",
      limitations: context.providerDiagnostics?.errors ?? [],
      reasons: ["Market snapshot uses provider diagnostics, watchlist context, and Monitoring Engine events."],
      score: context.providerDiagnostics?.quality.overall ?? (context.watchlist ? 0.45 : 0.25),
      sourceCoverage: states,
    }),
    coverageAreas: providerCoverageAreas(context),
    domain: "market",
    generatedAt: context.generatedAt,
    health: items.some((item) => item.health === "critical")
      ? "critical"
      : items.some((item) => item.health === "watch" || item.health === "elevated")
        ? "watch"
        : "healthy",
    items,
    limitations: context.providerDiagnostics?.errors ?? [],
    sourceState: strongestSourceState(states),
    watchlistCount: context.watchlist?.itemCount ?? 0,
  };
}
