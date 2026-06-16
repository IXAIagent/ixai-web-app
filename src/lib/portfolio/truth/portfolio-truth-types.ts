import type { PortfolioDashboardSummary } from "@/src/lib/portfolio/dashboard";
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
  | "portfolioDashboard";

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
  totalStockPositions: number;
}

export interface PortfolioTruthAmounts {
  cryptoNotionalKnown: number;
  fcnNotional: number;
  stockNotionalKnown: number;
  totalKnownNotional: number;
}

export interface PortfolioTruthSymbols {
  cryptoSymbols: string[];
  stockSymbols: string[];
  topAvailableSymbols: string[];
  underlyingSymbols: string[];
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
  positions: PortfolioTruthPositions;
  readinessLevel: PortfolioTruthReadinessLevel;
  symbols: PortfolioTruthSymbols;
}

export interface BuildPortfolioTruthInput {
  cryptoError?: boolean;
  cryptoPositions: CryptoPosition[];
  fcnError?: boolean;
  fcnPositions: FCNPosition[];
  portfolioDashboardError?: boolean;
  portfolioDashboardSummary?: PortfolioDashboardSummary | null;
  stockError?: boolean;
  stockPositions: StockPosition[];
  unauthenticated?: boolean;
}
