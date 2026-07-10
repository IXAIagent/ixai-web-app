import type {
  IntelligenceDomain,
  IntelligenceHealth,
  IntelligenceItem,
  IntelligencePlatformSnapshot,
  IntelligencePriority,
} from "@/src/lib/intelligence/platform";
import type {
  NotificationChannel,
  NotificationDeliveryPreview,
  NotificationEvent,
  NotificationPriority,
  NotificationRoutingResult,
} from "@/src/lib/intelligence/notifications";

export type IntelligenceAlertType =
  | "data-quality"
  | "fcn-event"
  | "fcn-risk"
  | "market"
  | "portfolio"
  | "provider-fallback"
  | "risk"
  | "watchlist";

export type IntelligenceAlertRuleFamily =
  | "data-quality"
  | "fcn"
  | "market"
  | "portfolio"
  | "provider"
  | "risk"
  | "watchlist";

export type IntelligenceAlertSeverity = "critical" | "info" | "warning";

export type IntelligenceAlertStatus =
  | "acknowledged"
  | "archived"
  | "open"
  | "resolved"
  | "snoozed";

export type IntelligenceAlertLifecycleAction =
  | "acknowledge"
  | "archive"
  | "open"
  | "resolve"
  | "snooze";

export type IntelligenceAlertSource =
  | "asset-intelligence"
  | "editorial-intelligence"
  | "intelligence-platform"
  | "monitoring-engine"
  | "notification-preview"
  | "provider-diagnostics";

export type IntelligenceAlertDeliveryMode = "dry-run" | "preview-only";

export type IntelligenceAlertPersistenceMode =
  | "in-memory-preview"
  | "local-session"
  | "not-durable";

export type IntelligenceAlertCandidate = {
  affectedAssetIds: string[];
  affectedFcnIds: string[];
  affectedSymbols: string[];
  confidence: number;
  createdAt: string;
  expiresAt: string;
  health: IntelligenceHealth;
  id: string;
  itemIds: string[];
  priority: IntelligencePriority;
  ruleFamily: IntelligenceAlertRuleFamily;
  source: IntelligenceAlertSource;
  sourceDomains: IntelligenceDomain[];
  summary: string;
  title: string;
  type: IntelligenceAlertType;
  whatToMonitor: string;
  whyItMatters: string;
};

export type IntelligenceAlert = IntelligenceAlertCandidate & {
  correlationKey: string;
  cooldownKey: string;
  dedupeKey: string;
  notificationPriority: NotificationPriority;
  notificationSuppressionKey: string;
  severity: IntelligenceAlertSeverity;
  status: IntelligenceAlertStatus;
};

export type IntelligenceAlertPreferences = {
  channelAvailability: Record<NotificationChannel, boolean>;
  cooldownHours: Record<IntelligenceAlertSeverity, number>;
  enabledRuleFamilies: IntelligenceAlertRuleFamily[];
  externalDeliveryEnabled: false;
  minimumNotificationPriority: NotificationPriority;
  quietHours: {
    enabled: boolean;
    end: string;
    start: string;
    timezone: string;
  };
};

export type IntelligenceAlertLifecycleResult = {
  alert: IntelligenceAlert;
  allowed: boolean;
  nextStatus: IntelligenceAlertStatus;
  reason: string;
};

export type IntelligenceAlertChannelStatus = {
  channel: NotificationChannel;
  deliveryMode: IntelligenceAlertDeliveryMode;
  enabled: boolean;
  reason: string;
};

export type IntelligenceAlertNotificationEvent = NotificationEvent & {
  alertId: string;
  deliveryMode: IntelligenceAlertDeliveryMode;
};

export type IntelligenceAlertNotificationPreview = Omit<
  NotificationDeliveryPreview,
  "notifications" | "routed"
> & {
  channelStatus: IntelligenceAlertChannelStatus[];
  deliveryMode: IntelligenceAlertDeliveryMode;
  notifications: IntelligenceAlertNotificationEvent[];
  routed: Array<NotificationRoutingResult & { event: IntelligenceAlertNotificationEvent }>;
};

export type IntelligenceAlertDiagnostics = {
  alertCount: number;
  blockingIssues: string[];
  channelStatus: IntelligenceAlertChannelStatus[];
  correlationCount: number;
  criticalCount: number;
  dataQualityCount: number;
  deliveryMode: IntelligenceAlertDeliveryMode;
  generatedAt: string;
  inAppReady: boolean;
  notificationPreviewCount: number;
  openCount: number;
  persistenceMode: IntelligenceAlertPersistenceMode;
  readiness: "green" | "red" | "yellow";
  retryableCount: number;
  suppressedCount: number;
  telegramReady: false;
  warningCount: number;
  warningIssues: string[];
};

export type IntelligenceAlertSnapshot = {
  alerts: IntelligenceAlert[];
  diagnostics: IntelligenceAlertDiagnostics;
  generatedAt: string;
  notificationPreview: IntelligenceAlertNotificationPreview;
  platformSnapshot: IntelligencePlatformSnapshot;
  preferences: IntelligenceAlertPreferences;
};

export type IntelligenceAlertRuleContext = {
  generatedAt: string;
  platformSnapshot: IntelligencePlatformSnapshot;
};

export type IntelligenceAlertRule = {
  family: IntelligenceAlertRuleFamily;
  id: string;
  run: (context: IntelligenceAlertRuleContext) => IntelligenceAlertCandidate[];
};

export type IntelligenceAlertServiceInput = {
  existingNotifications?: NotificationEvent[];
  generatedAt?: string;
  platformSnapshot?: IntelligencePlatformSnapshot;
  preferences?: Partial<IntelligenceAlertPreferences>;
};

export type AlertableIntelligenceItem = Pick<
  IntelligenceItem,
  | "confidence"
  | "domain"
  | "generatedAt"
  | "health"
  | "id"
  | "limitations"
  | "priority"
  | "relatedAssetIds"
  | "relatedFcnIds"
  | "relatedSymbols"
  | "sourceState"
  | "summary"
  | "title"
  | "whatToInspect"
  | "whyItMatters"
>;
