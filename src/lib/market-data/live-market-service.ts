"use client";

import { buildWorkspaceLiveMarketSnapshot } from "@/src/lib/market-data/live-market-snapshot";
import { logWorkspaceRuntimeWarning } from "@/src/lib/workspace/runtime-safety";
import type {
  WorkspaceLiveMarketInput,
  WorkspaceLiveMarketSnapshot,
} from "@/src/lib/market-data/live-market-types";
import type { YahooQuoteSnapshot } from "@/src/lib/market-data/yahoo/yahoo-quote-types";
import type { MarketQuote, MarketQuoteResult } from "@/src/lib/market/types";
import { loadPortfolioTruthReadback } from "@/src/lib/portfolio/truth/portfolio-truth-client";
import type { PortfolioTruthReadback } from "@/src/lib/portfolio/truth/portfolio-truth-types";

type LiveQuotesApiResponse = {
  error?: string;
  ok: boolean;
  quotes?: MarketQuoteResult<MarketQuote>[];
  requestedSymbols?: string[];
  sourceStatus?: string;
  warnings?: string[];
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
    ...(truth?.positions.crypto.map((position) => quoteRequestSymbol(position.symbol)) ?? []),
    ...(truth?.positions.fcn.flatMap((position) =>
      position.underlyings.map((underlying) => quoteRequestSymbol(underlying.symbol)),
    ) ?? []),
    ...(input.extraSymbols ?? []),
  ]);
}

function quoteRequestSymbol(symbol: string | null | undefined) {
  const normalized = normalizeSymbol(symbol);

  if (normalized === "BTC" || normalized === "ETH" || normalized === "BNB") {
    return `${normalized}USDT`;
  }

  return normalized;
}

function dataQualityFromResult(result: MarketQuoteResult<MarketQuote>) {
  if (!result.quote || result.sourceStatus === "unavailable") {
    return "unavailable" as const;
  }

  if (result.sourceStatus === "stale" || result.sourceStatus === "fallback") {
    return "stale" as const;
  }

  return "live" as const;
}

function inferSnapshotDataQuality(quotes: ReturnType<typeof dataQualityFromResult>[]) {
  if (quotes.length === 0 || quotes.every((status) => status === "unavailable")) {
    return "unavailable" as const;
  }

  if (quotes.some((status) => status === "unavailable")) {
    return "partial" as const;
  }

  if (quotes.some((status) => status === "stale")) {
    return "stale" as const;
  }

  return "live" as const;
}

function marketStateFromQuote(quote: MarketQuote | null | undefined) {
  if (quote?.marketState === "open") return "regular" as const;
  if (quote?.marketState === "pre_market") return "premarket" as const;
  if (quote?.marketState === "post_market") return "postmarket" as const;
  if (quote?.marketState === "closed") return "closed" as const;
  return "unknown" as const;
}

function liveQuoteResultsToSnapshot(
  requestedSymbols: string[],
  results: MarketQuoteResult<MarketQuote>[],
): YahooQuoteSnapshot {
  const generatedAt = new Date().toISOString();
  const statuses = results.map(dataQualityFromResult);

  return {
    cacheStatus: statuses.some((status) => status === "stale")
      ? "stale_fallback"
      : statuses.some((status) => status === "live")
        ? "miss"
        : "unavailable",
    cacheTtlSeconds: 60,
    dataQuality: inferSnapshotDataQuality(statuses),
    generatedAt,
    informationalOnlyDisclaimer:
      "Live market quotes are read-only informational data. IXAI does not provide investment recommendations, order execution, or trading instructions.",
    missingQuoteSymbols: results
      .filter((result) => dataQualityFromResult(result) === "unavailable")
      .map((result) => result.symbol || result.requestedSymbol),
    quotes: results.map((result) => ({
      asOf: result.quote?.updatedAt ?? generatedAt,
      change: result.quote?.change ?? null,
      changePercent: result.quote?.changePercent ?? null,
      currency: result.quote?.currency ?? null,
      dataQuality: dataQualityFromResult(result),
      errorMessage: result.error?.message,
      marketState: marketStateFromQuote(result.quote),
      previousClose: null,
      price: result.quote?.price ?? null,
      source: "live_market",
      symbol: result.symbol || result.requestedSymbol,
    })),
    readOnly: true,
    requestedSymbols,
    source: "live_market",
    staleQuoteSymbols: results
      .filter((result) => dataQualityFromResult(result) === "stale")
      .map((result) => result.symbol || result.requestedSymbol),
  };
}

export async function requestWorkspaceLiveMarketQuotes(
  symbols: string[],
): Promise<YahooQuoteSnapshot | null> {
  const requestedSymbols = uniqueSymbols(symbols);

  if (requestedSymbols.length === 0) {
    return null;
  }

  try {
    const response = await fetch(
      `/api/market/live-quotes?symbols=${encodeURIComponent(requestedSymbols.join(","))}`,
      {
        cache: "no-store",
      },
    );
    const payload = (await response.json().catch(() => null)) as LiveQuotesApiResponse | null;

    if (!response.ok || !payload?.ok || !payload.quotes) {
      logWorkspaceRuntimeWarning("live-market-quotes-fallback", payload?.error ?? response.status, {
        requestedSymbols: requestedSymbols.length,
      });
      return null;
    }

    return liveQuoteResultsToSnapshot(requestedSymbols, payload.quotes);
  } catch (error) {
    logWorkspaceRuntimeWarning("live-market-quotes-network-fallback", error, {
      requestedSymbols: requestedSymbols.length,
    });
    return null;
  }
}

export async function getWorkspaceLiveMarketSnapshot(input: WorkspaceLiveMarketInput = {}) {
  const truth = input.truth === undefined
    ? await loadPortfolioTruthReadback().catch((error) => {
        logWorkspaceRuntimeWarning("live-market-truth-fallback", error);
        return null;
      })
    : input.truth;
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
