import {
  checkAlertTablesReadiness,
  insertAlertEventDraft,
  readAlertEventsFromDatabase,
} from "@/src/lib/alerts/persistence/alert-database-adapter";
import type { WorkspaceAlertCard } from "@/src/lib/alerts";

export interface AlertLivePersistenceReadback {
  alertEvents: WorkspaceAlertCard[];
  generatedAt: string;
  sourceStatus: "partial" | "persisted" | "unavailable";
  warnings: string[];
}

export interface AlertLiveWriteResult {
  dedupeKey: string;
  generatedAt: string;
  ok: boolean;
  sourceStatus: "partial" | "persisted" | "unavailable";
  warning: string;
}

export function buildAlertEventDedupeKey(alert: Pick<WorkspaceAlertCard, "id" | "sourceEngine">) {
  return `${alert.sourceEngine}:${alert.id}`;
}

export async function readLiveAlertEvents(): Promise<WorkspaceAlertCard[]> {
  try {
    return readAlertEventsFromDatabase();
  } catch {
    return [];
  }
}

export async function getLiveAlertHistoryReadback(): Promise<AlertLivePersistenceReadback> {
  try {
    const [alertEvents, readiness] = await Promise.all([
      readLiveAlertEvents(),
      checkAlertTablesReadiness(),
    ]);

    return {
      alertEvents,
      generatedAt: new Date().toISOString(),
      sourceStatus:
        alertEvents.length > 0
          ? "persisted"
          : readiness.sourceStatus === "partial"
            ? "partial"
            : "unavailable",
      warnings:
        alertEvents.length > 0
          ? readiness.warnings
          : [
              "alert_events is empty or unavailable; deterministic Alert Engine remains active.",
              ...readiness.warnings,
            ],
    };
  } catch {
    return {
      alertEvents: [],
      generatedAt: new Date().toISOString(),
      sourceStatus: "unavailable",
      warnings: ["Alert history live persistence readback failed safely; Alert Engine remains active."],
    };
  }
}

export async function saveAlertEventToDatabase(
  alert: WorkspaceAlertCard,
): Promise<AlertLiveWriteResult> {
  const dedupeKey = buildAlertEventDedupeKey(alert);

  try {
    const readiness = await checkAlertTablesReadiness();

    if (readiness.sourceStatus !== "ready") {
      return {
        dedupeKey,
        generatedAt: new Date().toISOString(),
        ok: false,
        sourceStatus: readiness.sourceStatus === "partial" ? "partial" : "unavailable",
        warning:
          "Alert event was not written to database because alert_events is not fully ready; UI-only alert fallback remains active.",
      };
    }

    const result = await insertAlertEventDraft();

    return {
      dedupeKey,
      generatedAt: new Date().toISOString(),
      ok: result.ok,
      sourceStatus: result.ok ? "persisted" : "partial",
      warning: result.warning,
    };
  } catch {
    return {
      dedupeKey,
      generatedAt: new Date().toISOString(),
      ok: false,
      sourceStatus: "unavailable",
      warning: "Alert event database write guard failed safely; no duplicate write was attempted.",
    };
  }
}

export async function getLiveAlertHistoryReadiness() {
  const readback = await getLiveAlertHistoryReadback();

  return {
    generatedAt: readback.generatedAt,
    liveAlertEvents: readback.alertEvents.length,
    sourceStatus: readback.sourceStatus,
    summary:
      "V9.40 Alert History live persistence reads alert_events when available. It does not auto-insert generated alerts on render.",
    warnings: readback.warnings,
  };
}
