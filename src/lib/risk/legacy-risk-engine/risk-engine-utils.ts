import type { LegacyRiskLevel, LegacyRiskSourceStatus } from "@/src/lib/risk/legacy-risk-engine/risk-engine-types";

export function normalizeSymbol(symbol: string | null | undefined) {
  return (symbol ?? "").trim().toUpperCase();
}

export function safeNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function percentOf(value: number | null, total: number | null) {
  if (value === null || total === null || total <= 0) {
    return null;
  }

  return (value / total) * 100;
}

export function roundMetric(value: number | null, digits = 1) {
  if (value === null || !Number.isFinite(value)) {
    return null;
  }

  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function calculateDistancePercent(current: number | null, reference: number | null) {
  if (current === null || reference === null || reference <= 0) {
    return null;
  }

  return ((current - reference) / reference) * 100;
}

export function scoreToLevel(score: number | null): LegacyRiskLevel {
  if (score === null) return "insufficient_data";
  if (score >= 85) return "critical";
  if (score >= 65) return "high";
  if (score >= 45) return "elevated";
  if (score >= 25) return "moderate";
  return "low";
}

export function combineSourceStatus(statuses: LegacyRiskSourceStatus[]): LegacyRiskSourceStatus {
  if (statuses.length === 0) return "insufficient_data";
  if (statuses.includes("unavailable")) return "partial";
  if (statuses.includes("insufficient_data")) return "partial";
  if (statuses.includes("fallback")) return "fallback";
  if (statuses.includes("partial")) return "partial";
  return "ready";
}

export function compareRiskLevels(a: LegacyRiskLevel, b: LegacyRiskLevel) {
  const weight: Record<LegacyRiskLevel, number> = {
    critical: 5,
    high: 4,
    elevated: 3,
    moderate: 2,
    low: 1,
    insufficient_data: 0,
  };

  return weight[b] - weight[a];
}
