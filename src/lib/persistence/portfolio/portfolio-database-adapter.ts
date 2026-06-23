import {
  readDatabaseTable,
  summarizeTableStatuses,
} from "@/src/lib/persistence/database-activation-utils";
import type {
  PersistentCryptoPosition,
  PersistentPortfolioPosition,
  PersistentStockPosition,
} from "@/src/lib/persistence/portfolio";
import type { PortfolioDatabaseTableReadiness } from "@/src/lib/persistence/portfolio/portfolio-database-types";

function normalizePortfolioRow(row: Record<string, unknown>): PersistentPortfolioPosition {
  return {
    assetClass: (row.asset_class as PersistentPortfolioPosition["assetClass"]) ?? "unknown",
    currency: typeof row.currency === "string" ? row.currency : undefined,
    id: String(row.id ?? `portfolio-db-${Date.now()}`),
    name: typeof row.name === "string" ? row.name : undefined,
    notionalAmount: typeof row.notional_amount === "number" ? row.notional_amount : undefined,
    quantity: typeof row.quantity === "number" ? row.quantity : undefined,
    sourceStatus: "persisted",
    symbol: typeof row.symbol === "string" ? row.symbol : undefined,
    updatedAt: typeof row.updated_at === "string" ? row.updated_at : undefined,
  };
}

export async function readPortfolioPositionsFromDatabase(): Promise<PersistentPortfolioPosition[]> {
  const result = await readDatabaseTable<Record<string, unknown>>("portfolio_positions");
  return result.rows.map(normalizePortfolioRow);
}

export async function readStockPositionsFromDatabase(): Promise<PersistentStockPosition[]> {
  const result = await readDatabaseTable<Record<string, unknown>>("stock_positions");
  return result.rows.map((row) => ({
    ...normalizePortfolioRow(row),
    assetClass: "stock",
  }));
}

export async function readCryptoPositionsFromDatabase(): Promise<PersistentCryptoPosition[]> {
  const result = await readDatabaseTable<Record<string, unknown>>("crypto_positions");
  return result.rows.map((row) => ({
    ...normalizePortfolioRow(row),
    assetClass: "crypto",
  }));
}

export async function upsertStockPositionDraft() {
  return {
    ok: false,
    warning: "Stock database writes are disabled by default in V8.10.",
  };
}

export async function upsertCryptoPositionDraft() {
  return {
    ok: false,
    warning: "Crypto database writes are disabled by default in V8.10.",
  };
}

export async function checkPortfolioTablesReadiness(): Promise<PortfolioDatabaseTableReadiness> {
  const tables = await Promise.all([
    readDatabaseTable<unknown>("portfolio_positions", "id"),
    readDatabaseTable<unknown>("stock_positions", "id"),
    readDatabaseTable<unknown>("crypto_positions", "id"),
  ]);
  const summary = summarizeTableStatuses(tables);

  return {
    generatedAt: new Date().toISOString(),
    sourceStatus: summary.sourceStatus,
    tables: tables.map((table) => ({
      name: table.table as "crypto_positions" | "portfolio_positions" | "stock_positions",
      status: table.status,
      warnings: table.warnings,
    })),
    warnings: tables.flatMap((table) => table.warnings),
  };
}
