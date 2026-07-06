import type { AssetIntelligence } from "@/src/lib/intelligence/assets";
import type { MonitoringEvent } from "@/src/lib/intelligence/monitoring";
import type { WorkspaceRiskSummary } from "@/src/lib/intelligence/workspace/workspace-types";

export function buildWorkspaceRiskSummary(input: {
  assets: AssetIntelligence[];
  monitoringEvents: MonitoringEvent[];
}): WorkspaceRiskSummary {
  const topRisks = input.monitoringEvents
    .filter((event) => event.severity === "critical" || event.severity === "warning")
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 5);

  return {
    affectedAssets: Array.from(new Set(topRisks.flatMap((event) => [event.assetId, ...event.relatedAssetIds]))),
    affectedFcns: Array.from(new Set(topRisks.flatMap((event) => event.relatedFcnIds))),
    critical: input.monitoringEvents.filter((event) => event.severity === "critical").length,
    healthy: input.assets.filter((asset) => asset.health.status === "healthy").length,
    topRisks,
    warning: input.monitoringEvents.filter((event) => event.severity === "warning").length,
  };
}
