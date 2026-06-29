export type WorkspaceIntelligenceCardType =
  | "alert"
  | "data_quality"
  | "fcn"
  | "market"
  | "portfolio"
  | "readiness"
  | "risk"
  | "timeline"
  | "watchlist";

export type WorkspaceIntelligenceSeverity =
  | "critical"
  | "elevated"
  | "info"
  | "watch";

export type WorkspaceIntelligenceDataQuality =
  | "fallback"
  | "live"
  | "partial"
  | "unavailable";

export type WorkspaceIntelligenceReadinessStatus =
  | "partial"
  | "ready"
  | "unavailable";

export interface WorkspaceIntelligenceCard {
  dataQuality: WorkspaceIntelligenceDataQuality;
  details: string[];
  disclaimer?: string;
  generatedAt: string;
  id: string;
  severity: WorkspaceIntelligenceSeverity;
  source: string;
  summary: string;
  title: string;
  type: WorkspaceIntelligenceCardType;
}

export interface WorkspaceIntelligenceSummaryBlock {
  dataQuality: WorkspaceIntelligenceDataQuality;
  label: string;
  source: string;
  status: WorkspaceIntelligenceReadinessStatus;
  summary: string;
}

export interface WorkspaceIntelligenceReportV14 {
  alertSummary: WorkspaceIntelligenceSummaryBlock;
  cards: WorkspaceIntelligenceCard[];
  cardCount: number;
  criticalCount: number;
  dataQualitySummary: WorkspaceIntelligenceSummaryBlock;
  elevatedCount: number;
  fcnSummary: WorkspaceIntelligenceSummaryBlock;
  generatedAt: string;
  informationalOnlyDisclaimer: string;
  marketSummary: WorkspaceIntelligenceSummaryBlock;
  portfolioSummary: WorkspaceIntelligenceSummaryBlock;
  readinessStatus: WorkspaceIntelligenceReadinessStatus;
  riskSummary: WorkspaceIntelligenceSummaryBlock;
  sourceStatus: WorkspaceIntelligenceDataQuality;
  timelineSummary: WorkspaceIntelligenceSummaryBlock;
  watchCount: number;
  watchlistSummary: WorkspaceIntelligenceSummaryBlock;
}
