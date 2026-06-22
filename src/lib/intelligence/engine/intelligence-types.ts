export type WorkspaceIntelligenceCategory =
  | "fcn"
  | "portfolio"
  | "risk"
  | "schedule";

export type WorkspaceIntelligenceSeverity = "critical" | "info" | "warning";

export type WorkspaceIntelligenceSourceEngine =
  | "fcn_risk"
  | "fcn_schedule"
  | "market_cache"
  | "market_service"
  | "portfolio_truth"
  | "portfolio_valuation"
  | "risk_engine";

export interface WorkspaceIntelligenceCard {
  category: WorkspaceIntelligenceCategory;
  id: string;
  severity: WorkspaceIntelligenceSeverity;
  sourceEngine: WorkspaceIntelligenceSourceEngine;
  summary: string;
  title: string;
}

export interface WorkspaceIntelligenceEngineInput {
  fcnRisk: import("@/src/lib/fcn/risk/fcn-risk-types").FcnPortfolioRiskSummary;
  fcnSchedule: import("@/src/lib/fcn/schedule").FcnPortfolioScheduleSummary;
  portfolioRisk: import("@/src/lib/risk/risk-engine-types").PortfolioRiskResult;
  portfolioValuation: import("@/src/lib/portfolio/valuation/portfolio-valuation-types").PortfolioValuationResult;
  truth: import("@/src/lib/portfolio/truth/portfolio-truth-types").PortfolioTruthReadback | null;
}

export interface WorkspaceIntelligenceReport {
  cardCount: number;
  cards: WorkspaceIntelligenceCard[];
  criticalCount: number;
  generatedAt: string;
  infoCount: number;
  sourceEngines: WorkspaceIntelligenceSourceEngine[];
  warningCount: number;
}
