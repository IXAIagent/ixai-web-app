"use client";

import { buildWorkspaceCopilotSummary } from "@/src/lib/copilot/copilot-engine";
import type { WorkspaceCopilotSummary } from "@/src/lib/copilot/copilot-types";
import { getWorkspaceGraph } from "@/src/lib/workspace/graph";

export async function getWorkspaceCopilotSummary(): Promise<WorkspaceCopilotSummary> {
  try {
    return buildWorkspaceCopilotSummary(await getWorkspaceGraph());
  } catch {
    return {
      capabilityCount: 1,
      explanations: [
        {
          capability: "explain_data_quality",
          id: "copilot-unavailable",
          sourceEngine: "workspace_graph",
          summary:
            "Workspace Graph is unavailable, so Copilot can only explain that source readback is currently limited.",
          title: "Explain unavailable readback",
        },
      ],
      generatedAt: new Date().toISOString(),
      informationalOnlyDisclaimer:
        "Workspace Copilot is rule-based and explain-only. It does not call AI models and does not provide buy, sell, hold, target price, or order instructions.",
      mode: "rule_based_explain_only",
    };
  }
}
