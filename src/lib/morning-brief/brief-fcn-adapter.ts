import type { LegacyRiskEngineSnapshot } from "@/src/lib/risk/legacy-risk-engine";
import type { MorningBriefFcnSummary } from "@/src/lib/morning-brief/brief-types";
import { mapLegacyStatus } from "@/src/lib/morning-brief/brief-types";

export function buildMorningFcnSummary(
  snapshot: LegacyRiskEngineSnapshot | null,
): MorningBriefFcnSummary {
  if (!snapshot) {
    return {
      criticalCount: 0,
      highRiskCount: 0,
      insufficientDataCount: 0,
      repeatedUnderlyings: [],
      sourceStatus: "unavailable",
      topRiskPositions: [],
    };
  }

  return {
    criticalCount: snapshot.fcnRisk.criticalCount,
    highRiskCount: snapshot.fcnRisk.highRiskCount,
    insufficientDataCount: snapshot.fcnRisk.insufficientDataCount,
    repeatedUnderlyings: snapshot.concentrationRisk.fcnRepeatedUnderlyings.map((item) => ({
      occurrenceCount: item.occurrenceCount,
      symbol: item.symbol,
    })),
    sourceStatus: mapLegacyStatus(snapshot.fcnRisk.sourceStatus),
    topRiskPositions: snapshot.fcnRisk.topRiskPositions.map((position) => ({
      kiDistancePercent: position.nearestKiDistancePercent,
      name: position.name,
      riskLevel: position.riskLevel,
      strikeDistancePercent: position.nearestStrikeDistancePercent,
      worstOfPerformancePercent: position.worstOfPerformancePercent,
      worstOfSymbol: position.worstOfSymbol,
    })),
  };
}
