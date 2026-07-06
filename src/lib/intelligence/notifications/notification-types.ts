import type { MonitoringEvent, MonitoringSeverity } from "@/src/lib/intelligence/monitoring";

export type NotificationChannel =
  | "browser-push"
  | "email"
  | "in-app"
  | "line"
  | "mobile-push"
  | "telegram";

export type NotificationPriority = "high" | "low" | "normal" | "urgent";

export type NotificationStatus =
  | "delivered"
  | "expired"
  | "failed"
  | "pending"
  | "skipped"
  | "suppressed";

export type NotificationDeliveryState =
  | "non-retryable"
  | "retryable"
  | NotificationStatus;

export type NotificationRetryMetadata = {
  maxRetries: number;
  retryCount: number;
  retryable: boolean;
};

export type NotificationEvent = {
  body: string;
  channels: NotificationChannel[];
  cooldownUntil: string | null;
  createdAt: string;
  deliveryState: NotificationDeliveryState;
  expiresAt: string;
  fallbackChannels: NotificationChannel[];
  id: string;
  maxRetries: number;
  monitoringEventId: string;
  priority: NotificationPriority;
  retryCount: number;
  severity: MonitoringSeverity;
  status: NotificationStatus;
  suppressionKey: string;
  title: string;
  whyItMatters: string;
};

export type NotificationChannelReadiness = {
  available: boolean;
  channel: NotificationChannel;
  reason: string;
};

export type NotificationDeliveryPolicy = {
  channelAvailability: Record<NotificationChannel, boolean>;
  confidenceThreshold: number;
  defaultChannels: NotificationChannel[];
  fallbackChannels: NotificationChannel[];
  quietHours: {
    enabled: boolean;
    end: string;
    start: string;
    timezone: string;
  };
};

export type NotificationRoutingResult = {
  event: NotificationEvent;
  fallbackChannels: NotificationChannel[];
  reason: string;
  routedChannels: NotificationChannel[];
};

export type NotificationDiagnostics = {
  blockingIssues: string[];
  channelReadiness: NotificationChannelReadiness[];
  deliveryReadiness: "green" | "red" | "yellow";
  fallbackChannelReadiness: NotificationChannelReadiness[];
  generatedAt: string;
  highCount: number;
  lowCount: number;
  normalCount: number;
  notificationCount: number;
  retryableCount: number;
  skippedCount: number;
  suppressedCount: number;
  urgentCount: number;
  warningIssues: string[];
};

export type NotificationDeliveryPreview = {
  diagnostics: NotificationDiagnostics;
  generatedAt: string;
  notifications: NotificationEvent[];
  routed: NotificationRoutingResult[];
};

export type NotificationServiceInput = {
  existingNotifications?: NotificationEvent[];
  generatedAt?: string;
  monitoringEvents?: MonitoringEvent[];
  policy?: Partial<NotificationDeliveryPolicy>;
};
