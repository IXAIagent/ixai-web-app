"use client";

import { getWorkspaceAlertSummary } from "@/src/lib/alerts";
import type { AlertPersistenceSummary } from "@/src/lib/alerts/persistence/alert-persistence-types";

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
