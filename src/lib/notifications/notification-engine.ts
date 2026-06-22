import type { WorkspaceAlertCard } from "@/src/lib/alerts";
import type {
  WorkspaceNotificationCategory,
  WorkspaceNotificationItem,
  WorkspaceNotificationSummary,
} from "@/src/lib/notifications/notification-types";

const DISCLAIMER =
  "Notification Center is local UI readback only. No push, email, LINE, Telegram, backend persistence, trading, or recommendation delivery is implemented.";

function categoryFromAlert(alert: WorkspaceAlertCard): WorkspaceNotificationCategory {
  if (alert.category === "coupon_due") return "schedule";
  if (alert.category === "fcn_ki_warning") return "fcn";
  if (alert.category === "price_above" || alert.category === "price_below") {
    return "watchlist";
  }
  if (alert.category === "risk_level") return "risk";
  if (alert.category === "data_quality") return "market";
  return "unknown";
}

function priorityFromSeverity(severity: WorkspaceAlertCard["severity"]) {
  if (severity === "critical") return 100;
  if (severity === "high") return 80;
  if (severity === "warning") return 50;
  return 20;
}

export function buildWorkspaceNotificationSummary(input: {
  alerts: WorkspaceAlertCard[];
  readIds?: string[];
}): WorkspaceNotificationSummary {
  const readIds = new Set(input.readIds ?? []);
  const notifications: WorkspaceNotificationItem[] = input.alerts
    .map((alert) => ({
      category: categoryFromAlert(alert),
      createdAt: alert.createdAt,
      id: `notification-${alert.id}`,
      message: alert.message,
      priority: priorityFromSeverity(alert.severity),
      readStatus: readIds.has(`notification-${alert.id}`) ? "read" as const : "unread" as const,
      severity: alert.severity,
      sourceEngine: alert.sourceEngine,
      title: alert.title,
    }))
    .sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return {
    criticalCount: notifications.filter((item) => item.severity === "critical").length,
    generatedAt: new Date().toISOString(),
    highCount: notifications.filter((item) => item.severity === "high").length,
    informationalOnlyDisclaimer: DISCLAIMER,
    notificationCount: notifications.length,
    notifications,
    readCount: notifications.filter((item) => item.readStatus === "read").length,
    unreadCount: notifications.filter((item) => item.readStatus === "unread").length,
  };
}
