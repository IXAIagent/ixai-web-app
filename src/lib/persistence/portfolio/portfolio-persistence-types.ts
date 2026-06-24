export type PersistenceSourceStatus =
  | "error"
  | "fallback"
  | "local"
  | "partial"
  | "persisted"
  | "unavailable";

export interface PersistentPortfolioPosition {
  assetClass: "cash" | "crypto" | "fcn" | "stock" | "unknown";
  currency?: string;
  id: string;
  name?: string;
  notionalAmount?: number;
  quantity?: number;
  sourceStatus: PersistenceSourceStatus;
  symbol?: string;
  updatedAt?: string;
}

export interface PersistentStockPosition extends PersistentPortfolioPosition {
  assetClass: "stock";
}

export interface PersistentCryptoPosition extends PersistentPortfolioPosition {
  assetClass: "crypto";
}

export interface PersistentFcnPosition extends PersistentPortfolioPosition {
  assetClass: "fcn";
  issuer?: string;
  underlyingSymbols?: string[];
}

export interface PortfolioPersistenceReadResult<TPosition = PersistentPortfolioPosition> {
  generatedAt: string;
  positions: TPosition[];
  sourceStatus: PersistenceSourceStatus;
  warnings: string[];
}

export interface PortfolioPersistenceWriteDraft {
  assetClass: PersistentPortfolioPosition["assetClass"];
  currency?: string;
  name?: string;
  notionalAmount?: number;
  quantity?: number;
  symbol?: string;
}

export interface PortfolioPersistenceReadiness {
  generatedAt: string;
  hasLocalFallback: boolean;
  persistedPositionCount: number;
  sourceStatus: PersistenceSourceStatus;
  summary: string;
  warnings: string[];
}
