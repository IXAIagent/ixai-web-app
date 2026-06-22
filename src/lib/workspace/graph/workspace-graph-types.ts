import type { WorkspaceAlertSummary } from "@/src/lib/alerts";
import type { WorkspaceDailyBrief } from "@/src/lib/daily-brief";
import type { FcnPortfolioRiskSummary } from "@/src/lib/fcn/risk/fcn-risk-types";
import type { FcnPortfolioScheduleSummary } from "@/src/lib/fcn/schedule";
import type { WorkspaceIntelligenceReport } from "@/src/lib/intelligence/engine/intelligence-types";
import type { MarketServiceReadiness } from "@/src/lib/market/market-service";
import type { PortfolioPersistenceResult } from "@/src/lib/portfolio/persistence";
import type { PortfolioTruthReadback } from "@/src/lib/portfolio/truth/portfolio-truth-types";
import type { PortfolioValuationResult } from "@/src/lib/portfolio/valuation/portfolio-valuation-types";
import type { PortfolioRiskResult } from "@/src/lib/risk/risk-engine-types";
import type { WorkspaceWatchlistSummary } from "@/src/lib/watchlist/watchlist-types";

export type WorkspaceGraphSourceStatus =
  | "healthy"
  | "partial"
  | "unavailable";

export interface WorkspaceGraphWarning {
  message: string;
  module: string;
}

export interface WorkspaceGraph {
  alerts: WorkspaceAlertSummary | null;
  dailyBrief: WorkspaceDailyBrief | null;
  fcnRisk: FcnPortfolioRiskSummary | null;
  fcnSchedule: FcnPortfolioScheduleSummary | null;
  generatedAt: string;
  intelligence: WorkspaceIntelligenceReport | null;
  marketStatus?: MarketServiceReadiness | null;
  portfolioPersistence: PortfolioPersistenceResult | null;
  portfolioTruth: PortfolioTruthReadback | null;
  risk: PortfolioRiskResult | null;
  sourceStatus: WorkspaceGraphSourceStatus;
  valuation: PortfolioValuationResult | null;
  warnings: WorkspaceGraphWarning[];
  watchlist: WorkspaceWatchlistSummary | null;
}

export interface WorkspaceGraphSummary {
  availableModules: number;
  generatedAt: string;
  moduleCount: number;
  sourceStatus: WorkspaceGraphSourceStatus;
  unavailableModules: number;
  warningCount: number;
}
