export type WorkspaceNotificationCategory =
  | "fcn"
  | "market"
  | "portfolio"
  | "risk"
  | "schedule"
  | "system"
  | "unknown"
  | "watchlist";

export type WorkspaceNotificationSeverity =
  | "critical"
  | "high"
  | "info"
  | "warning";

export type WorkspaceNotificationReadStatus = "read" | "unread";

export interface WorkspaceNotificationItem {
  category: WorkspaceNotificationCategory;
  createdAt: string;
  id: string;
  message: string;
  priority: number;
  readStatus: WorkspaceNotificationReadStatus;
  severity: WorkspaceNotificationSeverity;
  sourceEngine: string;
  title: string;
}

export interface WorkspaceNotificationSummary {
  criticalCount: number;
  generatedAt: string;
  highCount: number;
  informationalOnlyDisclaimer: string;
  notifications: WorkspaceNotificationItem[];
  notificationCount: number;
  readCount: number;
  unreadCount: number;
}
