import type {
  WorkspaceIntelligenceDataQuality,
  WorkspaceIntelligenceSeverity,
} from "@/src/lib/workspace/intelligence";

export type WorkspaceMorningBriefStatus = "partial" | "ready" | "unavailable";

export type WorkspaceMorningBriefSectionKey =
  | "compliance"
  | "data_quality"
  | "fcn"
  | "market"
  | "opening"
  | "portfolio"
  | "risk"
  | "timeline"
  | "watchlist";

export interface WorkspaceMorningBriefSection {
  dataQuality: WorkspaceIntelligenceDataQuality;
  key: WorkspaceMorningBriefSectionKey;
  severity: WorkspaceIntelligenceSeverity;
  source: string;
  summary: string;
  title: string;
}

export interface WorkspaceMorningBrief {
  date: string;
  generatedAt: string;
  highlights: string[];
  informationalOnlyDisclaimer: string;
  sections: WorkspaceMorningBriefSection[];
  sourceStatus: WorkspaceIntelligenceDataQuality;
  status: WorkspaceMorningBriefStatus;
  title: string;
  warnings: string[];
}
