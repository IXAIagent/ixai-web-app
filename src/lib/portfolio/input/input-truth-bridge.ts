"use client";

import { loadFcnDrafts } from "@/src/lib/portfolio/input/fcn-draft-store";
import { loadRecentPortfolioInputs } from "@/src/lib/portfolio/input/recent-inputs";

export type PendingPortfolioInputCategory = "CRYPTO" | "FCN" | "STOCK";

export type PendingPortfolioInputRecord = {
  category: PendingPortfolioInputCategory;
  createdAt: string;
  details: string[];
  id: string;
  knownNotional: number | null;
  source: "local_pending";
  status: "pending";
  symbols: string[];
  title: string;
};

export type PendingPortfolioInputCreate = Omit<
  PendingPortfolioInputRecord,
  "createdAt" | "id" | "source" | "status"
>;

export const INPUT_TRUTH_BRIDGE_EVENT = "ixai:portfolio-input-truth-bridge:changed";
export const INPUT_TRUTH_BRIDGE_STORAGE_KEY = "ixai.portfolio.input-truth-bridge.v410";

const MAX_PENDING_INPUTS = 32;

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function createInputId(category: PendingPortfolioInputCategory) {
  return `pending-${category.toLowerCase()}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function normalizeSymbol(symbol: string | null | undefined) {
  return (symbol ?? "").trim().toUpperCase();
}

function normalizeSymbols(symbols: string[]) {
  return Array.from(new Set(symbols.map(normalizeSymbol).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  );
}

function parseBridgeRecords(raw: string | null): PendingPortfolioInputRecord[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is PendingPortfolioInputRecord => {
      return (
        item &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.title === "string" &&
        typeof item.category === "string" &&
        typeof item.createdAt === "string" &&
        Array.isArray(item.symbols) &&
        Array.isArray(item.details)
      );
    });
  } catch {
    return [];
  }
}

function parseKnownNotional(value: string | undefined) {
  if (!value) {
    return null;
  }

  const parsed = Number(value.replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function inferSymbolFromTitle(title: string) {
  const firstToken = title.trim().split(/[\s·/]+/u)[0];
  return normalizeSymbol(firstToken);
}

function loadLegacyRecentInputs(): PendingPortfolioInputRecord[] {
  return loadRecentPortfolioInputs()
    .filter((input) => input.category === "STOCK" || input.category === "CRYPTO" || input.category === "FCN")
    .map((input) => ({
      category: input.category as PendingPortfolioInputCategory,
      createdAt: input.createdAt,
      details: input.details,
      id: `legacy-recent-${input.id}`,
      knownNotional: null,
      source: "local_pending" as const,
      status: "pending" as const,
      symbols: normalizeSymbols([inferSymbolFromTitle(input.title)]),
      title: input.title,
    }));
}

function loadLegacyFcnDraftInputs(): PendingPortfolioInputRecord[] {
  return loadFcnDrafts().map((draft) => ({
    category: "FCN" as const,
    createdAt: draft.createdAt,
    details: [
      `${draft.currency} ${draft.notionalAmount ?? "notional pending"}`,
      `${draft.underlyings.length} underlyings`,
      `${draft.observationFrequency} observation`,
    ],
    id: `legacy-fcn-draft-${draft.id}`,
    knownNotional: parseKnownNotional(draft.notionalAmount),
    source: "local_pending" as const,
    status: "pending" as const,
    symbols: normalizeSymbols(draft.underlyings.map((underlying) => underlying.symbol)),
    title: draft.name,
  }));
}

function dedupeRecords(records: PendingPortfolioInputRecord[]) {
  const seen = new Set<string>();

  return records.filter((record) => {
    const key = [
      record.category,
      record.title.trim().toUpperCase(),
      record.symbols.join(","),
      record.knownNotional ?? "unknown",
    ].join(":");

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function persistBridgeRecords(records: PendingPortfolioInputRecord[]) {
  if (!canUseLocalStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(INPUT_TRUTH_BRIDGE_STORAGE_KEY, JSON.stringify(records));
    window.dispatchEvent(new CustomEvent(INPUT_TRUTH_BRIDGE_EVENT));
    window.dispatchEvent(new CustomEvent("ixai:portfolio:changed"));
  } catch {
    // Local pending input state must not block the input workflow.
  }
}

export function loadPendingPortfolioInputs(): PendingPortfolioInputRecord[] {
  if (!canUseLocalStorage()) {
    return [];
  }

  const canonical = parseBridgeRecords(window.localStorage.getItem(INPUT_TRUTH_BRIDGE_STORAGE_KEY));
  const legacy = [...loadLegacyRecentInputs(), ...loadLegacyFcnDraftInputs()];

  return dedupeRecords([...canonical, ...legacy])
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, MAX_PENDING_INPUTS);
}

export function savePendingPortfolioInput(input: PendingPortfolioInputCreate) {
  const nextRecord: PendingPortfolioInputRecord = {
    ...input,
    createdAt: new Date().toISOString(),
    id: createInputId(input.category),
    knownNotional:
      typeof input.knownNotional === "number" && Number.isFinite(input.knownNotional)
        ? input.knownNotional
        : null,
    source: "local_pending",
    status: "pending",
    symbols: normalizeSymbols(input.symbols),
  };

  if (!canUseLocalStorage()) {
    return nextRecord;
  }

  const current = parseBridgeRecords(window.localStorage.getItem(INPUT_TRUTH_BRIDGE_STORAGE_KEY));
  const next = dedupeRecords([nextRecord, ...current]).slice(0, MAX_PENDING_INPUTS);

  persistBridgeRecords(next);

  return nextRecord;
}
