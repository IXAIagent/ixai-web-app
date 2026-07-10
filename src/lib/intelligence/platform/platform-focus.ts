import {
  createStableItemId,
} from "@/src/lib/intelligence/platform/platform-normalization";
import { sortIntelligenceItems } from "@/src/lib/intelligence/platform/platform-priority";
import type {
  IntelligenceItem,
  IntelligencePlatformContext,
  IntelligencePlatformSnapshot,
  TodayFocusV2Item,
  TodayFocusV2Snapshot,
} from "@/src/lib/intelligence/platform/platform-types";

function focusKey(item: IntelligenceItem) {
  const related = [
    ...item.relatedSymbols,
    ...item.relatedFcnIds,
    ...item.relatedAssetIds,
  ]
    .toSorted()
    .join(":");
  return `${item.domain}:${related || item.title.toLowerCase()}`;
}

function monitoringFocusItems(context: IntelligencePlatformContext): IntelligenceItem[] {
  return context.todayFocus.map((focus): IntelligenceItem => ({
    confidence: {
      fallbackActive: false,
      freshness: "fresh",
      level: focus.confidence >= 0.75 ? "high" : focus.confidence >= 0.5 ? "medium" : "low",
      limitations: [],
      reasons: ["Today Focus item comes from the existing Monitoring Engine."],
      score: focus.confidence,
      sourceCoverage: ["limited"],
    },
    domain: "monitoring",
    freshness: "fresh",
    generatedAt: context.generatedAt,
    health: "watch",
    id: createStableItemId({
      domain: "monitoring",
      relatedFcnIds: [],
      relatedSymbols: focus.affectedAssets,
      title: focus.title,
    }),
    limitations: [],
    priority: focus.confidence >= 0.8 ? "high" : "normal",
    relatedAssetIds: focus.affectedAssets,
    relatedFcnIds: [],
    relatedSymbols: focus.affectedAssets,
    sourceState: "limited",
    summary: focus.summary,
    title: focus.title,
    whatToInspect: focus.nextMonitorAction,
    whyItMatters: focus.whyItMatters,
  }));
}

export function buildTodayFocusV2(
  context: IntelligencePlatformContext,
  snapshot: Pick<IntelligencePlatformSnapshot, "portfolio" | "market" | "risk" | "fcn">,
): TodayFocusV2Snapshot {
  const candidates = [
    ...monitoringFocusItems(context),
    ...snapshot.risk.items,
    ...snapshot.fcn.items,
    ...snapshot.portfolio.items,
    ...snapshot.market.items,
  ];
  const deduped = new Map<string, IntelligenceItem>();

  for (const item of sortIntelligenceItems(candidates)) {
    const key = focusKey(item);
    if (!deduped.has(key)) {
      deduped.set(key, item);
    }
  }

  const items: TodayFocusV2Item[] = Array.from(deduped.values())
    .filter((item) => item.domain !== "data-quality" || item.priority === "urgent")
    .slice(0, 3)
    .map((item, index) => ({
      ...item,
      focusRank: index + 1,
    }));

  return {
    generatedAt: context.generatedAt,
    items,
    limitations: items.length ? [] : ["Today Focus is limited until portfolio, market, or monitoring context is available."],
  };
}
