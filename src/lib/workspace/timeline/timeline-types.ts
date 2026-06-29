export type WorkspaceTimelineEventType =
  | "alert"
  | "fcn_coupon"
  | "fcn_ko_observation"
  | "fcn_maturity"
  | "fcn_observation"
  | "portfolio"
  | "system"
  | "unknown"
  | "watchlist";

export type WorkspaceTimelineSeverity = "critical" | "info" | "warning";

export interface WorkspaceTimelineEvent {
  date: string;
  daysUntil: number;
  description: string;
  eventType: WorkspaceTimelineEventType;
  id: string;
  relatedPositionName?: string;
  relatedSymbol?: string;
  severity: WorkspaceTimelineSeverity;
  sourceEngine: string;
  title: string;
}

export interface WorkspaceTimelineGroup {
  events: WorkspaceTimelineEvent[];
  key: "later" | "next7Days" | "overdue" | "today";
}

export interface WorkspaceTimelineSummary {
  eventCount: number;
  generatedAt: string;
  groups: WorkspaceTimelineGroup[];
  informationalOnlyDisclaimer: string;
}
