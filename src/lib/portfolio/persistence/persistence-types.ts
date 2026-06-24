export type PortfolioPersistenceSourceStatus =
  | "persisted"
  | "local"
  | "fallback"
  | "partial"
  | "unavailable";

export type PortfolioPersistedAssetClass =
  | "stock"
  | "crypto"
  | "fcn"
  | "cash"
  | "unknown";

export interface PortfolioPersistenceWarning {
  id: string;
  message: string;
  sourceName: string;
  sourceStatus: PortfolioPersistenceSourceStatus;
}

export interface PortfolioPersistedPosition {
  id: string;
  assetClass: PortfolioPersistedAssetClass;
  symbol?: string;
  name?: string;
  quantity?: number;
  notionalAmount?: number;
  currency?: string;
  sourceStatus: PortfolioPersistenceSourceStatus;
  sourceName: string;
  updatedAt?: string;
  warningMessage?: string;
}

export interface PortfolioPersistenceSummary {
  totalPositions: number;
  persistedPositions: number;
  localPositions: number;
  fallbackPositions: number;
  unavailablePositions: number;
  stockPositions: number;
  cryptoPositions: number;
  fcnPositions: number;
  cashPositions: number;
  unknownPositions: number;
  sourceStatus: PortfolioPersistenceSourceStatus;
  lastUpdated?: string;
  warnings: PortfolioPersistenceWarning[];
  positions: PortfolioPersistedPosition[];
}

export interface PortfolioPersistenceResult {
  summary: PortfolioPersistenceSummary;
  sourceStatus: PortfolioPersistenceSourceStatus;
  generatedAt: string;
  informationalOnlyDisclaimer: string;
  readPriority?: import("@/src/lib/workspace/database-read-priority").WorkspaceDatabaseReadPriorityMetadata;
}
