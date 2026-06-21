import type { PortfolioDashboardSummary } from "@/src/lib/portfolio/dashboard";
import type { PendingPortfolioInputRecord } from "@/src/lib/portfolio/input/input-truth-bridge";
import type { CryptoPosition } from "@/src/types/crypto-position";
import type { FCNPosition } from "@/src/types/fcn-position";
import type { StockPosition } from "@/src/types/stock-position";

export type PortfolioTruthSourceStatus =
  | "ready"
  | "partial"
  | "placeholder"
  | "unauthenticated"
  | "unavailable";

export type PortfolioTruthReadinessLevel = PortfolioTruthSourceStatus;

export type PortfolioTruthSourceKey =
  | "fcn"
  | "stock"
  | "crypto"
  | "portfolioDashboard"
  | "inputBridge";

export interface PortfolioTruthDataSourceStatus {
  key: PortfolioTruthSourceKey;
  label: string;
  note: string;
  status: PortfolioTruthSourceStatus;
}

export interface PortfolioTruthCounts {
  totalAssets: number;
  totalCryptoPositions: number;
  totalDualPositions: number;
  totalFcnPositions: number;
  totalGridPositions: number;
  totalPendingCryptoInputs: number;
  totalPendingFcnInputs: number;
  totalPendingInputs: number;
  totalPendingStockInputs: number;
  totalPersistedAssets: number;
  totalStockPositions: number;
}

export interface PortfolioTruthAmounts {
  cryptoNotionalKnown: number;
  fcnNotional: number;
  pendingKnownNotional: number;
  stockNotionalKnown: number;
  totalKnownNotional: number;
}

export interface PortfolioTruthSymbols {
  cryptoSymbols: string[];
  stockSymbols: string[];
  topAvailableSymbols: string[];
  topExposures: PortfolioTruthSymbolExposure[];
  underlyingSymbols: string[];
}

export interface PortfolioTruthSymbolExposure {
  occurrenceCount: number;
  sources: string[];
  symbol: string;
}

export type PortfolioTruthRiskLevel = "HIGH" | "LOW" | "MODERATE" | "UNKNOWN";

export interface PortfolioTruthConcentrationRisk {
  level: PortfolioTruthRiskLevel;
  repeatedSymbolCount: number;
  score: number | null;
  summary: string;
  topExposure: PortfolioTruthSymbolExposure | null;
  topExposureSharePct: number | null;
  totalSymbolOccurrences: number;
}

export interface PortfolioTruthDataQualityRisk {
  level: PortfolioTruthRiskLevel;
  partialSourceCount: number;
  score: number | null;
  summary: string;
  unavailableSourceCount: number;
  warningCount: number;
}

export interface PortfolioTruthRiskSummary {
  concentrationRisk: PortfolioTruthConcentrationRisk;
  dataQualityRisk: PortfolioTruthDataQualityRisk;
}

export interface PortfolioTruthPositions {
  crypto: CryptoPosition[];
  fcn: FCNPosition[];
  stock: StockPosition[];
}

export interface PortfolioTruthReadback {
  amounts: PortfolioTruthAmounts;
  counts: PortfolioTruthCounts;
  dataSourceStatuses: PortfolioTruthDataSourceStatus[];
  lastRefreshedAt: string;
  missingDataWarnings: string[];
  portfolioDashboard: PortfolioDashboardSummary | null;
  pendingInputs: PendingPortfolioInputRecord[];
  positions: PortfolioTruthPositions;
  readinessLevel: PortfolioTruthReadinessLevel;
  risk: PortfolioTruthRiskSummary;
  symbols: PortfolioTruthSymbols;
}

export interface BuildPortfolioTruthInput {
  cryptoError?: boolean;
  cryptoPositions: CryptoPosition[];
  fcnError?: boolean;
  fcnPositions: FCNPosition[];
  portfolioDashboardError?: boolean;
  portfolioDashboardSummary?: PortfolioDashboardSummary | null;
  pendingInputs?: PendingPortfolioInputRecord[];
  stockError?: boolean;
  stockPositions: StockPosition[];
  unauthenticated?: boolean;
}
