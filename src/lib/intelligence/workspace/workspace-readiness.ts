import type {
  WorkspaceDiagnostics,
  WorkspaceReadiness,
} from "@/src/lib/intelligence/workspace/workspace-types";

export function buildWorkspaceReadiness(input: Omit<WorkspaceDiagnostics, "workspaceReadiness">): WorkspaceReadiness {
  const blockingIssues: string[] = [];
  const warningIssues: string[] = [];

  if (input.assetDiagnostics.offlineAssets > 0) {
    blockingIssues.push(`${input.assetDiagnostics.offlineAssets} asset(s) are offline.`);
  }
  blockingIssues.push(...input.monitoringDiagnostics.blockingIssues);
  blockingIssues.push(...input.notificationDiagnostics.blockingIssues);

  if (input.providerDiagnostics.readiness === "unavailable") {
    blockingIssues.push("Provider readiness is unavailable.");
  }

  warningIssues.push(...input.monitoringDiagnostics.warningIssues);
  warningIssues.push(...input.notificationDiagnostics.warningIssues);

  if (input.assetDiagnostics.warningAssets > 0) {
    warningIssues.push(`${input.assetDiagnostics.warningAssets} asset(s) have degraded intelligence coverage.`);
  }

  if (input.editorialDiagnostics.coverageScore < 0.5) {
    warningIssues.push("Editorial coverage is partial.");
  }

  if (blockingIssues.length > 0) {
    return {
      blockingIssues,
      level: "red",
      nextActions: [
        "Review offline assets, monitoring blockers, and provider readiness before enabling UI or delivery.",
      ],
      warningIssues,
    };
  }

  if (warningIssues.length > 0) {
    return {
      blockingIssues,
      level: "yellow",
      nextActions: [
        "Use read-only previews and resolve warning issues before connecting Workspace surfaces.",
      ],
      warningIssues,
    };
  }

  return {
    blockingIssues,
    level: "green",
    nextActions: [
      "Workspace Intelligence aggregation is ready for future read-only preview integration.",
    ],
    warningIssues,
  };
}
