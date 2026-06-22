export interface WorkspaceHealthDimension {
  key:
    | "dataQualityHealth"
    | "fcnHealth"
    | "intelligenceHealth"
    | "marketHealth"
    | "portfolioHealth"
    | "riskHealth"
    | "scheduleHealth";
  score: number;
  summary: string;
}

export interface WorkspaceHealthScore {
  dataQualityHealth: number;
  fcnHealth: number;
  generatedAt: string;
  informationalOnlyDisclaimer: string;
  intelligenceHealth: number;
  marketHealth: number;
  overallHealth: number;
  portfolioHealth: number;
  riskHealth: number;
  scheduleHealth: number;
  summaries: WorkspaceHealthDimension[];
  warnings: string[];
}
