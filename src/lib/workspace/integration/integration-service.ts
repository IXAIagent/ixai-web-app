import { buildWorkspaceIntegrationAudit } from "@/src/lib/workspace/integration/integration-audit";
import type { WorkspaceIntegrationAudit } from "@/src/lib/workspace/integration/integration-types";

export function getWorkspaceIntegrationAudit(): WorkspaceIntegrationAudit {
  try {
    return buildWorkspaceIntegrationAudit();
  } catch (error) {
    return {
      brokenModules: 1,
      generatedAt: new Date().toISOString(),
      healthyModules: 0,
      issues: [
        {
          message:
            error instanceof Error
              ? error.message
              : "Workspace integration audit failed before producing diagnostics.",
          module: "Workspace Integration Audit",
          severity: "critical",
        },
      ],
      lineageNodes: [
        {
          id: "workspace-integration-audit",
          name: "Workspace Integration Audit",
          source: "Static service-level audit",
          status: "broken",
          target: "Settings diagnostics",
        },
      ],
      moduleCount: 1,
      overallStatus: "broken",
      warningModules: 0,
    };
  }
}
