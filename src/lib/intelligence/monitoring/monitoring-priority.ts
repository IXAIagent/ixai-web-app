import type {
  MonitoringPriorityInput,
  MonitoringSeverity,
} from "@/src/lib/intelligence/monitoring/monitoring-types";

const SEVERITY_SCORE: Record<MonitoringSeverity, number> = {
  critical: 0.92,
  warning: 0.66,
  info: 0.38,
};

function clamp(value: number) {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
}

function freshnessScore(generatedAt: string, expiresAt: string) {
  const generated = new Date(generatedAt).getTime();
  const expires = new Date(expiresAt).getTime();

  if (!Number.isFinite(generated) || !Number.isFinite(expires)) {
    return 0.5;
  }

  const hoursUntilExpiry = (expires - generated) / (1000 * 60 * 60);
  if (hoursUntilExpiry <= 0) return 0.1;
  if (hoursUntilExpiry <= 24) return 0.9;
  if (hoursUntilExpiry <= 168) return 0.68;
  return 0.42;
}

function assetHealthScore(status: MonitoringPriorityInput["asset"]["health"]["status"]) {
  if (status === "offline") return 0.95;
  if (status === "degraded") return 0.68;
  if (status === "unknown") return 0.5;
  return 0.28;
}

function fcnRelevance(input: MonitoringPriorityInput) {
  if (input.asset.assetType === "fcn" || input.event.relatedFcnIds.length > 0) return 0.88;
  return 0.28;
}

function portfolioRelevancePlaceholder(input: MonitoringPriorityInput) {
  if (input.asset.monitoringState.scope === "portfolio") return 0.72;
  if (input.asset.monitoringState.scope === "watchlist") return 0.48;
  return 0.24;
}

export function scoreMonitoringEventPriority(input: MonitoringPriorityInput): number {
  const coverageQuality = (input.asset.coverage.score + input.asset.quality.score) / 2;
  const providerQuality = input.providerDiagnostics?.quality.overall ?? coverageQuality;
  const raw =
    SEVERITY_SCORE[input.event.severity] * 0.25 +
    input.event.confidence * 0.18 +
    assetHealthScore(input.asset.health.status) * 0.17 +
    coverageQuality * 0.13 +
    providerQuality * 0.08 +
    freshnessScore(input.generatedAt, input.event.expiresAt) * 0.08 +
    fcnRelevance(input) * 0.07 +
    portfolioRelevancePlaceholder(input) * 0.04;

  return Math.round(clamp(raw) * 100);
}
