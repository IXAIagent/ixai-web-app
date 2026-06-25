export type V13PortfolioWriteModule =
  | "crypto_position"
  | "fcn"
  | "portfolio"
  | "stock_position";

export type V13PortfolioWriteGuardSource =
  | "default_disabled"
  | "environment"
  | "scope_disabled";

export type V13PortfolioWriteTarget = "database" | "fallback" | "skipped";

export type V13PortfolioWriteStatus =
  | "disabled"
  | "failed"
  | "fallback"
  | "ready"
  | "skipped"
  | "succeeded";

export type V13PortfolioReadSource =
  | "database"
  | "empty"
  | "local"
  | "truth";

export interface V13PortfolioWriteGuard {
  checkedAt: string;
  enabled: boolean;
  module: V13PortfolioWriteModule;
  reason: string;
  source: V13PortfolioWriteGuardSource;
}

export interface V13PortfolioWriteGuardSet {
  checkedAt: string;
  cryptoPositionDatabaseWriteEnabled: V13PortfolioWriteGuard;
  diagnosticsReadOnly: boolean;
  fcnDatabaseWriteEnabled: V13PortfolioWriteGuard;
  portfolioDatabaseWriteEnabled: V13PortfolioWriteGuard;
  portfolioFallbackEnabled: boolean;
  stockPositionDatabaseWriteEnabled: V13PortfolioWriteGuard;
  v12GlobalGuardEnabled: boolean;
}

export interface V13PortfolioWriteResult {
  checkedAt: string;
  databaseAttempted: boolean;
  errorMessage?: string;
  fallbackUsed: boolean;
  guard: V13PortfolioWriteGuard;
  module: V13PortfolioWriteModule;
  operation: "create_portfolio" | "create_position" | "readiness_check";
  portfolioId?: string;
  positionId?: string;
  sourceAction: string;
  status: V13PortfolioWriteStatus;
  target: V13PortfolioWriteTarget;
}

export interface V13StockPositionWriteInput {
  assetName?: string;
  costBasis: number;
  currency: string;
  market: string;
  quantity: number;
  sourceAction?: string;
  ticker: string;
}

export interface V13CryptoPositionWriteInput {
  asset: string;
  costBasis: number;
  currency?: string;
  quantity: number;
  source?: string;
  sourceAction?: string;
}

export interface V13PortfolioWriteReadiness {
  checkedAt: string;
  databaseReady: boolean;
  fallbackEnabled: boolean;
  guardSet: V13PortfolioWriteGuardSet;
  phase: "v13.00_portfolio_database_write_activation";
  readPriority: V13PortfolioReadSource[];
  safeNextAction: string;
  summary: string;
  tableStatus: {
    cryptoPositions: string;
    portfolios: string;
    stockPositions: string;
  };
}

export interface V13PortfolioWriteDiagnostics {
  checkedAt: string;
  fcnDisabledReason: string;
  lastWriteResult: V13PortfolioWriteResult | null;
  phase: "v13.00_portfolio_database_write_activation";
  readPriority: V13PortfolioReadSource[];
  readiness: V13PortfolioWriteReadiness;
  summary: string;
}
