import type {
  NotificationDeliveryPreview,
  NotificationEvent,
} from "@/src/lib/intelligence/notifications";
import type {
  WorkspaceNotificationPreview,
  WorkspaceNotificationSummary,
} from "@/src/lib/intelligence/workspace/workspace-types";

function countByPriority(notifications: NotificationEvent[], priority: NotificationEvent["priority"]) {
  return notifications.filter((notification) => notification.priority === priority).length;
}

export function buildWorkspaceNotificationSummary(
  preview: NotificationDeliveryPreview,
): WorkspaceNotificationSummary {
  return {
    high: countByPriority(preview.notifications, "high"),
    low: countByPriority(preview.notifications, "low"),
    normal: countByPriority(preview.notifications, "normal"),
    pending: preview.notifications.filter((notification) => notification.status === "pending").length,
    suppressed: preview.notifications.filter((notification) => notification.status === "suppressed").length,
    urgent: countByPriority(preview.notifications, "urgent"),
  };
}

export function buildWorkspaceNotificationPreview(
  preview: NotificationDeliveryPreview,
): WorkspaceNotificationPreview {
  return {
    ...buildWorkspaceNotificationSummary(preview),
    diagnostics: preview.diagnostics,
    notifications: preview.notifications,
  };
}
