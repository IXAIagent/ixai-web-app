import {
  buildDefaultNotificationDeliveryPolicy,
  routeNotificationEvents,
} from "@/src/lib/intelligence/notifications";
import {
  buildNotificationDiagnostics,
} from "@/src/lib/intelligence/notifications/notification-diagnostics";
import {
  buildNotificationRetryMetadata,
  resolveNotificationDeliveryState,
} from "@/src/lib/intelligence/notifications/notification-retry";
import type {
  IntelligenceAlert,
  IntelligenceAlertChannelStatus,
  IntelligenceAlertNotificationEvent,
  IntelligenceAlertNotificationPreview,
  IntelligenceAlertPreferences,
} from "@/src/lib/intelligence/alerts/alert-types";
import type { NotificationEvent } from "@/src/lib/intelligence/notifications";

function addHours(date: string, hours: number) {
  return new Date(new Date(date).getTime() + hours * 60 * 60 * 1000).toISOString();
}

export function buildAlertChannelStatus(
  preferences: IntelligenceAlertPreferences,
): IntelligenceAlertChannelStatus[] {
  return (Object.keys(preferences.channelAvailability) as Array<keyof typeof preferences.channelAvailability>).map((channel) => ({
    channel,
    deliveryMode: channel === "in-app" ? "preview-only" : "dry-run",
    enabled: channel === "in-app" && preferences.channelAvailability[channel],
    reason: channel === "in-app"
      ? "In-app preview is available. Durable persistence is not enabled by V20B."
      : `${channel} delivery is intentionally disabled in V20B; routing is preview-only.`,
  }));
}

export function buildAlertNotificationEvents(input: {
  alerts: IntelligenceAlert[];
  existingNotifications?: NotificationEvent[];
  generatedAt: string;
  preferences: IntelligenceAlertPreferences;
}): IntelligenceAlertNotificationEvent[] {
  return input.alerts.map((alert) => {
    const retry = buildNotificationRetryMetadata(alert.notificationPriority);
    const suppressionMatch = (input.existingNotifications ?? []).find(
      (notification) =>
        notification.suppressionKey === alert.notificationSuppressionKey &&
        notification.cooldownUntil &&
        new Date(notification.cooldownUntil).getTime() > new Date(input.generatedAt).getTime(),
    );
    const status = suppressionMatch ? "suppressed" : "pending";

    return {
      alertId: alert.id,
      body: `${alert.summary} Why it matters: ${alert.whyItMatters}`,
      channels: alert.notificationPriority === "urgent"
        ? ["in-app", "telegram"]
        : alert.notificationPriority === "high"
          ? ["in-app"]
          : ["in-app"],
      cooldownUntil: status === "pending"
        ? addHours(input.generatedAt, input.preferences.cooldownHours[alert.severity])
        : null,
      createdAt: input.generatedAt,
      deliveryMode: "preview-only",
      deliveryState: resolveNotificationDeliveryState({
        retry,
        status,
      }),
      expiresAt: alert.expiresAt,
      fallbackChannels: ["in-app"],
      id: `notification:${alert.id}`,
      maxRetries: retry.maxRetries,
      monitoringEventId: alert.id,
      priority: alert.notificationPriority,
      retryCount: retry.retryCount,
      severity: alert.severity,
      status,
      suppressionKey: alert.notificationSuppressionKey,
      title: alert.title,
      whyItMatters: alert.whyItMatters,
    };
  });
}

export function getAlertNotificationPreview(input: {
  alerts: IntelligenceAlert[];
  existingNotifications?: NotificationEvent[];
  generatedAt: string;
  preferences: IntelligenceAlertPreferences;
}): IntelligenceAlertNotificationPreview {
  const policy = buildDefaultNotificationDeliveryPolicy({
    channelAvailability: input.preferences.channelAvailability,
    defaultChannels: ["in-app"],
    fallbackChannels: ["in-app"],
    quietHours: input.preferences.quietHours,
  });
  const notifications = buildAlertNotificationEvents(input);
  const routed = routeNotificationEvents(notifications, policy).map((result) => ({
    ...result,
    event: result.event as IntelligenceAlertNotificationEvent,
  }));

  return {
    channelStatus: buildAlertChannelStatus(input.preferences),
    deliveryMode: "preview-only",
    diagnostics: buildNotificationDiagnostics({
      generatedAt: input.generatedAt,
      notifications,
      policy,
      routed,
    }),
    generatedAt: input.generatedAt,
    notifications,
    routed,
  };
}
