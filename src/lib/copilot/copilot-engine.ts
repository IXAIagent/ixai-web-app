import type { WorkspaceGraph } from "@/src/lib/workspace/graph";
import type {
  WorkspaceCopilotExplanation,
  WorkspaceCopilotSummary,
} from "@/src/lib/copilot/copilot-types";

export function buildWorkspaceCopilotSummary(graph: WorkspaceGraph): WorkspaceCopilotSummary {
  const explanations: WorkspaceCopilotExplanation[] = [
    {
      capability: "explain_portfolio",
      id: "copilot-portfolio",
      sourceEngine: "portfolio_truth",
      summary: `Portfolio readback currently has ${graph.portfolioTruth?.counts.totalAssets ?? 0} asset(s) in the truth layer and ${graph.portfolioPersistence?.summary.totalPositions ?? 0} persistence-layer position(s).`,
      title: "Explain portfolio readback",
    },
    {
      capability: "explain_risk",
      id: "copilot-risk",
      sourceEngine: "risk_engine",
      summary: `Risk Engine reports ${graph.risk?.summary.signalCount ?? 0} signal(s), with ${graph.risk?.summary.criticalSignalCount ?? 0} critical signal(s).`,
      title: "Explain risk status",
    },
    {
      capability: "explain_fcn",
      id: "copilot-fcn",
      sourceEngine: "fcn_risk",
      summary: `FCN Risk reports ${graph.fcnRisk?.positionCount ?? 0} FCN position(s), including ${graph.fcnRisk?.criticalRiskCount ?? 0} critical risk position(s).`,
      title: "Explain FCN risk",
    },
    {
      capability: "explain_schedule",
      id: "copilot-schedule",
      sourceEngine: "fcn_schedule",
      summary: `FCN Schedule reports ${graph.fcnSchedule?.upcomingEventCount ?? 0} upcoming event(s), with ${graph.fcnSchedule?.dueSoonEventCount ?? 0} due soon.`,
      title: "Explain schedule",
    },
    {
      capability: "explain_alerts",
      id: "copilot-alerts",
      sourceEngine: "alerts",
      summary: `Alert Engine reports ${graph.alerts?.alertCount ?? 0} alert card(s). Delivery remains disabled in this foundation.`,
      title: "Explain alerts",
    },
    {
      capability: "explain_data_quality",
      id: "copilot-data-quality",
      sourceEngine: "workspace_graph",
      summary: `Workspace Graph status is ${graph.sourceStatus}, with ${graph.warnings.length} warning(s).`,
      title: "Explain data quality",
    },
  ];

  return {
    capabilityCount: explanations.length,
    explanations,
    generatedAt: new Date().toISOString(),
    informationalOnlyDisclaimer:
      "Workspace Copilot is rule-based and explain-only. It does not call AI models and does not provide buy, sell, hold, target price, or order instructions.",
    mode: "rule_based_explain_only",
  };
}
