"use client";

import { getWorkspaceGraph } from "@/src/lib/workspace/graph";
import { buildWorkspaceHealthScore } from "@/src/lib/workspace/health/workspace-health-engine";
import type { WorkspaceHealthScore } from "@/src/lib/workspace/health/workspace-health-types";

export async function getWorkspaceHealthScore(): Promise<WorkspaceHealthScore> {
  try {
    return buildWorkspaceHealthScore(await getWorkspaceGraph());
  } catch {
    return buildWorkspaceHealthScore({
      alerts: null,
      dailyBrief: null,
      fcnRisk: null,
      fcnSchedule: null,
      generatedAt: new Date().toISOString(),
      intelligence: null,
      marketStatus: null,
      portfolioPersistence: null,
      portfolioTruth: null,
      risk: null,
      sourceStatus: "unavailable",
      valuation: null,
      warnings: [{ message: "Workspace graph unavailable.", module: "Workspace Health" }],
      watchlist: null,
    });
  }
}
