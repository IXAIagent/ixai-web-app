"use client";

import { buildWorkspaceLiveMarketSnapshot } from "@/src/lib/market-data/live-market-snapshot";
import type {
  WorkspaceLiveMarketInput,
  WorkspaceLiveMarketSnapshot,
} from "@/src/lib/market-data/live-market-types";
import type { YahooQuoteSnapshot } from "@/src/lib/market-data/yahoo";
import { loadPortfolioTruthReadback } from "@/src/lib/portfolio/truth/portfolio-truth-client";
import type { PortfolioTruthReadback } from "@/src/lib/portfolio/truth/portfolio-truth-types";

type YahooQuotesApiResponse = {
  data?: YahooQuoteSnapshot;
  error?: string;
  ok: boolean;
};

function normalizeSymbol(value: string | null | undefined) {
  return (value ?? "").trim().toUpperCase();
}

function uniqueSymbols(symbols: string[]) {
  return Array.from(new Set(symbols.map(normalizeSymbol).filter(Boolean))).slice(0, 30);
}

export function collectWorkspaceLiveMarketSymbols(input: WorkspaceLiveMarketInput = {}) {
  const truth = input.truth;

  return uniqueSymbols([
    ...(truth?.positions.stock.map((position) => position.symbol) ?? []),
    ...(truth?.positions.crypto.map((position) => position.symbol) ?? []),
    ...(truth?.positions.fcn.flatMap((position) =>
      position.underlyings.map((underlying) => underlying.symbol),
    ) ?? []),
    ...(input.extraSymbols ?? []),
  ]);
}

export async function requestWorkspaceLiveMarketQuotes(
  symbols: string[],
): Promise<YahooQuoteSnapshot | null> {
  const requestedSymbols = uniqueSymbols(symbols);

  if (requestedSymbols.length === 0) {
    return null;
  }

  const response = await fetch(
    `/api/market/yahoo-quotes?symbols=${encodeURIComponent(requestedSymbols.join(","))}`,
    {
      cache: "no-store",
    },
  );
  const payload = (await response.json()) as YahooQuotesApiResponse;

  if (!payload.ok || !payload.data) {
    return null;
  }

  return payload.data;
}

export async function getWorkspaceLiveMarketSnapshot(input: WorkspaceLiveMarketInput = {}) {
  const truth = input.truth === undefined ? await loadPortfolioTruthReadback() : input.truth;
  const requestedSymbols = collectWorkspaceLiveMarketSymbols({
    extraSymbols: input.extraSymbols,
    truth,
  });
  const yahooSnapshot = await requestWorkspaceLiveMarketQuotes(requestedSymbols);

  return buildWorkspaceLiveMarketSnapshot(yahooSnapshot, requestedSymbols);
}

export async function getWorkspaceLiveMarketSnapshotForTruth(
  truth: PortfolioTruthReadback,
  extraSymbols: string[] = [],
): Promise<WorkspaceLiveMarketSnapshot> {
  return getWorkspaceLiveMarketSnapshot({
    extraSymbols,
    truth,
  });
}
