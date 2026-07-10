import type {
  IntelligenceAlert,
  IntelligenceAlertDiagnostics,
  IntelligenceAlertNotificationPreview,
  IntelligenceAlertPreferences,
} from "@/src/lib/intelligence/alerts/alert-types";
import { buildAlertChannelStatus } from "@/src/lib/intelligence/alerts/alert-notification-orchestrator";

export function buildAlertDiagnostics(input: {
  alerts: IntelligenceAlert[];
  generatedAt: string;
  notificationPreview: IntelligenceAlertNotificationPreview;
  preferences: IntelligenceAlertPreferences;
}): IntelligenceAlertDiagnostics {
  const blockingIssues: string[] = [];
  const warningIssues: string[] = [];
  const criticalCount = input.alerts.filter((alert) => alert.severity === "critical").length;
  const warningCount = input.alerts.filter((alert) => alert.severity === "warning").length;
  const dataQualityCount = input.alerts.filter((alert) => alert.ruleFamily === "data-quality" || alert.ruleFamily === "provider").length;
  const openCount = input.alerts.filter((alert) => alert.status === "open").length;
  const suppressedCount = input.notificationPreview.notifications.filter((notification) => notification.status === "suppressed").length;
  const retryableCount = input.notificationPreview.notifications.filter((notification) => notification.deliveryState === "retryable").length;

  if (!input.preferences.channelAvailability["in-app"]) {
    blockingIssues.push("In-app alert preview is disabled.");
  }

  if (input.alerts.length === 0) {
    warningIssues.push("No alert candidates were generated from the current Intelligence Platform snapshot.");
  }

  if (dataQualityCount > 0) {
    warningIssues.push(`${dataQualityCount} alert(s) are related to limited data coverage or fallback sources.`);
  }

  if (suppressedCount > 0) {
    warningIssues.push(`${suppressedCount} alert notification(s) were suppressed by cooldown or de-duplication.`);
  }

  return {
    alertCount: input.alerts.length,
    blockingIssues,
    channelStatus: buildAlertChannelStatus(input.preferences),
    correlationCount: new Set(input.alerts.map((alert) => alert.correlationKey)).size,
    criticalCount,
    dataQualityCount,
    deliveryMode: "preview-only",
    generatedAt: input.generatedAt,
    inAppReady: input.preferences.channelAvailability["in-app"],
    notificationPreviewCount: input.notificationPreview.notifications.length,
    openCount,
    persistenceMode: "in-memory-preview",
    readiness: blockingIssues.length ? "red" : warningIssues.length || criticalCount > 0 ? "yellow" : "green",
    retryableCount,
    suppressedCount,
    telegramReady: false,
    warningCount,
    warningIssues,
  };
}
