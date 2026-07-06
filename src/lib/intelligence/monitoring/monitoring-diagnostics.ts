import type { AssetIntelligence } from "@/src/lib/intelligence/assets";
import type {
  MonitoringDiagnostics,
  MonitoringEvent,
} from "@/src/lib/intelligence/monitoring/monitoring-types";

function readiness(input: {
  assetCoverage: number;
  criticalCount: number;
  eventCount: number;
  staleDataCount: number;
}) {
  if (input.eventCount === 0 || input.criticalCount > 0 || input.assetCoverage < 0.35) {
    return "red" as const;
  }

  if (input.staleDataCount > 0 || input.assetCoverage < 0.6) {
    return "yellow" as const;
  }

  return "green" as const;
}

export function buildMonitoringDiagnostics(
  events: MonitoringEvent[],
  assets: AssetIntelligence[],
  generatedAt = new Date().toISOString(),
): MonitoringDiagnostics {
  const assetCoverage = assets.length
    ? assets.reduce((sum, asset) => sum + asset.coverage.score, 0) / assets.length
    : 0;
  const criticalCount = events.filter((event) => event.severity === "critical").length;
  const warningCount = events.filter((event) => event.severity === "warning").length;
  const infoCount = events.filter((event) => event.severity === "info").length;
  const providerFallbackCount = events.filter((event) => event.eventType === "provider-fallback").length;
  const staleDataCount = events.filter((event) => event.title.toLowerCase().includes("stale")).length;
  const nextReadiness = readiness({
    assetCoverage,
    criticalCount,
    eventCount: events.length,
    staleDataCount,
  });
  const blockingIssues: string[] = [];
  const warningIssues: string[] = [];

  if (events.length === 0) {
    blockingIssues.push("No monitoring events were generated.");
  }

  if (criticalCount > 0) {
    blockingIssues.push(`${criticalCount} critical monitoring event(s) need review.`);
  }

  if (assetCoverage < 0.35) {
    blockingIssues.push("Asset coverage is too limited for reliable monitoring.");
  } else if (assetCoverage < 0.6) {
    warningIssues.push("Asset coverage is partial.");
  }

  if (providerFallbackCount > 0) {
    warningIssues.push("Provider fallback is active.");
  }

  if (staleDataCount > 0) {
    warningIssues.push(`${staleDataCount} stale data event(s) detected.`);
  }

  return {
    assetCoverage: Math.round(assetCoverage * 100) / 100,
    blockingIssues,
    criticalCount,
    eventCount: events.length,
    generatedAt,
    infoCount,
    providerFallbackCount,
    readiness: nextReadiness,
    staleDataCount,
    warningCount,
    warningIssues,
  };
}
