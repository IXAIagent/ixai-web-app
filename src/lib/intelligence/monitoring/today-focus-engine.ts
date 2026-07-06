import type {
  MonitoringEvent,
  TodayFocusItem,
} from "@/src/lib/intelligence/monitoring/monitoring-types";

function focusAction(event: MonitoringEvent) {
  if (event.eventType === "fcn-ki-risk" || event.eventType === "fcn-observation" || event.eventType === "fcn-coupon") {
    return "Review FCN monitor context";
  }

  if (event.eventType === "provider-fallback" || event.eventType === "data-quality") {
    return "Review data readiness";
  }

  if (event.eventType === "news-relevance") {
    return "Watch related news context";
  }

  return "Keep monitoring";
}

export function buildTodayFocus(events: MonitoringEvent[], maxItems = 3): TodayFocusItem[] {
  return events
    .filter((event) => event.severity === "critical" || event.severity === "warning" || event.priorityScore >= 55)
    .slice(0, maxItems)
    .map((event) => ({
      affectedAssets: [event.assetId, ...event.relatedAssetIds],
      confidence: event.confidence,
      eventIds: [event.id],
      nextMonitorAction: focusAction(event),
      summary: event.summary,
      title: event.title,
      whyItMatters: event.whyItMatters,
    }));
}
