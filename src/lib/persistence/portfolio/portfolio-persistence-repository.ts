import type {
  PersistentCryptoPosition,
  PersistentFcnPosition,
  PersistentPortfolioPosition,
  PersistentStockPosition,
  PortfolioPersistenceReadResult,
  PortfolioPersistenceWriteDraft,
} from "@/src/lib/persistence/portfolio/portfolio-persistence-types";

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
  return unavailableResult<PersistentPortfolioPosition>();
}

export async function listStockPositions(): Promise<
  PortfolioPersistenceReadResult<PersistentStockPosition>
> {
  return unavailableResult<PersistentStockPosition>();
}

export async function listCryptoPositions(): Promise<
  PortfolioPersistenceReadResult<PersistentCryptoPosition>
> {
  return unavailableResult<PersistentCryptoPosition>();
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
