import type { EditorialThemeId } from "@/src/lib/editorial/intelligence";
import type { AssetIntelligence } from "@/src/lib/intelligence/assets";
import { scoreMonitoringEventPriority } from "@/src/lib/intelligence/monitoring/monitoring-priority";
import type {
  MonitoringEvent,
  MonitoringEventType,
  MonitoringRuleContext,
  MonitoringSeverity,
  MonitoringSource,
} from "@/src/lib/intelligence/monitoring/monitoring-types";

function hoursFrom(date: string, hours: number) {
  return new Date(new Date(date).getTime() + hours * 60 * 60 * 1000).toISOString();
}

function isStale(asset: AssetIntelligence, generatedAt: string) {
  const updatedAt = new Date(asset.lastUpdated).getTime();
  const generated = new Date(generatedAt).getTime();

  if (!Number.isFinite(updatedAt) || !Number.isFinite(generated)) {
    return false;
  }

  return generated - updatedAt > 24 * 60 * 60 * 1000;
}

function themeForAsset(asset: AssetIntelligence): EditorialThemeId[] {
  if (asset.themes.length > 0) return asset.themes;
  if (asset.assetType === "crypto") return ["crypto"];
  if (asset.assetType === "fcn") return ["fcn_structured_products"];
  if (asset.market === "tw") return ["taiwan_market"];
  if (asset.market === "us" && asset.assetType === "stock") return ["us_tech"];
  return ["macro_risk"];
}

function relatedAssetIds(asset: AssetIntelligence) {
  return Array.from(
    new Set([
      ...asset.relatedAssets.map((item) => item.id),
      ...asset.relatedWatchlist.map((item) => item.id),
    ]),
  );
}

function relatedFcnIds(asset: AssetIntelligence) {
  return Array.from(new Set(asset.relatedFcn.map((item) => item.id)));
}

function makeEvent(input: {
  actionLabel: string;
  asset: AssetIntelligence;
  confidence: number;
  eventType: MonitoringEventType;
  expiresInHours?: number;
  generatedAt: string;
  severity: MonitoringSeverity;
  source: MonitoringSource;
  summary: string;
  title: string;
  whyItMatters: string;
  providerDiagnostics?: MonitoringRuleContext["providerDiagnostics"];
}): MonitoringEvent {
  const eventWithoutPriority = {
    actionLabel: input.actionLabel,
    assetId: input.asset.id,
    assetType: input.asset.assetType,
    confidence: input.confidence,
    eventType: input.eventType,
    expiresAt: hoursFrom(input.generatedAt, input.expiresInHours ?? 24),
    generatedAt: input.generatedAt,
    id: `monitor:${input.eventType}:${input.asset.id}`,
    relatedAssetIds: relatedAssetIds(input.asset),
    relatedFcnIds: relatedFcnIds(input.asset),
    relatedThemes: themeForAsset(input.asset),
    severity: input.severity,
    source: input.source,
    summary: input.summary,
    title: input.title,
    whyItMatters: input.whyItMatters,
  };

  return {
    ...eventWithoutPriority,
    priorityScore: scoreMonitoringEventPriority({
      asset: input.asset,
      event: eventWithoutPriority,
      generatedAt: input.generatedAt,
      providerDiagnostics: input.providerDiagnostics,
    }),
  };
}

function assetHealthEvents(context: MonitoringRuleContext) {
  return context.assets
    .filter((asset) => asset.health.status === "degraded" || asset.health.status === "offline")
    .map((asset) =>
      makeEvent({
        actionLabel: "Review asset data quality",
        asset,
        confidence: asset.quality.confidence,
        eventType: "data-quality",
        generatedAt: context.generatedAt,
        providerDiagnostics: context.providerDiagnostics,
        severity: asset.health.status === "offline" ? "critical" : "warning",
        source: "asset-intelligence",
        summary: `${asset.displayName} has ${asset.health.status} intelligence coverage.`,
        title: `${asset.displayName} needs data review`,
        whyItMatters: "Monitoring quality depends on price, news, event, coverage, and quality states being available.",
      }),
    );
}

function missingPriceEvents(context: MonitoringRuleContext) {
  return context.assets
    .filter((asset) => asset.priceState.status === "missing")
    .map((asset) =>
      makeEvent({
        actionLabel: "Check price source",
        asset,
        confidence: 0.72,
        eventType: "price-move",
        generatedAt: context.generatedAt,
        providerDiagnostics: context.providerDiagnostics,
        severity: asset.assetType === "cash" || asset.status === "placeholder" ? "info" : "warning",
        source: "deterministic-rule",
        summary: `${asset.displayName} is missing a current price state.`,
        title: `${asset.displayName} price is unavailable`,
        whyItMatters: "Without a price state, IXAI cannot compare movement, exposure, or risk freshness for this asset.",
      }),
    );
}

function missingNewsEvents(context: MonitoringRuleContext) {
  return context.assets
    .filter((asset) => asset.newsState.status === "missing" && asset.status !== "placeholder")
    .map((asset) =>
      makeEvent({
        actionLabel: "Review news coverage",
        asset,
        confidence: 0.58,
        eventType: "news-relevance",
        expiresInHours: 48,
        generatedAt: context.generatedAt,
        providerDiagnostics: context.providerDiagnostics,
        severity: "info",
        source: "editorial-intelligence",
        summary: `${asset.displayName} has no linked news coverage yet.`,
        title: `${asset.displayName} news coverage is limited`,
        whyItMatters: "Future monitoring needs relevant news context before IXAI can explain what matters to this asset.",
      }),
    );
}

