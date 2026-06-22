import type {
  WorkspaceGraph,
  WorkspaceGraphSummary,
  WorkspaceGraphWarning,
} from "@/src/lib/workspace/graph/workspace-graph-types";

const GRAPH_MODULE_KEYS = [
  "portfolioPersistence",
  "portfolioTruth",
  "valuation",
  "risk",
  "fcnRisk",
  "fcnSchedule",
  "watchlist",
  "alerts",
  "intelligence",
  "dailyBrief",
  "marketStatus",
] as const;

export function buildWorkspaceGraphSummary(
  graph: WorkspaceGraph,
): WorkspaceGraphSummary {
  const availableModules = GRAPH_MODULE_KEYS.filter((key) => Boolean(graph[key])).length;
  const moduleCount = GRAPH_MODULE_KEYS.length;

  return {
    availableModules,
    generatedAt: graph.generatedAt,
    moduleCount,
    sourceStatus: graph.sourceStatus,
    unavailableModules: moduleCount - availableModules,
    warningCount: graph.warnings.length,
  };
}

export function inferWorkspaceGraphStatus(input: {
  moduleCount: number;
  warnings: WorkspaceGraphWarning[];
}): WorkspaceGraph["sourceStatus"] {
  if (input.moduleCount === 0) {
    return "unavailable";
  }

  if (input.warnings.length > 0) {
    return "partial";
  }

  return "healthy";
}
