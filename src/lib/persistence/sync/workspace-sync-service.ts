"use client";

import { getPortfolioPersistenceReadiness } from "@/src/lib/persistence/portfolio";
import { loadPortfolioTruthReadback } from "@/src/lib/portfolio/truth/portfolio-truth-client";
import { getWorkspaceGraphSummary } from "@/src/lib/workspace/graph";
import type {
  WorkspaceSyncReport,
  WorkspaceSyncStatus,
} from "@/src/lib/persistence/sync/workspace-sync-types";

export async function getWorkspaceSyncReport(): Promise<WorkspaceSyncReport> {
  try {
    const [persistence, truth, graph] = await Promise.all([
      getPortfolioPersistenceReadiness(),
      loadPortfolioTruthReadback(),
      getWorkspaceGraphSummary(),
    ]);
    const sources = [
      {
        source: "persistent_foundation" as const,
        status: persistence.sourceStatus === "persisted" ? "ready" as const : "partial" as const,
        target: "portfolio" as const,
      },
      {
        source: "local_fallback" as const,
        status: persistence.hasLocalFallback ? "ready" as const : "unavailable" as const,
        target: "portfolio" as const,
      },
      {
        source: "truth_layer" as const,
        status: truth.readinessLevel === "ready" ? "ready" as const : "partial" as const,
        target: "workspace" as const,
      },
      {
        source: "workspace_graph" as const,
        status: graph.sourceStatus === "healthy" ? "ready" as const : "partial" as const,
        target: "workspace" as const,
      },
    ];
    const sourceStatus: WorkspaceSyncStatus = sources.every((item) => item.status === "ready")
      ? "ready"
      : sources.some((item) => item.status !== "unavailable")
        ? "partial"
        : "unavailable";

    return {
      generatedAt: new Date().toISOString(),
      sourceStatus,
      sources,
      summary:
        "Workspace Sync foundation compares persistent readiness, local fallback availability, Truth Layer readiness, and Workspace Graph readiness. No background sync job or write operation is implemented.",
      warnings: [
        ...persistence.warnings.map((message) => ({
          message,
          source: "persistent_foundation" as const,
        })),
        ...truth.missingDataWarnings.map((message) => ({
          message,
          source: "truth_layer" as const,
        })),
      ],
    };
  } catch {
    return {
      generatedAt: new Date().toISOString(),
      sourceStatus: "unavailable",
      sources: [],
      summary: "Workspace Sync report is unavailable.",
      warnings: [
        {
          message: "Workspace Sync readiness failed safely.",
          source: "workspace_graph",
        },
      ],
    };
  }
}

export async function getWorkspaceSyncReadiness() {
  return getWorkspaceSyncReport();
}
