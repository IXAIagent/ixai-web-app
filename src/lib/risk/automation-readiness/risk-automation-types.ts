import type { ProgramBSafetyFlags } from "@/src/lib/market-data/live-provider-readiness";

export type RiskAutomationRuleStatus = "disabled" | "readiness_only";

export interface RiskRuleModel {
  category: "concentration" | "fcn_ki" | "market_data" | "data_quality";
  id: string;
  status: RiskAutomationRuleStatus;
  thresholdLabel: string;
}

export interface RiskTriggerModel {
  id: string;
  notificationSenderEnabled: false;
  schedulerEnabled: false;
  status: RiskAutomationRuleStatus;
}

export interface SnapshotComparisonModel {
  comparisonEnabled: false;
  sourceStatus: "readiness_only";
}

export interface RiskAutomationReadinessReport {
  alertEvaluationStatus: "readiness_only";
  generatedAt: string;
  phase: "V24_RISK_AUTOMATION_READINESS";
  rules: RiskRuleModel[];
  safetyFlags: ProgramBSafetyFlags;
  snapshotComparison: SnapshotComparisonModel;
  triggers: RiskTriggerModel[];
}
