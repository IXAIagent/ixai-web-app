import type { MonitoringEvent } from "@/src/lib/intelligence/monitoring";
import type { NotificationEvent } from "@/src/lib/intelligence/notifications/notification-types";

function addHours(date: string, hours: number) {
  return new Date(new Date(date).getTime() + hours * 60 * 60 * 1000).toISOString();
}

export function buildNotificationSuppressionKey(event: MonitoringEvent) {
  const assetKey = event.assetId || "global";
  if (event.eventType === "provider-fallback") {
    return `provider-fallback:${event.source}`;
  }

  return `${assetKey}:${event.eventType}`;
}

export function buildNotificationCooldownUntil(event: MonitoringEvent, createdAt: string) {
  if (event.eventType === "provider-fallback") {
    return addHours(createdAt, 12);
  }

  if (event.severity === "critical") {
    return addHours(createdAt, 2);
  }

  if (event.severity === "warning") {
    return addHours(createdAt, 6);
  }

  return addHours(createdAt, 24);
}

export function isNotificationSuppressed(input: {
  existingNotifications: NotificationEvent[];
  monitoringEvent: MonitoringEvent;
  now: string;
  suppressionKey: string;
}) {
  const nowMs = new Date(input.now).getTime();

  return input.existingNotifications.some((notification) => {
    if (notification.suppressionKey !== input.suppressionKey) {
      return false;
    }

    if (notification.monitoringEventId === input.monitoringEvent.id) {
      return true;
    }

    if (!notification.cooldownUntil) {
      return false;
    }

    const cooldownMs = new Date(notification.cooldownUntil).getTime();
    return Number.isFinite(cooldownMs) && cooldownMs > nowMs;
  });
}

export function isNotificationExpired(event: MonitoringEvent, now: string) {
  return new Date(event.expiresAt).getTime() <= new Date(now).getTime();
}
