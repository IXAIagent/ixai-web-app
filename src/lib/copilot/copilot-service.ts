"use client";

import { buildWorkspaceCopilotSummary } from "@/src/lib/copilot/copilot-engine";
import type { WorkspaceCopilotSummary } from "@/src/lib/copilot/copilot-types";
import { getWorkspaceGraph } from "@/src/lib/workspace/graph";
import { getWorkspaceIntelligenceReportV14 } from "@/src/lib/workspace/intelligence";
import { getWorkspaceMorningBriefV14 } from "@/src/lib/workspace/morning-brief";

export async function getWorkspaceCopilotSummary(): Promise<WorkspaceCopilotSummary> {
  try {
    const [graphResult, intelligenceResult, briefResult] = await Promise.allSettled([
      getWorkspaceGraph(),
      getWorkspaceIntelligenceReportV14(),
      getWorkspaceMorningBriefV14(),
    ]);
    const graphSummary =
      graphResult.status === "fulfilled"
        ? buildWorkspaceCopilotSummary(graphResult.value)
        : null;
    const explanations = [...(graphSummary?.explanations ?? [])];

    if (intelligenceResult.status === "fulfilled") {
      explanations.push({
        capability: "explain_data_quality",
        id: "copilot-v14-intelligence",
        sourceEngine: "workspace_intelligence_engine",
        summary: `V14 Workspace Intelligence has ${intelligenceResult.value.cardCount} card(s), readiness ${intelligenceResult.value.readinessStatus}, and source quality ${intelligenceResult.value.sourceStatus}.`,
        title: "Explain Workspace Intelligence",
      });
    }

    if (briefResult.status === "fulfilled") {
      explanations.push({
        capability: "explain_morning_brief",
        id: "copilot-v14-morning-brief",
        sourceEngine: "workspace_morning_brief",
        summary: `Current Morning Brief status is ${briefResult.value.status}, with ${briefResult.value.sections.length} section(s) and ${briefResult.value.warnings.length} warning(s).`,
        title: "Explain Morning Brief",
      });
    }

    return {
      capabilityCount: explanations.length,
      explanations,
      generatedAt: new Date().toISOString(),
      informationalOnlyDisclaimer:
        "Workspace Copilot is rule-based and explain-only. It does not call AI models and does not provide buy, sell, hold, target price, or order instructions.",
      mode: "rule_based_explain_only",
    };
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
