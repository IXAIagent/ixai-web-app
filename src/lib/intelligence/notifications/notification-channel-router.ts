import type {
  NotificationDeliveryPolicy,
  NotificationEvent,
  NotificationRoutingResult,
} from "@/src/lib/intelligence/notifications/notification-types";
import {
  allowedChannelsForPriority,
  filterAvailableChannels,
} from "@/src/lib/intelligence/notifications/notification-delivery-policy";

export function routeNotificationEvent(
  event: NotificationEvent,
  policy: NotificationDeliveryPolicy,
): NotificationRoutingResult {
  if (event.status === "suppressed" || event.status === "expired" || event.status === "skipped") {
    return {
      event,
      fallbackChannels: [],
      reason: `Notification is ${event.status}.`,
      routedChannels: [],
    };
  }

  const priorityAllowed = allowedChannelsForPriority(event.priority);
  const requestedChannels = event.channels.filter((channel) => priorityAllowed.includes(channel));
  const routedChannels = filterAvailableChannels(requestedChannels, policy);
  const fallbackChannels = routedChannels.length
    ? []
    : filterAvailableChannels(event.fallbackChannels, policy);

  return {
    event,
    fallbackChannels,
    reason: routedChannels.length
      ? "Primary allowed channels are available."
      : fallbackChannels.length
        ? "Primary channels are unavailable; fallback channels are available."
        : "No delivery channel is available.",
    routedChannels,
  };
}

export function routeNotificationEvents(
  events: NotificationEvent[],
  policy: NotificationDeliveryPolicy,
): NotificationRoutingResult[] {
  return events.map((event) => routeNotificationEvent(event, policy));
}
