import type { MonitoringEvent } from "@/src/lib/intelligence/monitoring";
import type {
  NotificationChannel,
  NotificationDeliveryPolicy,
  NotificationPriority,
} from "@/src/lib/intelligence/notifications/notification-types";

export const DEFAULT_NOTIFICATION_CHANNELS: NotificationChannel[] = [
  "in-app",
  "telegram",
  "line",
  "email",
  "browser-push",
  "mobile-push",
];

export function buildDefaultNotificationDeliveryPolicy(
  patch: Partial<NotificationDeliveryPolicy> = {},
): NotificationDeliveryPolicy {
  return {
    channelAvailability: {
      "browser-push": false,
      email: false,
      "in-app": true,
      line: false,
      "mobile-push": false,
      telegram: false,
      ...(patch.channelAvailability ?? {}),
    },
    confidenceThreshold: patch.confidenceThreshold ?? 0.35,
    defaultChannels: patch.defaultChannels ?? ["in-app"],
    fallbackChannels: patch.fallbackChannels ?? ["in-app"],
    quietHours: {
      enabled: false,
      end: "08:00",
      start: "22:00",
      timezone: "Asia/Taipei",
      ...(patch.quietHours ?? {}),
    },
  };
}

export function allowedChannelsForPriority(priority: NotificationPriority): NotificationChannel[] {
  if (priority === "urgent") {
    return ["in-app", "telegram", "line", "email", "browser-push", "mobile-push"];
  }

  if (priority === "high") {
    return ["in-app", "telegram", "line", "email"];
  }

  if (priority === "normal") {
    return ["in-app", "telegram", "email"];
  }

  return ["in-app"];
}

export function shouldSkipForLowConfidence(event: MonitoringEvent, policy: NotificationDeliveryPolicy) {
  return event.confidence < policy.confidenceThreshold;
}

export function filterAvailableChannels(
  channels: NotificationChannel[],
  policy: NotificationDeliveryPolicy,
): NotificationChannel[] {
  return channels.filter((channel) => policy.channelAvailability[channel]);
}
