import {
  getAssetDiagnostics,
  getAssetIntelligence,
  getAssetSummary,
} from "@/src/lib/intelligence/assets";
import {
  getMonitoringEvents,
  getMonitoringDiagnostics,
  getTodayFocus,
} from "@/src/lib/intelligence/monitoring";
import {
  getNotificationDeliveryPreview,
} from "@/src/lib/intelligence/notifications";
import { buildWorkspaceDiagnostics } from "@/src/lib/intelligence/workspace/workspace-diagnostics";
import { buildWorkspaceTodayFocus } from "@/src/lib/intelligence/workspace/workspace-focus";
import { buildWorkspaceNotificationPreview, buildWorkspaceNotificationSummary } from "@/src/lib/intelligence/workspace/workspace-notification-preview";
import { buildWorkspaceRiskSummary } from "@/src/lib/intelligence/workspace/workspace-risk-summary";
import { buildWorkspaceSummary } from "@/src/lib/intelligence/workspace/workspace-summary";
import type {
  WorkspaceDiagnostics,
  WorkspaceFocusItem,
  WorkspaceFoundationBundle,
  WorkspaceIntelligenceInput,
  WorkspaceIntelligenceResult,
  WorkspaceNotificationPreview,
  WorkspaceRiskSummary,
  WorkspaceSummary,
} from "@/src/lib/intelligence/workspace/workspace-types";

function buildFoundation(input: WorkspaceIntelligenceInput = {}): WorkspaceFoundationBundle {
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const assets = input.assets ?? getAssetIntelligence({ ...input, generatedAt });
  const monitoringEvents = input.monitoringEvents ?? getMonitoringEvents({
    ...input,
    assets,
    generatedAt,
    providerDiagnostics: input.providerDiagnostics,
  });
  const notificationPreview = getNotificationDeliveryPreview({
    existingNotifications: input.existingNotifications,
    generatedAt,
    monitoringEvents,
    policy: input.notificationPolicy,
  });

  return {
    assets,
    generatedAt,
    monitoringEvents,
    notificationPreview,
    providerDiagnostics: input.providerDiagnostics ?? null,
  };
}

export function getWorkspaceDiagnostics(input: WorkspaceIntelligenceInput = {}): WorkspaceDiagnostics {
  const foundation = buildFoundation(input);
  const assetDiagnostics = getAssetDiagnostics(foundation.assets);
  const monitoringDiagnostics = getMonitoringDiagnostics({
    ...input,
    assets: foundation.assets,
    generatedAt: foundation.generatedAt,
    providerDiagnostics: foundation.providerDiagnostics,
  });

  return buildWorkspaceDiagnostics({
    assetDiagnostics,
    monitoringDiagnostics,
    notificationDiagnostics: foundation.notificationPreview.diagnostics,
    providerDiagnostics: foundation.providerDiagnostics,
  });
}

export function getWorkspaceSummary(input: WorkspaceIntelligenceInput = {}): WorkspaceSummary {
  const foundation = buildFoundation(input);
  const diagnostics = getWorkspaceDiagnostics({
    ...input,
    assets: foundation.assets,
    generatedAt: foundation.generatedAt,
    monitoringEvents: foundation.monitoringEvents,
  });

  return buildWorkspaceSummary({
    assetSummary: getAssetSummary(foundation.assets),
    diagnostics,
    editorialSummary: diagnostics.editorialDiagnostics,
    generatedAt: foundation.generatedAt,
    notificationSummary: buildWorkspaceNotificationSummary(foundation.notificationPreview),
    providerSummary: diagnostics.providerDiagnostics,
  });
}

export function getWorkspaceTodayFocus(input: WorkspaceIntelligenceInput = {}): WorkspaceFocusItem[] {
  const foundation = buildFoundation(input);
  return buildWorkspaceTodayFocus(
    foundation.monitoringEvents,
    getTodayFocus({
      ...input,
      assets: foundation.assets,
      generatedAt: foundation.generatedAt,
      providerDiagnostics: foundation.providerDiagnostics,
    }),
  );
}

export function getWorkspaceRiskSummary(input: WorkspaceIntelligenceInput = {}): WorkspaceRiskSummary {
  const foundation = buildFoundation(input);
  return buildWorkspaceRiskSummary({
    assets: foundation.assets,
    monitoringEvents: foundation.monitoringEvents,
  });
}

export function getWorkspaceNotificationPreview(input: WorkspaceIntelligenceInput = {}): WorkspaceNotificationPreview {
  return buildWorkspaceNotificationPreview(buildFoundation(input).notificationPreview);
}

export function getWorkspaceIntelligence(input: WorkspaceIntelligenceInput = {}): WorkspaceIntelligenceResult {
  return {
    diagnostics: getWorkspaceDiagnostics(input),
    notificationPreview: getWorkspaceNotificationPreview(input),
    riskSummary: getWorkspaceRiskSummary(input),
    summary: getWorkspaceSummary(input),
    todayFocus: getWorkspaceTodayFocus(input),
  };
}
