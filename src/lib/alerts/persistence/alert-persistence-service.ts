"use client";

import { getWorkspaceAlertSummary } from "@/src/lib/alerts";
import { getLiveAlertHistoryReadback } from "@/src/lib/alerts/persistence/alert-live-service";
import { listPersistentAlertEvents } from "@/src/lib/alerts/persistence/alert-persistence-repository";
import type {
  AlertPersistenceReadiness,
  AlertPersistenceSummary,
  PersistentAlertHistoryReadback,
} from "@/src/lib/alerts/persistence/alert-persistence-types";
import {
  getDatabaseReadPriorityMetadata,
  hasArrayData,
  resolveDatabaseReadPriority,
} from "@/src/lib/workspace/database-read-priority";

export async function getPersistentAlertHistoryReadback(): Promise<PersistentAlertHistoryReadback> {
  try {
    const priority = await resolveDatabaseReadPriority({
      database: {
        emptyData: [],
        hasData: hasArrayData,
        isDatabaseReady: (events) => events.length > 0,
        read: async () => {
          const readback = await getLiveAlertHistoryReadback();
          return readback.alertEvents;
        },
      },
      local: {
        emptyData: [],
        hasData: hasArrayData,
        read: async () => {
          const summary = await getWorkspaceAlertSummary();
          return summary.alerts;
        },
      },
      truth: {
        emptyData: [],
        hasData: hasArrayData,
        read: async () => {
          const readback = await listPersistentAlertEvents();
          return readback.alertEvents;
        },
      },
    });

    return {
      alertEvents: priority.data,
      generatedAt: new Date().toISOString(),
      readPriority: getDatabaseReadPriorityMetadata(priority),
      sourceStatus:
        priority.source === "database"
          ? "persisted"
          : priority.source === "truth"
            ? "fallback"
            : priority.source === "local"
              ? "local"
              : priority.source === "error"
                ? "error"
                : "unavailable",
      warnings: [
        `V10 read priority source: ${priority.source}; fallback active: ${priority.fallbackUsed ? "yes" : "no"}; database ready: ${priority.isDatabaseReady ? "yes" : "no"}.`,
        ...(priority.errorMessage ? [priority.errorMessage] : []),
      ],
    };
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
    const persistent = await getPersistentAlertHistoryReadback();
    const persistedEvents = persistent.sourceStatus === "persisted" ? persistent.alertEvents.length : 0;
    const localEvents = persistent.sourceStatus === "local" ? persistent.alertEvents.length : 0;
    const fallbackEvents = persistent.sourceStatus === "fallback" ? persistent.alertEvents.length : 0;

    return {
      alertEvents: persistent.alertEvents,
      fallbackEvents,
      generatedAt: new Date().toISOString(),
      informationalOnlyDisclaimer:
        "Alert persistence is a history foundation only. Delivery and recommendations are not implemented.",
      localEvents,
      persistedEvents,
      readPriority: persistent.readPriority,
      sourceStatus: persistent.sourceStatus,
      totalEvents: persistent.alertEvents.length,
      warnings: persistent.warnings,
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
    readPriority: persistent.readPriority,
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
