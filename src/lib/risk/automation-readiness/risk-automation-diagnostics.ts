import { programBSafetyFlags } from "@/src/lib/market-data/live-provider-readiness";
import type { RiskAutomationReadinessReport } from "@/src/lib/risk/automation-readiness/risk-automation-types";

export function buildRiskAutomationReadinessReport(): RiskAutomationReadinessReport {
  return {
    alertEvaluationStatus: "readiness_only",
    generatedAt: new Date().toISOString(),
    phase: "V24_RISK_AUTOMATION_READINESS",
    rules: [
      {
        category: "concentration",
        id: "concentration-threshold-readiness",
        status: "readiness_only",
        thresholdLabel: "Future concentration rule threshold",
      },
      {
        category: "fcn_ki",
        id: "fcn-ki-distance-readiness",
        status: "readiness_only",
        thresholdLabel: "Future FCN KI distance rule threshold",
      },
      {
        category: "market_data",
        id: "missing-quote-readiness",
        status: "readiness_only",
        thresholdLabel: "Future missing quote / stale quote rule threshold",
      },
    ],
    safetyFlags: programBSafetyFlags,
    snapshotComparison: {
      comparisonEnabled: false,
      sourceStatus: "readiness_only",
    },
    triggers: [
      {
        id: "risk-alert-evaluation-placeholder",
        notificationSenderEnabled: false,
        schedulerEnabled: false,
        status: "disabled",
      },
    ],
  };
}
