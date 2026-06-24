import type { WorkspaceAlertCard } from "@/src/lib/alerts";

export type AlertPersistenceSourceStatus =
  | "error"
  | "fallback"
  | "local"
  | "partial"
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

export interface PersistentAlertHistoryReadback {
  alertEvents: WorkspaceAlertCard[];
  generatedAt: string;
  sourceStatus: AlertPersistenceSourceStatus;
  warnings: string[];
}

export interface AlertPersistenceReadiness {
  generatedAt: string;
  hasLocalFallback: boolean;
  persistedEventCount: number;
  sourceStatus: AlertPersistenceSourceStatus;
  summary: string;
  warnings: string[];
}
