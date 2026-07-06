import type {
  NotificationDeliveryState,
  NotificationPriority,
  NotificationRetryMetadata,
  NotificationStatus,
} from "@/src/lib/intelligence/notifications/notification-types";

export function buildNotificationRetryMetadata(priority: NotificationPriority): NotificationRetryMetadata {
  if (priority === "urgent") {
    return {
      maxRetries: 3,
      retryCount: 0,
      retryable: true,
    };
  }

  if (priority === "high") {
    return {
      maxRetries: 2,
      retryCount: 0,
      retryable: true,
    };
  }

  return {
    maxRetries: 1,
    retryCount: 0,
    retryable: priority === "normal",
  };
}

export function resolveNotificationDeliveryState(input: {
  status: NotificationStatus;
  retry: NotificationRetryMetadata;
}): NotificationDeliveryState {
  if (input.status === "failed" && input.retry.retryable && input.retry.retryCount < input.retry.maxRetries) {
    return "retryable";
  }

  if (input.status === "failed" || input.status === "expired" || input.status === "skipped" || input.status === "suppressed") {
    return "non-retryable";
  }

  return input.status;
}
