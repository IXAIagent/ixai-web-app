"use client";

import { getWorkspaceGraph, getWorkspaceGraphSummary } from "@/src/lib/workspace/graph";
import { getWorkspaceHealthScore } from "@/src/lib/workspace/health";
import { getWorkspaceDatabaseActivationReport } from "@/src/lib/persistence/sync";
import { getDatabaseMigrationHealthReport } from "@/src/lib/persistence/migrations";
import { getWorkspaceDailyBrief } from "@/src/lib/daily-brief";
import { getWorkspaceIntelligenceReport } from "@/src/lib/intelligence/engine/intelligence-service";
import { getWorkspaceNotificationSummary } from "@/src/lib/notifications";
import { getWorkspaceTimelineSummary } from "@/src/lib/workspace/timeline";
import type {
  WorkspaceApiEndpoint,
  WorkspaceApiReadback,
} from "@/src/lib/workspace/api/workspace-api-types";

async function readEndpoint<TData>(
  endpoint: WorkspaceApiEndpoint,
  read: () => Promise<TData>,
): Promise<WorkspaceApiReadback<TData>> {
  try {
    return {
      data: await read(),
      endpoint,
      generatedAt: new Date().toISOString(),
      ok: true,
    };
  } catch {
    return {
      data: null,
      endpoint,
      generatedAt: new Date().toISOString(),
      ok: false,
      warning: `${endpoint} readback failed in Workspace API Gateway service layer.`,
    };
  }
}

export async function readWorkspaceGraph() {
  return readEndpoint("graph", getWorkspaceGraph);
}

export async function readWorkspaceGraphSummary() {
  return readEndpoint("graph", getWorkspaceGraphSummary);
}

export async function readWorkspaceHealth() {
  return readEndpoint("health", getWorkspaceHealthScore);
}

export async function readWorkspaceTimeline() {
  return readEndpoint("timeline", getWorkspaceTimelineSummary);
}

export async function readWorkspaceNotifications() {
  return readEndpoint("notifications", getWorkspaceNotificationSummary);
}

export async function readWorkspaceIntelligence() {
  return readEndpoint("intelligence", getWorkspaceIntelligenceReport);
}

export async function readWorkspaceDailyBrief() {
  return readEndpoint("daily-brief", getWorkspaceDailyBrief);
}

export async function readWorkspaceDatabaseActivation() {
  return readEndpoint("graph", getWorkspaceDatabaseActivationReport);
}

export async function readWorkspaceMigrationHealth() {
  return readEndpoint("migration-health", getDatabaseMigrationHealthReport);
}
