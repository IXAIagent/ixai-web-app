export type WorkspaceIntegrationStatus = "broken" | "healthy" | "warning";

export type WorkspaceIntegrationIssueSeverity = "critical" | "info" | "warning";

export interface WorkspaceDataLineageNode {
  id: string;
  name: string;
  source: string;
  status: WorkspaceIntegrationStatus;
  target: string;
}

export interface WorkspaceIntegrationIssue {
  message: string;
  module: string;
  severity: WorkspaceIntegrationIssueSeverity;
}

export interface WorkspaceIntegrationAudit {
  brokenModules: number;
  generatedAt: string;
  healthyModules: number;
  issues: WorkspaceIntegrationIssue[];
  lineageNodes: WorkspaceDataLineageNode[];
  moduleCount: number;
  overallStatus: WorkspaceIntegrationStatus;
  warningModules: number;
}
