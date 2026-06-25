import type { FCNPosition, FCNUnderlying } from "@/src/types/fcn-position";
import type {
  LegacyFcnPositionRisk,
  LegacyFcnRiskSummary,
  LegacyFcnUnderlyingRisk,
  LegacyRiskLevel,
  LegacyRiskWarning,
} from "@/src/lib/risk/legacy-risk-engine/risk-engine-types";
import {
  calculateDistancePercent,
  compareRiskLevels,
  normalizeSymbol,
  roundMetric,
  safeNumber,
} from "@/src/lib/risk/legacy-risk-engine/risk-engine-utils";

function buildUnderlyingWarning(underlying: FCNUnderlying) {
  const missing = [
    safeNumber(underlying.currentPrice) === null ? "current price" : null,
    safeNumber(underlying.initialPrice) === null ? "initial price" : null,
    safeNumber(underlying.kiPrice) === null ? "KI price" : null,
  ].filter(Boolean);

  return missing.length > 0 ? `Missing ${missing.join(", ")}.` : undefined;
}

export function analyzeLegacyFcnUnderlying(
  underlying: FCNUnderlying,
): LegacyFcnUnderlyingRisk {
  const currentPrice = safeNumber(underlying.currentPrice);
  const initialPrice = safeNumber(underlying.initialPrice);
  const kiPrice = safeNumber(underlying.kiPrice);
  const koPrice = safeNumber(underlying.koPrice);
  const strikePrice = safeNumber(underlying.strikePrice);
  const performancePercent = roundMetric(calculateDistancePercent(currentPrice, initialPrice), 2);
  const distanceToKiPercent = roundMetric(calculateDistancePercent(currentPrice, kiPrice), 2);
  const distanceToKoPercent = roundMetric(calculateDistancePercent(currentPrice, koPrice), 2);
  const distanceToStrikePercent = roundMetric(calculateDistancePercent(currentPrice, strikePrice), 2);
  const warningMessage = buildUnderlyingWarning(underlying);

  return {
    currentPrice,
    distanceToKiPercent,
    distanceToKoPercent,
    distanceToStrikePercent,
    hasBreachedKi: distanceToKiPercent !== null && distanceToKiPercent <= 0,
    hasReachedKo: distanceToKoPercent !== null && distanceToKoPercent >= 0,
    initialPrice,
    isWorstOf: false,
    kiPrice,
    koPrice,
    performancePercent,
    sourceStatus: warningMessage ? "partial" : "ready",
    strikePrice,
    symbol: normalizeSymbol(underlying.symbol),
    warningMessage,
  };
}

export function calculateLegacyFcnRiskLevel(input: {
  nearestKiDistancePercent: number | null;
  underlyings: LegacyFcnUnderlyingRisk[];
  worstOfPerformancePercent: number | null;
}): LegacyRiskLevel {
  if (input.underlyings.length === 0 || input.nearestKiDistancePercent === null) {
    return "insufficient_data";
  }

  if (
    input.underlyings.some((underlying) => underlying.hasBreachedKi) ||
    input.nearestKiDistancePercent <= 0
  ) {
    return "critical";
  }

  if (input.nearestKiDistancePercent <= 10 || (input.worstOfPerformancePercent ?? 0) <= -30) {
    return "high";
  }

  if (input.nearestKiDistancePercent <= 20 || (input.worstOfPerformancePercent ?? 0) <= -15) {
    return "elevated";
  }

  return "low";
}

export function buildLegacyFcnPositionRisk(position: FCNPosition): LegacyFcnPositionRisk {
  const generatedWarnings: LegacyRiskWarning[] = [];
  const underlyings = position.underlyings.map(analyzeLegacyFcnUnderlying);
  const worst = underlyings
    .filter((underlying) => underlying.performancePercent !== null)
    .sort((a, b) => (a.performancePercent ?? 0) - (b.performancePercent ?? 0))[0];
  const markedUnderlyings = underlyings.map((underlying) => ({
    ...underlying,
    isWorstOf: Boolean(worst && underlying.symbol === worst.symbol),
  }));
  const nearestKiDistancePercent = markedUnderlyings
    .map((underlying) => underlying.distanceToKiPercent)
    .filter((value): value is number => value !== null)
    .sort((a, b) => a - b)[0] ?? null;
  const nearestStrikeDistancePercent = markedUnderlyings
    .map((underlying) => underlying.distanceToStrikePercent)
    .filter((value): value is number => value !== null)
    .sort((a, b) => a - b)[0] ?? null;
  const nearestKoDistancePercent = markedUnderlyings
    .map((underlying) => underlying.distanceToKoPercent)
    .filter((value): value is number => value !== null)
    .sort((a, b) => b - a)[0] ?? null;

  markedUnderlyings.forEach((underlying) => {
    if (underlying.warningMessage) {
      generatedWarnings.push({
        code: `fcn-underlying-${underlying.symbol || "unknown"}-partial`,
        message: `${position.name}: ${underlying.symbol || "Unknown underlying"} ${underlying.warningMessage}`,
        severity: "warning",
      });
    }
  });

  if (markedUnderlyings.length === 0) {
    generatedWarnings.push({
      code: "fcn-missing-underlyings",
      message: `${position.name} has no underlyings available for worst-of analysis.`,
      severity: "warning",
    });
  }

  const riskLevel = calculateLegacyFcnRiskLevel({
    nearestKiDistancePercent,
    underlyings: markedUnderlyings,
    worstOfPerformancePercent: worst?.performancePercent ?? null,
  });

  return {
    id: position.id,
    name: position.name,
    nearestKiDistancePercent,
    nearestKoDistancePercent,
    nearestStrikeDistancePercent,
    riskLevel,
    sourceStatus:
      riskLevel === "insufficient_data"
        ? "insufficient_data"
        : generatedWarnings.length > 0
          ? "partial"
          : "ready",
    underlyings: markedUnderlyings,
    warnings: generatedWarnings,
    worstOfPerformancePercent: worst?.performancePercent ?? null,
    worstOfSymbol: worst?.symbol ?? null,
  };
}

export function buildLegacyFcnRiskSummary(positions: FCNPosition[]): LegacyFcnRiskSummary {
  const generatedAt = new Date().toISOString();
  const positionRisks = positions.map(buildLegacyFcnPositionRisk);
  const criticalCount = positionRisks.filter((position) => position.riskLevel === "critical").length;
  const highRiskCount = positionRisks.filter((position) => position.riskLevel === "high").length;
  const insufficientDataCount = positionRisks.filter(
    (position) => position.riskLevel === "insufficient_data",
  ).length;
  const warnings = positionRisks.flatMap((position) => position.warnings);

  return {
    criticalCount,
    generatedAt,
    highRiskCount,
    insufficientDataCount,
    positionCount: positions.length,
    positions: positionRisks,
    sourceStatus:
      positions.length === 0
        ? "insufficient_data"
        : insufficientDataCount > 0
          ? "partial"
          : "ready",
    topRiskPositions: [...positionRisks]
      .sort((a, b) => compareRiskLevels(a.riskLevel, b.riskLevel))
      .slice(0, 5),
    warnings,
  };
}
