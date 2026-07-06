import {
  DEFAULT_NOTIFICATION_CHANNELS,
  filterAvailableChannels,
} from "@/src/lib/intelligence/notifications/notification-delivery-policy";
import type {
  NotificationChannelReadiness,
  NotificationDeliveryPolicy,
  NotificationDiagnostics,
  NotificationEvent,
  NotificationRoutingResult,
} from "@/src/lib/intelligence/notifications/notification-types";

function channelReadiness(policy: NotificationDeliveryPolicy): NotificationChannelReadiness[] {
  return DEFAULT_NOTIFICATION_CHANNELS.map((channel) => ({
    available: policy.channelAvailability[channel],
    channel,
    reason: policy.channelAvailability[channel]
      ? "Channel is enabled for routing preview."
      : "Channel is not enabled; no provider integration is active.",
  }));
}

export function buildNotificationDiagnostics(input: {
  generatedAt: string;
  notifications: NotificationEvent[];
  policy: NotificationDeliveryPolicy;
  routed: NotificationRoutingResult[];
}): NotificationDiagnostics {
  const blockingIssues: string[] = [];
  const warningIssues: string[] = [];
  const urgentCount = input.notifications.filter((notification) => notification.priority === "urgent").length;
  const highCount = input.notifications.filter((notification) => notification.priority === "high").length;
  const normalCount = input.notifications.filter((notification) => notification.priority === "normal").length;
  const lowCount = input.notifications.filter((notification) => notification.priority === "low").length;
  const suppressedCount = input.notifications.filter((notification) => notification.status === "suppressed").length;
  const skippedCount = input.notifications.filter((notification) => notification.status === "skipped").length;
  const retryableCount = input.notifications.filter((notification) => notification.deliveryState === "retryable").length;
  const availableFallback = filterAvailableChannels(input.policy.fallbackChannels, input.policy);
  const unroutable = input.routed.filter(
    (result) => result.routedChannels.length === 0 && result.fallbackChannels.length === 0 && result.event.status === "pending",
  ).length;

  if (input.notifications.length === 0) {
    warningIssues.push("No notification events were generated.");
  }

  if (unroutable > 0) {
    blockingIssues.push(`${unroutable} pending notification(s) have no available channel.`);
  }

  if (availableFallback.length === 0) {
    warningIssues.push("No fallback notification channel is currently available.");
  }

  if (suppressedCount > 0) {
    warningIssues.push(`${suppressedCount} notification(s) were suppressed by de-duplication or cooldown.`);
  }

  return {
    blockingIssues,
    channelReadiness: channelReadiness(input.policy),
    deliveryReadiness: blockingIssues.length ? "red" : warningIssues.length ? "yellow" : "green",
    fallbackChannelReadiness: input.policy.fallbackChannels.map((channel) => ({
      available: input.policy.channelAvailability[channel],
      channel,
      reason: input.policy.channelAvailability[channel]
        ? "Fallback channel is available."
        : "Fallback channel is configured but unavailable.",
    })),
    generatedAt: input.generatedAt,
    highCount,
    lowCount,
    normalCount,
    notificationCount: input.notifications.length,
    retryableCount,
    skippedCount,
    suppressedCount,
    urgentCount,
    warningIssues,
  };
}
