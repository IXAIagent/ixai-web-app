import type {
  PersistentCryptoPosition,
  PersistentFcnPosition,
  PersistentPortfolioPosition,
  PersistentStockPosition,
  PortfolioPersistenceReadResult,
  PortfolioPersistenceWriteDraft,
} from "@/src/lib/persistence/portfolio/portfolio-persistence-types";
import {
  readCryptoPositionsFromDatabase,
  readPortfolioPositionsFromDatabase,
  readStockPositionsFromDatabase,
} from "@/src/lib/persistence/portfolio/portfolio-database-adapter";

function unavailableResult<TPosition>(): PortfolioPersistenceReadResult<TPosition> {
  return {
    generatedAt: new Date().toISOString(),
    positions: [],
    sourceStatus: "unavailable",
    warnings: [
      "Persistent portfolio tables are not required at runtime in V7.10. Existing local/fallback readback remains active.",
    ],
  };
}

export async function listPortfolioPositions(): Promise<
  PortfolioPersistenceReadResult<PersistentPortfolioPosition>
> {
  try {
    const positions = await readPortfolioPositionsFromDatabase();
    return {
      generatedAt: new Date().toISOString(),
      positions,
      sourceStatus: positions.length > 0 ? "persisted" : "unavailable",
      warnings:
        positions.length > 0
          ? []
          : ["portfolio_positions has no readable rows or is unavailable; fallback remains active."],
    };
  } catch {
    return unavailableResult<PersistentPortfolioPosition>();
  }
}

export async function listStockPositions(): Promise<
  PortfolioPersistenceReadResult<PersistentStockPosition>
> {
  try {
    const positions = await readStockPositionsFromDatabase();
    return {
      generatedAt: new Date().toISOString(),
      positions,
      sourceStatus: positions.length > 0 ? "persisted" : "unavailable",
      warnings:
        positions.length > 0
          ? []
          : ["stock_positions has no readable rows or is unavailable; fallback remains active."],
    };
  } catch {
    return unavailableResult<PersistentStockPosition>();
  }
}

export async function listCryptoPositions(): Promise<
  PortfolioPersistenceReadResult<PersistentCryptoPosition>
> {
  try {
    const positions = await readCryptoPositionsFromDatabase();
    return {
      generatedAt: new Date().toISOString(),
      positions,
      sourceStatus: positions.length > 0 ? "persisted" : "unavailable",
      warnings:
        positions.length > 0
          ? []
          : ["crypto_positions has no readable rows or is unavailable; fallback remains active."],
    };
  } catch {
    return unavailableResult<PersistentCryptoPosition>();
  }
}

export async function listFcnPositions(): Promise<
  PortfolioPersistenceReadResult<PersistentFcnPosition>
> {
  return unavailableResult<PersistentFcnPosition>();
}

export async function createPortfolioPositionDraft(
  draft: PortfolioPersistenceWriteDraft,
): Promise<PortfolioPersistenceReadResult<PersistentPortfolioPosition>> {
  void draft;

  return {
    generatedAt: new Date().toISOString(),
    positions: [],
    sourceStatus: "unavailable",
    warnings: [
      "Write drafts are intentionally not wired to UI writes in V7.10.",
    ],
  };
}
