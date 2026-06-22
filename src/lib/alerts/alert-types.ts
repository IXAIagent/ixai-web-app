export type WorkspaceAlertCategory =
  | "coupon_due"
  | "data_quality"
  | "fcn_ki_warning"
  | "price_above"
  | "price_below"
  | "risk_level"
  | "unknown";

export type WorkspaceAlertSeverity = "critical" | "high" | "info" | "warning";

export interface WorkspaceAlertCard {
  category: WorkspaceAlertCategory;
  createdAt: string;
  id: string;
  message: string;
  severity: WorkspaceAlertSeverity;
  sourceEngine: string;
  title: string;
}

export interface WorkspaceAlertSummary {
  alertCount: number;
  alerts: WorkspaceAlertCard[];
  criticalCount: number;
  generatedAt: string;
  highCount: number;
  informationalOnlyDisclaimer: string;
  warningCount: number;
}
