import type { WorkspaceAlertSummary } from "@/src/lib/alerts";
import type { WorkspaceDailyBrief } from "@/src/lib/daily-brief";
import type { FcnPortfolioRiskSummary } from "@/src/lib/fcn/risk/fcn-risk-types";
import type { FcnPortfolioScheduleSummary } from "@/src/lib/fcn/schedule";
import type { WorkspaceIntelligenceReport } from "@/src/lib/intelligence/engine/intelligence-types";
import type { ClientSafeMarketReadiness } from "@/src/lib/market/client-safe-market-readiness";
import type { MorningSnapshot } from "@/src/lib/morning-brief";
import type { MarketDataSnapshot } from "@/src/lib/market-data";
import type { IntelligenceV2Report } from "@/src/lib/intelligence/v2";
import type { SaasFoundationReadiness } from "@/src/lib/saas-foundation";
import type { LiveProviderReadinessReport } from "@/src/lib/market-data/live-provider-readiness";
import type { PortfolioValuationSnapshotModel } from "@/src/lib/valuation";
import type { BrokerHealthDiagnostics } from "@/src/lib/broker";
import type { RiskAutomationReadinessReport } from "@/src/lib/risk/automation-readiness";
import type { PortfolioPersistenceResult } from "@/src/lib/portfolio/persistence";
import type { PortfolioTruthReadback } from "@/src/lib/portfolio/truth/portfolio-truth-types";
import type { PortfolioValuationResult } from "@/src/lib/portfolio/valuation/portfolio-valuation-types";
import type { LegacyRiskEngineSnapshot } from "@/src/lib/risk/legacy-risk-engine";
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
import type { V11DatabaseActivationReport } from "@/src/lib/workspace/database-activation";
import type { V11DatabaseCutoverStatus } from "@/src/lib/workspace/database-cutover";
import type { V12DatabaseWriteActivationStatus } from "@/src/lib/workspace/database-write-activation";
import type { V13PortfolioWriteDiagnostics } from "@/src/lib/workspace/portfolio-database-write-activation";
import type { V14FcnWriteDiagnostics } from "@/src/lib/workspace/fcn-database-activation";
import type { WorkspacePlatformCutoverStatus } from "@/src/lib/workspace/platform";
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
  v11DatabaseActivation?: V11DatabaseActivationReport | null;
  v11DatabaseCutover?: V11DatabaseCutoverStatus | null;
  v12DatabaseWriteActivation?: V12DatabaseWriteActivationStatus | null;
  v13PortfolioDatabaseWriteActivation?: V13PortfolioWriteDiagnostics | null;
  v14FcnDatabaseActivation?: V14FcnWriteDiagnostics | null;
  databaseReadPriority?: WorkspaceDatabaseReadPriorityStatus | null;
  platformCutover?: WorkspacePlatformCutoverStatus | null;
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
  marketStatus?: ClientSafeMarketReadiness | null;
  marketDataFoundation?: MarketDataSnapshot | null;
  liveProviderReadiness?: LiveProviderReadinessReport | null;
  liveValuationReadiness?: PortfolioValuationSnapshotModel | null;
  brokerIntegrationReadiness?: BrokerHealthDiagnostics | null;
  riskAutomationReadiness?: RiskAutomationReadinessReport | null;
  morningBriefEngine?: MorningSnapshot | null;
  intelligenceV2Foundation?: IntelligenceV2Report | null;
  saasFoundation?: SaasFoundationReadiness | null;
  ownershipReadiness?: WorkspaceOwnershipCheck | null;
  portfolioPersistence: PortfolioPersistenceResult | null;
  persistenceReadiness?: PortfolioPersistenceReadiness | null;
  portfolioTruth: PortfolioTruthReadback | null;
  risk: PortfolioRiskResult | null;
  legacyRiskEngine?: LegacyRiskEngineSnapshot | null;
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
