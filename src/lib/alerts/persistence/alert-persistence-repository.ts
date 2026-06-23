import type { PersistentAlertHistoryReadback } from "@/src/lib/alerts/persistence/alert-persistence-types";

export async function listPersistentAlertEvents(): Promise<PersistentAlertHistoryReadback> {
  return {
    alertEvents: [],
    generatedAt: new Date().toISOString(),
    sourceStatus: "unavailable",
    warnings: [
      "Persistent alert_events table is a schema draft only in V7.60.",
    ],
  };
}
