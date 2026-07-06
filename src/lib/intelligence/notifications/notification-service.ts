import type { MonitoringEvent } from "@/src/lib/intelligence/monitoring";
import { routeNotificationEvents } from "@/src/lib/intelligence/notifications/notification-channel-router";
import {
  allowedChannelsForPriority,
  buildDefaultNotificationDeliveryPolicy,
  filterAvailableChannels,
  shouldSkipForLowConfidence,
} from "@/src/lib/intelligence/notifications/notification-delivery-policy";
import { buildNotificationDiagnostics } from "@/src/lib/intelligence/notifications/notification-diagnostics";
import { mapMonitoringPriorityToNotificationPriority } from "@/src/lib/intelligence/notifications/notification-priority";
import {
  buildNotificationRetryMetadata,
  resolveNotificationDeliveryState,
} from "@/src/lib/intelligence/notifications/notification-retry";
import {
  buildNotificationCooldownUntil,
  buildNotificationSuppressionKey,
  isNotificationExpired,
  isNotificationSuppressed,
} from "@/src/lib/intelligence/notifications/notification-suppression";
import type {
  NotificationDeliveryPreview,
  NotificationEvent,
  NotificationRoutingResult,
  NotificationServiceInput,
} from "@/src/lib/intelligence/notifications/notification-types";

function bodyFromMonitoringEvent(event: MonitoringEvent) {
  return `${event.summary} Why it matters: ${event.whyItMatters}`;
}

function createNotificationEvent(input: {
  event: MonitoringEvent;
  existingNotifications: NotificationEvent[];
  generatedAt: string;
  policy: ReturnType<typeof buildDefaultNotificationDeliveryPolicy>;
}): NotificationEvent {
  const priority = mapMonitoringPriorityToNotificationPriority(input.event);
  const retry = buildNotificationRetryMetadata(priority);
  const suppressionKey = buildNotificationSuppressionKey(input.event);
  const expired = isNotificationExpired(input.event, input.generatedAt);
  const suppressed = isNotificationSuppressed({
    existingNotifications: input.existingNotifications,
    monitoringEvent: input.event,
    now: input.generatedAt,
    suppressionKey,
  });
  const lowConfidence = shouldSkipForLowConfidence(input.event, input.policy);
  const allowedChannels = allowedChannelsForPriority(priority);
  const availablePrimary = filterAvailableChannels(allowedChannels, input.policy);
  const status = expired
    ? "expired"
    : suppressed
      ? "suppressed"
      : lowConfidence
        ? "skipped"
        : "pending";

  return {
    body: bodyFromMonitoringEvent(input.event),
    channels: availablePrimary.length ? allowedChannels : input.policy.defaultChannels,
    cooldownUntil: status === "pending" ? buildNotificationCooldownUntil(input.event, input.generatedAt) : null,
    createdAt: input.generatedAt,
    deliveryState: resolveNotificationDeliveryState({
      retry,
      status,
    }),
    expiresAt: input.event.expiresAt,
    fallbackChannels: input.policy.fallbackChannels,
    id: `notification:${input.event.id}`,
    maxRetries: retry.maxRetries,
    monitoringEventId: input.event.id,
    priority,
    retryCount: retry.retryCount,
    severity: input.event.severity,
    status,
    suppressionKey,
    title: input.event.title,
    whyItMatters: input.event.whyItMatters,
  };
}

export function createNotificationEvents(input: NotificationServiceInput = {}): NotificationEvent[] {
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const policy = buildDefaultNotificationDeliveryPolicy(input.policy);

  return (input.monitoringEvents ?? []).map((event) =>
    createNotificationEvent({
      event,
      existingNotifications: input.existingNotifications ?? [],
      generatedAt,
      policy,
    }),
  );
}

export function routeNotificationEventsForInput(input: NotificationServiceInput = {}): NotificationRoutingResult[] {
  const policy = buildDefaultNotificationDeliveryPolicy(input.policy);
  return routeNotificationEvents(createNotificationEvents(input), policy);
}

export function getNotificationDiagnostics(input: NotificationServiceInput = {}) {
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const policy = buildDefaultNotificationDeliveryPolicy(input.policy);
  const notifications = createNotificationEvents({
    ...input,
    generatedAt,
    policy,
  });
  const routed = routeNotificationEvents(notifications, policy);

  return buildNotificationDiagnostics({
    generatedAt,
    notifications,
    policy,
    routed,
  });
}

export function getNotificationDeliveryPreview(input: NotificationServiceInput = {}): NotificationDeliveryPreview {
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const policy = buildDefaultNotificationDeliveryPolicy(input.policy);
  const notifications = createNotificationEvents({
    ...input,
    generatedAt,
    policy,
  });
  const routed = routeNotificationEvents(notifications, policy);

  return {
    diagnostics: buildNotificationDiagnostics({
      generatedAt,
      notifications,
      policy,
      routed,
    }),
    generatedAt,
    notifications,
    routed,
  };
}

export { routeNotificationEvents };
