"use client";

import { loadFcnDrafts } from "@/src/lib/portfolio/input/fcn-draft-store";
import {
  loadPendingPortfolioInputs,
  type PendingPortfolioInputRecord,
} from "@/src/lib/portfolio/input/input-truth-bridge";
import { loadRecentPortfolioInputs } from "@/src/lib/portfolio/input/recent-inputs";
import { loadPortfolioTruthReadback } from "@/src/lib/portfolio/truth/portfolio-truth-client";
import type { PortfolioTruthReadback } from "@/src/lib/portfolio/truth/portfolio-truth-types";
import type {
  PortfolioPersistedAssetClass,
  PortfolioPersistedPosition,
  PortfolioPersistenceSourceStatus,
} from "@/src/lib/portfolio/persistence/persistence-types";
import type { CryptoPosition } from "@/src/types/crypto-position";
import type { FCNPosition } from "@/src/types/fcn-position";
import type { StockPosition } from "@/src/types/stock-position";

type NormalizedPositionInput = {
  assetClass?: PortfolioPersistedAssetClass;
  currency?: string | null;
  id?: string | null;
  name?: string | null;
  notionalAmount?: number | null;
  quantity?: number | null;
  sourceName?: string;
  sourceStatus?: PortfolioPersistenceSourceStatus;
  symbol?: string | null;
  updatedAt?: string | null;
  warningMessage?: string;
};

function isFiniteNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value);
}

function parseFiniteNumber(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, "").trim());
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function normalizeSymbol(value: string | null | undefined) {
  return (value ?? "").trim().toUpperCase() || undefined;
}

function normalizeAssetClass(
  value: string | null | undefined,
): PortfolioPersistedAssetClass {
  const normalized = (value ?? "").toLowerCase();

  if (
    normalized === "stock" ||
    normalized === "crypto" ||
    normalized === "fcn" ||
    normalized === "cash"
  ) {
    return normalized;
  }

  return "unknown";
}

async function getTruthReadback(providedTruth?: PortfolioTruthReadback) {
  if (providedTruth) {
    return providedTruth;
  }

  try {
    return await loadPortfolioTruthReadback();
  } catch {
    return null;
  }
}

export function normalizePersistedPosition(
  input: NormalizedPositionInput,
): PortfolioPersistedPosition {
  const assetClass = input.assetClass ?? "unknown";
  const id =
    input.id ??
    `${assetClass}-${input.symbol ?? input.name ?? input.sourceName ?? "unknown"}-${input.updatedAt ?? "no-date"}`;

  return {
    assetClass,
    currency: input.currency ?? undefined,
    id,
    name: input.name ?? input.symbol ?? undefined,
    notionalAmount: isFiniteNumber(input.notionalAmount)
      ? Number(input.notionalAmount)
      : undefined,
    quantity: isFiniteNumber(input.quantity) ? Number(input.quantity) : undefined,
    sourceName: input.sourceName ?? "unknown",
    sourceStatus: input.sourceStatus ?? "unavailable",
    symbol: normalizeSymbol(input.symbol),
    updatedAt: input.updatedAt ?? undefined,
    warningMessage: input.warningMessage,
  };
}

function normalizeStockPosition(position: StockPosition) {
  const knownNotional =
    isFiniteNumber(position.quantity) && isFiniteNumber(position.averageCost)
      ? Number(position.quantity) * Number(position.averageCost)
      : undefined;

  return normalizePersistedPosition({
    assetClass: "stock",
    currency: position.currency,
    id: position.id,
    name: position.name ?? position.symbol,
    notionalAmount: knownNotional,
    quantity: position.quantity,
    sourceName: "api:stocks",
    sourceStatus: "persisted",
    symbol: position.symbol,
    updatedAt: position.updatedAt,
    warningMessage:
      knownNotional === undefined
        ? "Stock position is persisted but missing quantity or average cost for known notional."
        : undefined,
  });
}

