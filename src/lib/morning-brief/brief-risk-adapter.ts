import type { LegacyRiskEngineSnapshot } from "@/src/lib/risk/legacy-risk-engine";
import type { MorningBriefRiskSummary, MorningBriefWarning } from "@/src/lib/morning-brief/brief-types";
import { mapLegacyStatus } from "@/src/lib/morning-brief/brief-types";

export function buildMorningRiskSummary(
  snapshot: LegacyRiskEngineSnapshot | null,
): MorningBriefRiskSummary {
  if (!snapshot) {
    return {
      criticalDrivers: ["Legacy Risk Engine snapshot is unavailable."],
      riskLevel: "insufficient_data",
      riskScore: null,
      sourceEngine: "V15_LEGACY_RISK_ENGINE",
      sourceStatus: "unavailable",
      warnings: [
        {
          message: "Risk summary could not read the V15 Legacy Risk Engine snapshot.",
          severity: "warning",
          source: "V15 Legacy Risk Engine",
        },
      ],
    };
  }

  const warnings: MorningBriefWarning[] = snapshot.portfolioRisk.warnings.map((warning) => ({
    message: warning.message,
    severity: warning.severity === "high" || warning.severity === "critical" ? warning.severity : "warning",
    source: "V15 Portfolio Risk",
  }));

  return {
    criticalDrivers: snapshot.portfolioRisk.criticalDrivers,
    riskLevel: snapshot.portfolioRisk.riskLevel,
    riskScore: snapshot.portfolioRisk.riskScore,
    sourceEngine: "V15_LEGACY_RISK_ENGINE",
    sourceStatus: mapLegacyStatus(snapshot.portfolioRisk.sourceStatus),
    warnings,
  };
}
