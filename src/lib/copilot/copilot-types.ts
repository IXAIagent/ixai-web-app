export type WorkspaceCopilotCapability =
  | "explain_alerts"
  | "explain_data_quality"
  | "explain_fcn"
  | "explain_portfolio"
  | "explain_risk"
  | "explain_schedule";

export interface WorkspaceCopilotExplanation {
  capability: WorkspaceCopilotCapability;
  id: string;
  sourceEngine: string;
  summary: string;
  title: string;
}

export interface WorkspaceCopilotSummary {
  capabilityCount: number;
  explanations: WorkspaceCopilotExplanation[];
  generatedAt: string;
  informationalOnlyDisclaimer: string;
  mode: "rule_based_explain_only";
}
