import { buildIntelligenceConfidence } from "@/src/lib/intelligence/platform/platform-confidence";
import {
  createStableItemId,
  freshnessFromIso,
  normalizeSourceState,
  strongestSourceState,
  uniqueStrings,
} from "@/src/lib/intelligence/platform/platform-normalization";
import { sortIntelligenceItems } from "@/src/lib/intelligence/platform/platform-priority";
import type {
  IntelligenceItem,
  IntelligencePlatformContext,
  PortfolioIntelligenceSnapshot,
} from "@/src/lib/intelligence/platform/platform-types";

function topPortfolioSymbols(context: IntelligencePlatformContext) {
  return uniqueStrings(
    (context.portfolioValuation?.positions ?? [])
      .toSorted((left, right) => (right.marketValue ?? 0) - (left.marketValue ?? 0))
      .slice(0, 5)
      .map((position) => position.symbol),
  );
}

function buildPortfolioItems(context: IntelligencePlatformContext): IntelligenceItem[] {
  const generatedAt = context.generatedAt;
  const valuation = context.portfolioValuation;

  if (!valuation || valuation.summary.positionCount === 0) {
    const sourceState = "limited" as const;
    const item: IntelligenceItem = {
      confidence: buildIntelligenceConfidence({
        freshness: "unknown",
        limitations: ["Portfolio data is not available yet."],
        reasons: ["No position read model was available to the platform context."],
        score: 0.2,
        sourceCoverage: [sourceState],
      }),
      domain: "portfolio",
      freshness: "unknown",
      generatedAt,
      health: "unknown",
      id: "intel:portfolio:no-assets",
      limitations: ["Add or sync assets to improve portfolio intelligence."],
      priority: "normal",
      relatedAssetIds: [],
      relatedFcnIds: [],
      relatedSymbols: [],
      sourceState,
      summary: "Portfolio intelligence is waiting for holdings data.",
      title: "Portfolio coverage is limited",
      whatToInspect: "Add assets or verify portfolio sync.",
      whyItMatters: "IXAI needs holdings to connect market movement, risk, and news to your investments.",
    };
    return [item];
  }

  const sourceState = normalizeSourceState(valuation.summary.sourceStatus);
  const freshness = freshnessFromIso(valuation.summary.updatedAt, generatedAt);
  const topPosition = valuation.positions
    .filter((position) => position.allocationPercent > 0)
    .toSorted((left, right) => right.allocationPercent - left.allocationPercent)[0];
  const warnings = valuation.summary.warnings.map((warning) => warning.message);
  const items: IntelligenceItem[] = [];

  items.push({
    confidence: buildIntelligenceConfidence({
      freshness,
      limitations: warnings.slice(0, 3),
      reasons: ["Portfolio valuation read model is available."],
      score: valuation.summary.pricedPositionCount / Math.max(1, valuation.summary.positionCount),
      sourceCoverage: [sourceState],
    }),
    domain: "portfolio",
    freshness,
    generatedAt,
    health: warnings.length > 0 ? "watch" : "healthy",
    id: "intel:portfolio:value",
    limitations: warnings.slice(0, 3),
    priority: warnings.length > 0 ? "high" : "normal",
    relatedAssetIds: valuation.positions.map((position) => position.id),
    relatedFcnIds: valuation.positions.filter((position) => position.assetClass === "fcn").map((position) => position.id),
    relatedSymbols: topPortfolioSymbols(context),
    sourceState,
    summary: `Estimated portfolio value is ${valuation.currency} ${valuation.summary.totalMarketValue.toLocaleString()}.`,
    title: "Portfolio value is available",
    whatToInspect: "Review portfolio value, allocation, and unpriced holdings.",
    whyItMatters: "Portfolio value is the baseline for understanding impact, concentration, and monitoring priority.",
  });

  if (topPosition) {
    const allocationItem: IntelligenceItem = {
      confidence: buildIntelligenceConfidence({
        freshness,
        reasons: ["Allocation is derived from the portfolio valuation read model."],
        score: topPosition.marketValue === null ? 0.45 : 0.75,
        sourceCoverage: [normalizeSourceState(topPosition.sourceStatus)],
      }),
      domain: "portfolio",
      freshness,
      generatedAt,
      health: topPosition.allocationPercent >= 50 ? "elevated" : "healthy",
      id: createStableItemId({
        domain: "portfolio",
        relatedFcnIds: topPosition.assetClass === "fcn" ? [topPosition.id] : [],
        relatedSymbols: [topPosition.symbol],
        title: "Largest portfolio exposure",
      }),
      limitations: topPosition.marketValue === null ? ["Largest exposure has limited price coverage."] : [],
      priority: topPosition.allocationPercent >= 50 ? "high" : "normal",
      relatedAssetIds: [topPosition.id],
      relatedFcnIds: topPosition.assetClass === "fcn" ? [topPosition.id] : [],
      relatedSymbols: [topPosition.symbol],
      sourceState: normalizeSourceState(topPosition.sourceStatus),
      summary: `${topPosition.symbol} is the largest position at ${topPosition.allocationPercent.toFixed(1)}% allocation.`,
      title: "Largest position identified",
      whatToInspect: "Check whether this position should remain the main portfolio driver.",
      whyItMatters: "Large positions can dominate portfolio movement and risk attention.",
    };
    items.push(allocationItem);
  }

  return sortIntelligenceItems(items);
}

export function buildPortfolioIntelligenceSnapshot(context: IntelligencePlatformContext): PortfolioIntelligenceSnapshot {
  const valuation = context.portfolioValuation;
  const items = buildPortfolioItems(context);
  const states = items.map((item) => item.sourceState);
  const sourceState = strongestSourceState(states);
  const health = items.some((item) => item.health === "critical")
    ? "critical"
    : items.some((item) => item.health === "elevated" || item.health === "watch")
      ? "watch"
      : valuation
        ? "healthy"
        : "unknown";

  return {
    confidence: buildIntelligenceConfidence({
      freshness: valuation ? freshnessFromIso(valuation.summary.updatedAt, context.generatedAt) : "unknown",
      limitations: valuation?.summary.warnings.map((warning) => warning.message) ?? ["Portfolio read model is unavailable."],
      reasons: valuation ? ["Portfolio snapshot uses the existing valuation read model."] : ["No portfolio valuation was available."],
      score: valuation ? valuation.summary.pricedPositionCount / Math.max(1, valuation.summary.positionCount) : 0.2,
      sourceCoverage: states,
    }),
    domain: "portfolio",
    estimatedValue: valuation?.summary.totalMarketValue ?? null,
    generatedAt: context.generatedAt,
    health,
    items,
    limitations: valuation?.summary.warnings.map((warning) => warning.message) ?? ["Portfolio data is limited."],
    positionCount: valuation?.summary.positionCount ?? 0,
    pricedPositionCount: valuation?.summary.pricedPositionCount ?? 0,
    sourceState,
    topSymbols: topPortfolioSymbols(context),
  };
}
