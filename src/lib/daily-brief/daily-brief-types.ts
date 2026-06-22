export type WorkspaceDailyBriefSectionKey =
  | "alerts"
  | "fcn_risk"
  | "fcn_schedule"
  | "intelligence"
  | "portfolio_snapshot"
  | "risk_summary"
  | "watchlist";

export type WorkspaceDailyBriefSeverity = "critical" | "info" | "warning";

export interface WorkspaceDailyBriefSection {
  body: string;
  key: WorkspaceDailyBriefSectionKey;
  severity: WorkspaceDailyBriefSeverity;
  title: string;
}

export interface WorkspaceDailyBrief {
  generatedAt: string;
  informationalOnlyDisclaimer: string;
  sectionCount: number;
  sections: WorkspaceDailyBriefSection[];
  summary: string;
}
