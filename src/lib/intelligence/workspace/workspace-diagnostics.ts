import type { EditorialProviderDiagnostics } from "@/src/lib/editorial/providers";
import type {
  AssetDiagnostics,
} from "@/src/lib/intelligence/assets";
import type { MonitoringDiagnostics } from "@/src/lib/intelligence/monitoring";
import type { NotificationDiagnostics } from "@/src/lib/intelligence/notifications";
import { buildWorkspaceReadiness } from "@/src/lib/intelligence/workspace/workspace-readiness";
import type {
  WorkspaceDiagnostics,
  WorkspaceEditorialSummary,
  WorkspaceProviderSummary,
} from "@/src/lib/intelligence/workspace/workspace-types";

export function buildWorkspaceProviderSummary(
  providerDiagnostics?: EditorialProviderDiagnostics | null,
): WorkspaceProviderSummary {
  if (!providerDiagnostics) {
    return {
      fallbackLevel: "unknown",
      providerCount: 0,
      qualityScore: 0,
      readiness: "unknown",
      sourceStatus: "unknown",
    };
  }

  return {
    fallbackLevel: providerDiagnostics.fallbackLevel,
    providerCount: providerDiagnostics.registeredProviders,
    qualityScore: providerDiagnostics.quality.overall,
    readiness: providerDiagnostics.publicationReadiness,
    sourceStatus: providerDiagnostics.sourceStatus,
  };
}

export function buildWorkspaceEditorialSummary(
  providerDiagnostics?: EditorialProviderDiagnostics | null,
): WorkspaceEditorialSummary {
  if (!providerDiagnostics) {
    return {
      coverageScore: 0,
      qualityScore: 0,
      summary: "Editorial provider diagnostics are not connected to this Workspace summary yet.",
    };
  }

  return {
    coverageScore: providerDiagnostics.coverage.overall,
    qualityScore: providerDiagnostics.quality.overall,
    summary: `Editorial source status is ${providerDiagnostics.sourceStatus}; publication readiness is ${providerDiagnostics.publicationReadiness}.`,
  };
}

export function buildWorkspaceDiagnostics(input: {
  assetDiagnostics: AssetDiagnostics;
  monitoringDiagnostics: MonitoringDiagnostics;
  notificationDiagnostics: NotificationDiagnostics;
  providerDiagnostics?: EditorialProviderDiagnostics | null;
}): WorkspaceDiagnostics {
  const providerSummary = buildWorkspaceProviderSummary(input.providerDiagnostics);
  const editorialSummary = buildWorkspaceEditorialSummary(input.providerDiagnostics);
  const base = {
    assetDiagnostics: input.assetDiagnostics,
    editorialDiagnostics: editorialSummary,
    monitoringDiagnostics: input.monitoringDiagnostics,
    notificationDiagnostics: input.notificationDiagnostics,
    providerDiagnostics: providerSummary,
  };

  return {
    ...base,
    workspaceReadiness: buildWorkspaceReadiness(base),
  };
}
