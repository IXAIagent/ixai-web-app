import type { LegacyRiskEngineSnapshot } from "@/src/lib/risk/legacy-risk-engine";

export function buildIntelligenceRiskContext(snapshot?: LegacyRiskEngineSnapshot | null) {
  if (!snapshot) {
    return "Risk context is unavailable; Intelligence v2 keeps an insufficient-data state.";
  }

  return `Risk engine phase ${snapshot.phase}; portfolio risk ${snapshot.portfolioRisk.riskLevel}; FCN critical ${snapshot.fcnRisk.criticalCount}.`;
}
