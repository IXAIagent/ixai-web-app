import type { MonitoringEvent } from "@/src/lib/intelligence/monitoring";
import type { NotificationPriority } from "@/src/lib/intelligence/notifications/notification-types";

export function mapMonitoringPriorityToNotificationPriority(event: MonitoringEvent): NotificationPriority {
  if (event.severity === "critical" || event.priorityScore >= 85) {
    return "urgent";
  }

  if (event.severity === "warning" || event.priorityScore >= 65) {
    return "high";
  }

  if (event.priorityScore >= 40) {
    return "normal";
  }

  return "low";
}
