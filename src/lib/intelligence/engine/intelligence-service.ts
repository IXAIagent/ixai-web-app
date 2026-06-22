"use client";

import { getWorkspaceFcnRiskSummary } from "@/src/lib/fcn/risk/fcn-risk-service";
import { getWorkspaceFcnScheduleSummary } from "@/src/lib/fcn/schedule";
import { buildWorkspaceIntelligenceReport } from "@/src/lib/intelligence/engine/intelligence-engine";
import type { WorkspaceIntelligenceReport } from "@/src/lib/intelligence/engine/intelligence-types";
import { loadPortfolioTruthReadback } from "@/src/lib/portfolio/truth/portfolio-truth-client";
import { getWorkspacePortfolioValuation } from "@/src/lib/portfolio/valuation/portfolio-valuation-service";
import { getWorkspacePortfolioRiskSummary } from "@/src/lib/risk/risk-service";

export function buildEmptyWorkspaceIntelligenceReport(): WorkspaceIntelligenceReport {
  return {
    cardCount: 0,
    cards: [],
    criticalCount: 0,
    generatedAt: new Date().toISOString(),
    infoCount: 0,
    sourceEngines: [],
    warningCount: 0,
  };
}

export async function getWorkspaceIntelligenceReport(): Promise<WorkspaceIntelligenceReport> {
  try {
    const [truth, portfolioValuation, portfolioRisk, fcnRisk, fcnSchedule] =
      await Promise.all([
        loadPortfolioTruthReadback(),
        getWorkspacePortfolioValuation(),
        getWorkspacePortfolioRiskSummary(),
        getWorkspaceFcnRiskSummary(),
        getWorkspaceFcnScheduleSummary(),
      ]);

    return buildWorkspaceIntelligenceReport({
      fcnRisk,
      fcnSchedule,
      portfolioRisk,
      portfolioValuation,
      truth,
    });
  } catch {
    return buildEmptyWorkspaceIntelligenceReport();
  }
}
