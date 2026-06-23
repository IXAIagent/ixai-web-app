import type { WorkspaceDailyBrief } from "@/src/lib/daily-brief";

export type DailyBriefHistorySourceStatus =
  | "fallback"
  | "local"
  | "persisted"
  | "unavailable";

export interface DailyBriefHistoryEntry {
  brief: WorkspaceDailyBrief;
  id: string;
  sourceStatus: DailyBriefHistorySourceStatus;
}

export interface DailyBriefHistorySummary {
  entries: DailyBriefHistoryEntry[];
  generatedAt: string;
  informationalOnlyDisclaimer: string;
  sourceStatus: DailyBriefHistorySourceStatus;
  totalEntries: number;
  warnings: string[];
}
