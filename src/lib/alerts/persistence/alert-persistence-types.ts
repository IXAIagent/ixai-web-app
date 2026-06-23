import type { WorkspaceAlertCard } from "@/src/lib/alerts";

export type AlertPersistenceSourceStatus =
  | "fallback"
  | "local"
  | "persisted"
  | "unavailable";

export interface AlertPersistenceSummary {
  alertEvents: WorkspaceAlertCard[];
  fallbackEvents: number;
  generatedAt: string;
  informationalOnlyDisclaimer: string;
  localEvents: number;
  persistedEvents: number;
  sourceStatus: AlertPersistenceSourceStatus;
  totalEvents: number;
  warnings: string[];
}
