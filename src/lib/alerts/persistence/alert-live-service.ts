import {
  checkAlertTablesReadiness,
  readAlertEventsFromDatabase,
} from "@/src/lib/alerts/persistence/alert-database-adapter";
import type { WorkspaceAlertCard } from "@/src/lib/alerts";
import { saveAlertHistoryWithV12DatabaseWrite } from "@/src/lib/workspace/database-write-activation";

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
              "alert_history is empty or unavailable; deterministic Alert Engine remains active.",
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
          "Alert event was not written to database because alert_history is not fully ready; UI-only alert fallback remains active.",
      };
    }

    const result = await saveAlertHistoryWithV12DatabaseWrite(alert);

    return {
      dedupeKey,
      generatedAt: new Date().toISOString(),
      ok: result.success,
      sourceStatus: result.success ? "persisted" : "partial",
      warning:
        result.errorMessage ??
        result.blockingReason ??
        "Alert history database write was skipped by the V12 guard.",
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
      "V12 Alert History live persistence reads alert_history when available. It does not auto-insert generated alerts on render.",
    warnings: readback.warnings,
  };
}
