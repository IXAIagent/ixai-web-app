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
import type { AlertPersistenceReadiness } from "@/src/lib/alerts/persistence";
import type { FcnPersistenceReadiness } from "@/src/lib/persistence/fcn";
import type { PortfolioPersistenceReadiness } from "@/src/lib/persistence/portfolio";
import type { WorkspaceOwnershipCheck } from "@/src/lib/persistence/ownership";
import type { WorkspaceSyncReport } from "@/src/lib/persistence/sync";
import type { WorkspaceDatabaseActivationReport } from "@/src/lib/persistence/sync/workspace-sync-activation-types";
import type { WorkspaceSyncPlan } from "@/src/lib/persistence/sync/workspace-sync-plan-types";
import type { MigrationHealthReport } from "@/src/lib/persistence/migrations";
import type { WorkspaceDatabaseReadPriorityStatus } from "@/src/lib/workspace/database-read-priority-status";
import type { WatchlistPersistenceReadiness } from "@/src/lib/watchlist/persistence";

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
  alertPersistenceReadiness?: AlertPersistenceReadiness | null;
  databaseActivation?: WorkspaceDatabaseActivationReport | null;
  databaseReadPriority?: WorkspaceDatabaseReadPriorityStatus | null;
  livePersistence?: {
    alerts?: string;
    fcn?: string;
    portfolio?: string;
    watchlist?: string;
  } | null;
  migrationHealth?: MigrationHealthReport | null;
  dailyBrief: WorkspaceDailyBrief | null;
  fcnRisk: FcnPortfolioRiskSummary | null;
  fcnSchedule: FcnPortfolioScheduleSummary | null;
  fcnPersistenceReadiness?: FcnPersistenceReadiness | null;
  generatedAt: string;
  intelligence: WorkspaceIntelligenceReport | null;
  marketStatus?: MarketServiceReadiness | null;
  ownershipReadiness?: WorkspaceOwnershipCheck | null;
  portfolioPersistence: PortfolioPersistenceResult | null;
  persistenceReadiness?: PortfolioPersistenceReadiness | null;
  portfolioTruth: PortfolioTruthReadback | null;
  risk: PortfolioRiskResult | null;
  sourceStatus: WorkspaceGraphSourceStatus;
  syncReadiness?: WorkspaceSyncReport | null;
  syncPlan?: WorkspaceSyncPlan | null;
  tableReadiness?: WorkspaceDatabaseActivationReport | null;
  valuation: PortfolioValuationResult | null;
  warnings: WorkspaceGraphWarning[];
  watchlist: WorkspaceWatchlistSummary | null;
  watchlistPersistenceReadiness?: WatchlistPersistenceReadiness | null;
}

export interface WorkspaceGraphSummary {
  availableModules: number;
  generatedAt: string;
  moduleCount: number;
  sourceStatus: WorkspaceGraphSourceStatus;
  unavailableModules: number;
  warningCount: number;
}
