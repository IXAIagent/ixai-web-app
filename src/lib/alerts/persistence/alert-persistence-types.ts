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
  readPriority?: import("@/src/lib/workspace/database-read-priority").WorkspaceDatabaseReadPriorityMetadata;
  sourceStatus: AlertPersistenceSourceStatus;
  totalEvents: number;
  warnings: string[];
}

export interface PersistentAlertHistoryReadback {
  alertEvents: WorkspaceAlertCard[];
  generatedAt: string;
  readPriority?: import("@/src/lib/workspace/database-read-priority").WorkspaceDatabaseReadPriorityMetadata;
  sourceStatus: AlertPersistenceSourceStatus;
  warnings: string[];
}

export interface AlertPersistenceReadiness {
  generatedAt: string;
  hasLocalFallback: boolean;
  persistedEventCount: number;
  readPriority?: import("@/src/lib/workspace/database-read-priority").WorkspaceDatabaseReadPriorityMetadata;
  sourceStatus: AlertPersistenceSourceStatus;
  summary: string;
  warnings: string[];
}
