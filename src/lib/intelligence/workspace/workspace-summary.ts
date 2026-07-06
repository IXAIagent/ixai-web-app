import type { AssetSummary } from "@/src/lib/intelligence/assets";
import type { MonitoringDiagnostics } from "@/src/lib/intelligence/monitoring";
import type {
  WorkspaceDiagnostics,
  WorkspaceEditorialSummary,
  WorkspaceIntelligenceHealth,
  WorkspaceMonitoringSummary,
  WorkspaceNotificationSummary,
  WorkspaceProviderSummary,
  WorkspaceSummary,
} from "@/src/lib/intelligence/workspace/workspace-types";

function healthFromDiagnostics(diagnostics: WorkspaceDiagnostics): WorkspaceIntelligenceHealth {
  if (
    diagnostics.workspaceReadiness.level === "red" ||
    diagnostics.assetDiagnostics.offlineAssets > 0 ||
    diagnostics.monitoringDiagnostics.criticalCount > 0
  ) {
    return "offline";
  }

  if (
    diagnostics.workspaceReadiness.level === "yellow" ||
    diagnostics.assetDiagnostics.warningAssets > 0 ||
    diagnostics.monitoringDiagnostics.warningCount > 0
  ) {
    return "degraded";
  }

  return "healthy";
}

export function buildWorkspaceMonitoringSummary(
  diagnostics: MonitoringDiagnostics,
): WorkspaceMonitoringSummary {
  return {
    critical: diagnostics.criticalCount,
    events: diagnostics.eventCount,
    info: diagnostics.infoCount,
    readiness: diagnostics.readiness,
    warning: diagnostics.warningCount,
  };
}

export function buildWorkspaceSummary(input: {
  assetSummary: AssetSummary;
  diagnostics: WorkspaceDiagnostics;
  editorialSummary: WorkspaceEditorialSummary;
  generatedAt: string;
  notificationSummary: WorkspaceNotificationSummary;
  providerSummary: WorkspaceProviderSummary;
}): WorkspaceSummary {
  const coverage = Math.round(
    ((input.assetSummary.coverageSummary.score + input.editorialSummary.coverageScore) / 2) * 100,
  ) / 100;
  const quality = Math.round(
    ((input.assetSummary.qualitySummary.score + input.editorialSummary.qualityScore) / 2) * 100,
  ) / 100;

  return {
    assetSummary: input.assetSummary,
    coverage,
    editorialSummary: input.editorialSummary,
    lastUpdated: input.generatedAt,
    monitoringSummary: buildWorkspaceMonitoringSummary(input.diagnostics.monitoringDiagnostics),
    notificationSummary: input.notificationSummary,
    overallHealth: healthFromDiagnostics(input.diagnostics),
    overallReadiness: input.diagnostics.workspaceReadiness,
    providerSummary: input.providerSummary,
    quality,
  };
}
