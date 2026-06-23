import type { WorkspaceGraph } from "@/src/lib/workspace/graph";
import type {
  WorkspaceInsightCard,
  WorkspaceInsightsSummary,
} from "@/src/lib/insights/insight-types";

function insight(input: WorkspaceInsightCard): WorkspaceInsightCard {
  return input;
}

export function buildWorkspaceInsights(graph: WorkspaceGraph): WorkspaceInsightsSummary {
  const insights: WorkspaceInsightCard[] = [];

  if (graph.sourceStatus !== "healthy") {
    insights.push(
      insight({
        category: "data_quality",
        id: "workspace-graph-partial",
        message: `${graph.warnings.length} Workspace module warning(s) are present. Review Settings diagnostics before relying on complete readback.`,
        severity: graph.sourceStatus === "unavailable" ? "critical" : "warning",
        sourceEngine: "workspace_graph",
        title: "Workspace graph is not fully healthy",
      }),
    );
  }

  const riskSummary = graph.risk?.summary;
  if ((riskSummary?.criticalSignalCount ?? 0) > 0 || (riskSummary?.highSignalCount ?? 0) > 0) {
    insights.push(
      insight({
        category: "risk",
        id: "risk-signals-present",
        message: `${riskSummary?.criticalSignalCount ?? 0} critical and ${riskSummary?.highSignalCount ?? 0} high risk signal(s) are visible in Risk Center.`,
        severity: (riskSummary?.criticalSignalCount ?? 0) > 0 ? "critical" : "high",
        sourceEngine: "risk_engine",
        title: "Risk Center has elevated signals",
      }),
    );
  }

  if ((graph.fcnRisk?.criticalRiskCount ?? 0) > 0 || (graph.fcnRisk?.highRiskCount ?? 0) > 0) {
    insights.push(
      insight({
        category: "fcn",
        id: "fcn-risk-present",
        message: `${graph.fcnRisk?.criticalRiskCount ?? 0} critical and ${graph.fcnRisk?.highRiskCount ?? 0} high FCN risk position(s) are visible.`,
        severity: (graph.fcnRisk?.criticalRiskCount ?? 0) > 0 ? "critical" : "high",
        sourceEngine: "fcn_risk",
        title: "FCN risk needs review",
      }),
    );
  }

  if ((graph.fcnSchedule?.dueSoonEventCount ?? 0) > 0 || (graph.fcnSchedule?.overdueEventCount ?? 0) > 0) {
    insights.push(
      insight({
        category: "schedule",
        id: "fcn-schedule-due",
        message: `${graph.fcnSchedule?.dueSoonEventCount ?? 0} due-soon and ${graph.fcnSchedule?.overdueEventCount ?? 0} overdue FCN schedule event(s) are visible.`,
        severity: (graph.fcnSchedule?.overdueEventCount ?? 0) > 0 ? "warning" : "info",
        sourceEngine: "fcn_schedule",
        title: "FCN schedule has upcoming events",
      }),
    );
  }

  if ((graph.watchlist?.unquotedItemCount ?? 0) > 0) {
    insights.push(
      insight({
        category: "market",
        id: "watchlist-unquoted",
        message: `${graph.watchlist?.unquotedItemCount ?? 0} watchlist item(s) do not currently have quote readback.`,
        severity: "warning",
        sourceEngine: "watchlist",
        title: "Market readback is partial",
      }),
    );
  }

  if (insights.length === 0) {
    insights.push(
      insight({
        category: "system",
        id: "workspace-stable",
        message:
          "No elevated Workspace insight is currently generated from the available rule-based engines.",
        severity: "info",
        sourceEngine: "workspace_graph",
        title: "Workspace readback is stable",
      }),
    );
  }

  return {
    criticalCount: insights.filter((item) => item.severity === "critical").length,
    generatedAt: new Date().toISOString(),
    highCount: insights.filter((item) => item.severity === "high").length,
    informationalOnlyDisclaimer:
      "Workspace Insights are deterministic readback summaries only. They are not investment recommendations.",
    insightCount: insights.length,
    insights,
    warningCount: insights.filter((item) => item.severity === "warning").length,
  };
}
