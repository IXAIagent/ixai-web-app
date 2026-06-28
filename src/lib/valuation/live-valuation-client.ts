"use client";

import { loadPortfolioTruthReadback } from "@/src/lib/portfolio/truth/portfolio-truth-client";
import {
  collectWorkspaceLiveMarketSymbols,
  getWorkspaceLiveMarketSnapshotForTruth,
  requestWorkspaceLiveMarketQuotes,
} from "@/src/lib/market-data/live-market-service";
import { buildUnavailableLiveMarketSnapshot } from "@/src/lib/market-data/live-market-snapshot";
import { logWorkspaceRuntimeWarning } from "@/src/lib/workspace/runtime-safety";
import { buildFcnLiveUnderlyingSnapshot } from "@/src/lib/valuation/fcn-live-valuation";
import type { LiveProductValuationPreview } from "@/src/lib/valuation/live-valuation-types";
import { buildPortfolioLiveValuationSnapshot } from "@/src/lib/valuation/portfolio-live-valuation";
import type { YahooQuoteSnapshot } from "@/src/lib/market-data/yahoo/yahoo-quote-types";

export function collectWorkspaceLiveQuoteSymbols(input: Awaited<ReturnType<typeof loadPortfolioTruthReadback>>) {
  return collectWorkspaceLiveMarketSymbols({ truth: input });
}

export async function fetchYahooQuoteSnapshot(symbols: string[]): Promise<YahooQuoteSnapshot | null> {
  return requestWorkspaceLiveMarketQuotes(symbols);
}

export async function loadWorkspaceLiveValuationPreview(): Promise<LiveProductValuationPreview> {
  const truth = await loadPortfolioTruthReadback().catch((error) => {
    logWorkspaceRuntimeWarning("live-valuation-truth-fallback", error);
    return null;
  });
  const requestedSymbols = collectWorkspaceLiveMarketSymbols({ truth });
  const liveMarketSnapshot = truth
    ? await getWorkspaceLiveMarketSnapshotForTruth(truth).catch((error) => {
        logWorkspaceRuntimeWarning("live-valuation-market-fallback", error);
        return buildUnavailableLiveMarketSnapshot(requestedSymbols);
      })
    : buildUnavailableLiveMarketSnapshot(requestedSymbols);
  const quoteSnapshot = liveMarketSnapshot.sourceSnapshot;
  const portfolio = buildPortfolioLiveValuationSnapshot({
    quoteSnapshot,
    truth,
  });
  const fcn = buildFcnLiveUnderlyingSnapshot({
    fcnPositions: truth?.positions.fcn ?? [],
    quoteSnapshot,
  });

  return {
    fcn,
    generatedAt: new Date().toISOString(),
    liveMarketSnapshot,
    portfolio,
    quoteSnapshot,
    readOnly: true,
  };
}
