"use client";

import { buildWorkspaceInsights } from "@/src/lib/insights/insight-engine";
import type { WorkspaceInsightsSummary } from "@/src/lib/insights/insight-types";
import { getWorkspaceGraph } from "@/src/lib/workspace/graph";

export async function getWorkspaceInsightsSummary(): Promise<WorkspaceInsightsSummary> {
  try {
    return buildWorkspaceInsights(await getWorkspaceGraph());
  } catch {
    return {
      criticalCount: 0,
      generatedAt: new Date().toISOString(),
      highCount: 0,
      informationalOnlyDisclaimer:
        "Workspace Insights are deterministic readback summaries only. They are not investment recommendations.",
      insightCount: 1,
      insights: [
        {
          category: "system",
          id: "insights-unavailable",
          message: "Workspace Insights cannot read the current graph, but the app remains available.",
          severity: "warning",
          sourceEngine: "workspace_graph",
          title: "Insights readback unavailable",
        },
      ],
      warningCount: 1,
    };
  }
}
