import type { PersistentAlertHistoryReadback } from "@/src/lib/alerts/persistence/alert-persistence-types";
import { readAlertEventsFromDatabase } from "@/src/lib/alerts/persistence/alert-database-adapter";

export async function listPersistentAlertEvents(): Promise<PersistentAlertHistoryReadback> {
  try {
    const alertEvents = await readAlertEventsFromDatabase();

    if (alertEvents.length > 0) {
      return {
        alertEvents,
        generatedAt: new Date().toISOString(),
        sourceStatus: "persisted",
        warnings: [],
      };
    }
  } catch {
    // Fall through to safe unavailable readback.
  }

  return {
    alertEvents: [],
    generatedAt: new Date().toISOString(),
    sourceStatus: "unavailable",
    warnings: ["Persistent alert_history table is optional; deterministic fallback remains active."],
  };
}
