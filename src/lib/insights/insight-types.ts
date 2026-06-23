export type WorkspaceInsightCategory =
  | "data_quality"
  | "fcn"
  | "market"
  | "portfolio"
  | "risk"
  | "schedule"
  | "system"
  | "watchlist";

export type WorkspaceInsightSeverity = "critical" | "high" | "info" | "warning";

export interface WorkspaceInsightCard {
  category: WorkspaceInsightCategory;
  id: string;
  message: string;
  severity: WorkspaceInsightSeverity;
  sourceEngine: string;
  title: string;
}

export interface WorkspaceInsightsSummary {
  criticalCount: number;
  generatedAt: string;
  highCount: number;
  informationalOnlyDisclaimer: string;
  insightCount: number;
  insights: WorkspaceInsightCard[];
  warningCount: number;
}
