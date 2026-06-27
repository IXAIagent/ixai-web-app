"use client";

import { loadPortfolioTruthReadback } from "@/src/lib/portfolio/truth/portfolio-truth-client";
import { buildFcnLiveUnderlyingSnapshot } from "@/src/lib/valuation/fcn-live-valuation";
import type { LiveProductValuationPreview } from "@/src/lib/valuation/live-valuation-types";
import { buildPortfolioLiveValuationSnapshot } from "@/src/lib/valuation/portfolio-live-valuation";
import type { YahooQuoteSnapshot } from "@/src/lib/market-data/yahoo";

type YahooQuotesApiResponse = {
  data?: YahooQuoteSnapshot;
  error?: string;
  ok: boolean;
};

function normalizeSymbol(value: string | null | undefined) {
  return (value ?? "").trim().toUpperCase();
}

export function collectWorkspaceLiveQuoteSymbols(input: Awaited<ReturnType<typeof loadPortfolioTruthReadback>>) {
  return Array.from(
    new Set([
      ...input.positions.stock.map((position) => normalizeSymbol(position.symbol)),
      ...input.positions.crypto.map((position) => normalizeSymbol(position.symbol)),
      ...input.positions.fcn.flatMap((position) =>
        position.underlyings.map((underlying) => normalizeSymbol(underlying.symbol)),
      ),
    ].filter(Boolean)),
  ).slice(0, 30);
}

export async function fetchYahooQuoteSnapshot(symbols: string[]): Promise<YahooQuoteSnapshot | null> {
  if (symbols.length === 0) {
    return null;
  }

  const response = await fetch(
    `/api/market/yahoo-quotes?symbols=${encodeURIComponent(symbols.join(","))}`,
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

export async function loadWorkspaceLiveValuationPreview(): Promise<LiveProductValuationPreview> {
  const truth = await loadPortfolioTruthReadback();
  const quoteSnapshot = await fetchYahooQuoteSnapshot(collectWorkspaceLiveQuoteSymbols(truth));
  const portfolio = buildPortfolioLiveValuationSnapshot({
    quoteSnapshot,
    truth,
  });
  const fcn = buildFcnLiveUnderlyingSnapshot({
    fcnPositions: truth.positions.fcn,
    quoteSnapshot,
  });

  return {
    fcn,
    generatedAt: new Date().toISOString(),
    portfolio,
    quoteSnapshot,
    readOnly: true,
  };
}
