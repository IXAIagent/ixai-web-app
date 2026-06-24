import {
  checkPortfolioTablesReadiness,
  readCryptoPositionsFromDatabase,
  readPortfolioPositionsFromDatabase,
  readStockPositionsFromDatabase,
  upsertCryptoPositionDraft,
  upsertStockPositionDraft,
} from "@/src/lib/persistence/portfolio/portfolio-database-adapter";
import type {
  PersistentCryptoPosition,
  PersistentPortfolioPosition,
  PersistentStockPosition,
  PortfolioPersistenceReadResult,
  PortfolioPersistenceWriteDraft,
} from "@/src/lib/persistence/portfolio/portfolio-persistence-types";

export interface PortfolioLivePersistenceReadiness {
  generatedAt: string;
  liveCryptoPositions: number;
  livePortfolioPositions: number;
  liveStockPositions: number;
  sourceStatus: "partial" | "persisted" | "unavailable";
  summary: string;
  warnings: string[];
}

export interface PortfolioLiveWriteResult {
  generatedAt: string;
  ok: boolean;
  sourceStatus: "partial" | "persisted" | "unavailable";
  warning: string;
}

function statusFromCount(count: number): PortfolioPersistenceReadResult["sourceStatus"] {
  return count > 0 ? "persisted" : "unavailable";
}

async function safeRead<TPosition>(
  read: () => Promise<TPosition[]>,
  emptyWarning: string,
): Promise<PortfolioPersistenceReadResult<TPosition>> {
  try {
    const positions = await read();

    return {
      generatedAt: new Date().toISOString(),
      positions,
      sourceStatus: statusFromCount(positions.length),
      warnings: positions.length > 0 ? [] : [emptyWarning],
    };
  } catch {
    return {
      generatedAt: new Date().toISOString(),
      positions: [],
      sourceStatus: "unavailable",
      warnings: [`${emptyWarning} Live database read failed safely; local fallback remains active.`],
    };
  }
}

export async function readLivePortfolioPositions(): Promise<
  PortfolioPersistenceReadResult<PersistentPortfolioPosition>
> {
  return safeRead(
    readPortfolioPositionsFromDatabase,
    "portfolio_positions is unavailable or empty.",
  );
}

export async function readLiveStockPositions(): Promise<
  PortfolioPersistenceReadResult<PersistentStockPosition>
> {
  return safeRead(readStockPositionsFromDatabase, "stock_positions is unavailable or empty.");
}

export async function readLiveCryptoPositions(): Promise<
  PortfolioPersistenceReadResult<PersistentCryptoPosition>
> {
  return safeRead(readCryptoPositionsFromDatabase, "crypto_positions is unavailable or empty.");
}

async function guardedWrite(
  write: () => Promise<{ ok: boolean; warning: string }>,
  unavailableWarning: string,
): Promise<PortfolioLiveWriteResult> {
  try {
    const readiness = await checkPortfolioTablesReadiness();

    if (readiness.sourceStatus !== "ready") {
      return {
        generatedAt: new Date().toISOString(),
        ok: false,
        sourceStatus: readiness.sourceStatus === "partial" ? "partial" : "unavailable",
        warning: `${unavailableWarning} Database tables are not fully ready; local fallback should remain the primary write path.`,
      };
    }

    const result = await write();

    return {
      generatedAt: new Date().toISOString(),
      ok: result.ok,
      sourceStatus: result.ok ? "persisted" : "partial",
      warning: result.warning,
    };
  } catch {
    return {
      generatedAt: new Date().toISOString(),
      ok: false,
      sourceStatus: "unavailable",
      warning: `${unavailableWarning} Database write guard failed safely; local fallback remains active.`,
    };
  }
}

export async function saveStockPositionToDatabase(
  draft: PortfolioPersistenceWriteDraft,
): Promise<PortfolioLiveWriteResult> {
  void draft;
  return guardedWrite(upsertStockPositionDraft, "Stock position was not written to database.");
}

export async function saveCryptoPositionToDatabase(
  draft: PortfolioPersistenceWriteDraft,
): Promise<PortfolioLiveWriteResult> {
  void draft;
  return guardedWrite(upsertCryptoPositionDraft, "Crypto position was not written to database.");
}

export async function getLivePortfolioPersistenceReadiness(): Promise<PortfolioLivePersistenceReadiness> {
  try {
    const [portfolio, stock, crypto, tableReadiness] = await Promise.all([
      readLivePortfolioPositions(),
      readLiveStockPositions(),
      readLiveCryptoPositions(),
      checkPortfolioTablesReadiness(),
    ]);
    const liveCount =
      portfolio.positions.length + stock.positions.length + crypto.positions.length;

    return {
      generatedAt: new Date().toISOString(),
      liveCryptoPositions: crypto.positions.length,
      livePortfolioPositions: portfolio.positions.length,
      liveStockPositions: stock.positions.length,
      sourceStatus:
        liveCount > 0
          ? "persisted"
          : tableReadiness.sourceStatus === "partial"
            ? "partial"
            : "unavailable",
      summary:
        "V9.10 live portfolio persistence reads database tables when available and keeps local fallback active when tables are missing or empty.",
      warnings: Array.from(
        new Set([
          ...portfolio.warnings,
          ...stock.warnings,
          ...crypto.warnings,
          ...tableReadiness.warnings,
        ]),
      ),
    };
  } catch {
    return {
      generatedAt: new Date().toISOString(),
      liveCryptoPositions: 0,
      livePortfolioPositions: 0,
      liveStockPositions: 0,
      sourceStatus: "unavailable",
      summary: "V9.10 live portfolio persistence readiness failed safely.",
      warnings: ["Portfolio live persistence remains unavailable; local fallback remains active."],
    };
  }
}