function lowCoverageEvents(context: MonitoringRuleContext) {
  return context.assets
    .filter((asset) => asset.coverage.score < 0.35 && asset.status !== "placeholder")
    .map((asset) =>
      makeEvent({
        actionLabel: "Review coverage readiness",
        asset,
        confidence: asset.quality.confidence,
        eventType: "data-quality",
        expiresInHours: 72,
        generatedAt: context.generatedAt,
        providerDiagnostics: context.providerDiagnostics,
        severity: "warning",
        source: "deterministic-rule",
        summary: `${asset.displayName} has limited provider coverage mapping.`,
        title: `${asset.displayName} coverage needs review`,
        whyItMatters: "Coverage quality determines whether future monitoring can explain asset-specific events reliably.",
      }),
    );
}

function fcnRiskEvents(context: MonitoringRuleContext) {
  return context.assets
    .filter((asset) => asset.assetType === "fcn" && (asset.riskState.level === "attention" || asset.riskState.level === "critical"))
    .map((asset) =>
      makeEvent({
        actionLabel: "Review FCN risk context",
        asset,
        confidence: asset.quality.confidence,
        eventType: "fcn-ki-risk",
        generatedAt: context.generatedAt,
        providerDiagnostics: context.providerDiagnostics,
        severity: asset.riskState.level === "critical" ? "critical" : "warning",
        source: "asset-intelligence",
        summary: asset.riskState.detail ?? `${asset.displayName} has FCN risk context that needs review.`,
        title: `${asset.displayName} FCN risk needs attention`,
        whyItMatters: "FCN monitoring depends on worst-of, KI distance, observation, coupon, and maturity context.",
      }),
    );
}

function cryptoVolatilityEvents(context: MonitoringRuleContext) {
  return context.assets
    .filter((asset) => asset.assetType === "crypto" && asset.monitoringState.enabled)
    .map((asset) =>
      makeEvent({
        actionLabel: "Monitor crypto volatility",
        asset,
        confidence: 0.5,
        eventType: "crypto-volatility",
        expiresInHours: 24,
        generatedAt: context.generatedAt,
        providerDiagnostics: context.providerDiagnostics,
        severity: "info",
        source: "deterministic-rule",
        summary: `${asset.displayName} is crypto-linked and should keep a volatility placeholder in the monitoring queue.`,
        title: `${asset.displayName} volatility monitor placeholder`,
        whyItMatters: "Crypto assets can change regime quickly; this placeholder reserves a future volatility rule without sending advice.",
      }),
    );
}

function staleDataEvents(context: MonitoringRuleContext) {
  return context.assets
    .filter((asset) => isStale(asset, context.generatedAt))
    .map((asset) =>
      makeEvent({
        actionLabel: "Refresh asset context",
        asset,
        confidence: 0.62,
        eventType: "data-quality",
        expiresInHours: 24,
        generatedAt: context.generatedAt,
        providerDiagnostics: context.providerDiagnostics,
        severity: "warning",
        source: "deterministic-rule",
        summary: `${asset.displayName} has not been refreshed in more than 24 hours.`,
        title: `${asset.displayName} data may be stale`,
        whyItMatters: "Stale asset context can make future Today Focus and notification logic less reliable.",
      }),
    );
}

function highRelevanceNewsPlaceholders(context: MonitoringRuleContext) {
  return context.assets
    .filter((asset) => asset.newsState.status === "limited" && asset.coverage.score >= 0.5 && asset.status !== "placeholder")
    .map((asset) =>
      makeEvent({
        actionLabel: "Watch relevant news",
        asset,
        confidence: 0.48,
        eventType: "news-relevance",
        expiresInHours: 48,
        generatedAt: context.generatedAt,
        providerDiagnostics: context.providerDiagnostics,
        severity: "info",
        source: "editorial-intelligence",
        summary: `${asset.displayName} has enough coverage to support future news relevance matching.`,
        title: `${asset.displayName} news relevance placeholder`,
        whyItMatters: "V17 monitoring will later connect market stories to assets the user owns or watches.",
      }),
    );
}

function providerFallbackEvents(context: MonitoringRuleContext) {
  const diagnostics = context.providerDiagnostics;
  if (!diagnostics || diagnostics.fetchResult === "real") {
    return [];
  }

  const asset = context.assets[0];
  if (!asset) return [];

  return [
    makeEvent({
      actionLabel: "Review data source status",
      asset,
      confidence: diagnostics.quality.overall,
      eventType: "provider-fallback",
      generatedAt: context.generatedAt,
      providerDiagnostics: diagnostics,
      severity: diagnostics.publicationReadiness === "unavailable" ? "critical" : "warning",
      source: "provider-diagnostics",
      summary: `Provider source is using ${diagnostics.fetchResult} mode with fallback level ${diagnostics.fallbackLevel}.`,
      title: "Provider fallback is active",
      whyItMatters: "External source degradation should reduce confidence, not crash the monitoring experience.",
    }),
  ];
}

export function runMonitoringRuleEngine(context: MonitoringRuleContext): MonitoringEvent[] {
  const events = [
    ...assetHealthEvents(context),
    ...missingPriceEvents(context),
    ...missingNewsEvents(context),
    ...lowCoverageEvents(context),
    ...fcnRiskEvents(context),
    ...cryptoVolatilityEvents(context),
    ...staleDataEvents(context),
    ...highRelevanceNewsPlaceholders(context),
    ...providerFallbackEvents(context),
  ];
  const seen = new Map<string, MonitoringEvent>();

  for (const event of events) {
    const existing = seen.get(event.id);
    if (!existing || event.priorityScore > existing.priorityScore) {
      seen.set(event.id, event);
    }
  }

  return Array.from(seen.values()).sort((a, b) => b.priorityScore - a.priorityScore);
}
