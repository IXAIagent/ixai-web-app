"use client";

import { getWorkspaceAlertSummary } from "@/src/lib/alerts";
import { listPersistentAlertEvents } from "@/src/lib/alerts/persistence/alert-persistence-repository";
import type {
  AlertPersistenceReadiness,
  AlertPersistenceSummary,
  PersistentAlertHistoryReadback,
} from "@/src/lib/alerts/persistence/alert-persistence-types";

export async function getPersistentAlertHistoryReadback(): Promise<PersistentAlertHistoryReadback> {
  try {
    return listPersistentAlertEvents();
  } catch {
    return {
      alertEvents: [],
      generatedAt: new Date().toISOString(),
      sourceStatus: "unavailable",
      warnings: ["Persistent alert history repository failed safely."],
    };
  }
}

export async function getAlertPersistenceSummary(): Promise<AlertPersistenceSummary> {
  try {
    const alerts = await getWorkspaceAlertSummary();

    return {
      alertEvents: alerts.alerts,
      fallbackEvents: 0,
      generatedAt: new Date().toISOString(),
      informationalOnlyDisclaimer:
        "Alert persistence is a history foundation only. Delivery and recommendations are not implemented.",
      localEvents: alerts.alertCount,
      persistedEvents: 0,
      sourceStatus: alerts.alertCount > 0 ? "local" : "unavailable",
      totalEvents: alerts.alertCount,
      warnings: [
        "Future alert_events storage is planned, but no schema is required in V6.30.",
      ],
    };
  } catch {
    return {
      alertEvents: [],
      fallbackEvents: 0,
      generatedAt: new Date().toISOString(),
      informationalOnlyDisclaimer:
        "Alert persistence is a history foundation only. Delivery and recommendations are not implemented.",
      localEvents: 0,
      persistedEvents: 0,
      sourceStatus: "unavailable",
      totalEvents: 0,
      warnings: ["Alert persistence readback is unavailable."],
    };
  }
}

export async function getAlertPersistenceReadiness(): Promise<AlertPersistenceReadiness> {
  const [persistent, summary] = await Promise.all([
    getPersistentAlertHistoryReadback(),
    getAlertPersistenceSummary(),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    hasLocalFallback: summary.totalEvents > 0,
    persistedEventCount: persistent.alertEvents.length,
    sourceStatus:
      persistent.alertEvents.length > 0
        ? "persisted"
        : summary.totalEvents > 0
          ? summary.sourceStatus
          : persistent.sourceStatus,
    summary:
      "Alert persistence foundation preserves deterministic Alert Engine output. Alert delivery and background jobs are not implemented.",
    warnings: [...persistent.warnings, ...summary.warnings],
  };
}