function normalizeCryptoPosition(position: CryptoPosition) {
  const knownNotional =
    isFiniteNumber(position.quantity) && isFiniteNumber(position.averageCost)
      ? Number(position.quantity) * Number(position.averageCost)
      : undefined;

  return normalizePersistedPosition({
    assetClass: "crypto",
    currency: position.currency,
    id: position.id,
    name: position.name ?? position.symbol,
    notionalAmount: knownNotional,
    quantity: position.quantity,
    sourceName: "api:crypto",
    sourceStatus: "persisted",
    symbol: position.symbol,
    updatedAt: position.updatedAt,
    warningMessage:
      knownNotional === undefined
        ? "Crypto position is persisted but missing quantity or average cost for known notional."
        : undefined,
  });
}

function normalizeFcnPosition(position: FCNPosition) {
  const symbols = position.underlyings
    .map((underlying) => normalizeSymbol(underlying.symbol))
    .filter(Boolean)
    .join(", ");

  return normalizePersistedPosition({
    assetClass: "fcn",
    currency: position.currency,
    id: position.id,
    name: position.name,
    notionalAmount: position.notionalAmount,
    sourceName: "api:fcn",
    sourceStatus: "persisted",
    symbol: symbols,
    updatedAt: position.updatedAt,
    warningMessage:
      position.notionalAmount === null
        ? "FCN position is persisted but missing notional amount."
        : undefined,
  });
}

function normalizePendingInput(input: PendingPortfolioInputRecord) {
  return normalizePersistedPosition({
    assetClass: normalizeAssetClass(input.category),
    id: input.id,
    name: input.title,
    notionalAmount: input.knownNotional,
    sourceName: "input-truth-bridge",
    sourceStatus: "local",
    symbol: input.symbols.join(", "),
    updatedAt: input.createdAt,
    warningMessage:
      input.status === "pending"
        ? "Local pending input is visible in Workspace but has not been confirmed as durable storage."
        : undefined,
  });
}

export async function readPersistedStockPositions(
  truth?: PortfolioTruthReadback,
): Promise<PortfolioPersistedPosition[]> {
  const readback = await getTruthReadback(truth);
  return readback?.positions.stock.map(normalizeStockPosition) ?? [];
}

export async function readPersistedCryptoPositions(
  truth?: PortfolioTruthReadback,
): Promise<PortfolioPersistedPosition[]> {
  const readback = await getTruthReadback(truth);
  return readback?.positions.crypto.map(normalizeCryptoPosition) ?? [];
}

export async function readPersistedFcnPositions(
  truth?: PortfolioTruthReadback,
): Promise<PortfolioPersistedPosition[]> {
  const readback = await getTruthReadback(truth);
  return readback?.positions.fcn.map(normalizeFcnPosition) ?? [];
}

export function readLocalDraftPositions(): PortfolioPersistedPosition[] {
  try {
    const pendingInputs = loadPendingPortfolioInputs().map(normalizePendingInput);
    const fcnDrafts = loadFcnDrafts().map((draft) =>
      normalizePersistedPosition({
        assetClass: "fcn",
        currency: draft.currency,
        id: draft.id,
        name: draft.name,
        notionalAmount: parseFiniteNumber(draft.notionalAmount),
        sourceName: "fcn-draft-store",
        sourceStatus: "local",
        symbol: draft.underlyings.map((underlying) => underlying.symbol).join(", "),
        updatedAt: draft.createdAt,
        warningMessage:
          "FCN draft uses local browser storage and remains compatible with the v3.08 draft key.",
      }),
    );

    return [...pendingInputs, ...fcnDrafts];
  } catch {
    return [];
  }
}

export function readFallbackRecentInputs(): PortfolioPersistedPosition[] {
  try {
    return loadRecentPortfolioInputs().map((input) =>
      normalizePersistedPosition({
        assetClass: normalizeAssetClass(input.category),
        id: input.id,
        name: input.title,
        sourceName: "recent-inputs-fallback",
        sourceStatus: "fallback",
        symbol: input.details.join(", "),
        updatedAt: input.createdAt,
        warningMessage:
          "Recent input fallback is local mock readback and is not durable persistence.",
      }),
    );
  } catch {
    return [];
  }
}
