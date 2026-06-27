"use client";

import { loadFcnManualPriceOverrides } from "@/src/lib/fcn/manual-price-overrides";
import {
  buildFcnPortfolioRiskSummary,
  type FcnRiskQuoteMap,
} from "@/src/lib/fcn/risk/fcn-risk-engine";
import type { FcnPortfolioRiskSummary } from "@/src/lib/fcn/risk/fcn-risk-types";
import type { MarketQuote, MarketQuoteResult } from "@/src/lib/market/types";
import type { YahooQuoteSnapshot } from "@/src/lib/market-data/yahoo/yahoo-quote-types";
import {
  loadFcnDrafts,
  parseDraftNumber,
  type FCNDraftRecord,
} from "@/src/lib/portfolio/input/fcn-draft-store";
import { getSupabaseAuthorizationHeaders } from "@/src/lib/supabase/client";
import type {
  FCNCurrency,
  FCNObservationScheduleItem,
  FCNPosition,
  FCNUnderlying,
} from "@/src/types/fcn-position";

type FCNListResponse = {
  ok: boolean;
  positions?: FCNPosition[];
};

const EMPTY_SUMMARY = buildFcnPortfolioRiskSummary({
  positions: [],
  quotesBySymbol: new Map(),
});

type YahooQuotesApiResponse = {
  data?: YahooQuoteSnapshot;
  error?: string;
  ok: boolean;
};

function normalizeSymbol(symbol: string | null | undefined) {
  return (symbol ?? "").trim().toUpperCase();
}

function normalizeCurrency(currency: string): FCNCurrency {
  if (currency === "TWD" || currency === "USDT" || currency === "USD") {
    return currency;
  }

  return "USD";
}

function quoteRequestSymbol(symbol: string) {
  const normalized = normalizeSymbol(symbol);

  if (normalized === "BTC" || normalized === "ETH" || normalized === "BNB") {
    return `${normalized}USDT`;
  }

  return normalized;
}

function buildQuoteMap(results: MarketQuoteResult<MarketQuote>[]): FcnRiskQuoteMap {
  const quoteMap: FcnRiskQuoteMap = new Map();

  results.forEach((result) => {
    const symbol = normalizeSymbol(result.symbol);
    const requestedSymbol = normalizeSymbol(result.requestedSymbol);

    if (symbol) {
      quoteMap.set(symbol, result);
    }

    if (requestedSymbol) {
      quoteMap.set(requestedSymbol, result);
    }
  });

  return quoteMap;
}

function getSymbols(positions: FCNPosition[]) {
  return Array.from(
    new Set(
      positions
        .flatMap((position) => position.underlyings.map((underlying) => quoteRequestSymbol(underlying.symbol)))
        .filter(Boolean),
    ),
  );
}

function unavailableQuoteResult(symbol: string): MarketQuoteResult<MarketQuote> {
  const normalized = normalizeSymbol(symbol);
  const updatedAt = new Date().toISOString();

  return {
    error: {
      assetType: "unknown",
      message: "Quote unavailable from internal Yahoo quote API route.",
      provider: "yahoo_finance",
      sourceStatus: "unavailable",
      symbol: normalized,
      updatedAt,
    },
    quote: null,
    requestedSymbol: normalized,
    sourceStatus: "unavailable",
    symbol: normalized,
  };
}

function yahooSnapshotToMarketQuoteResults(
  symbols: string[],
  snapshot: YahooQuoteSnapshot | null,
): MarketQuoteResult<MarketQuote>[] {
  if (!snapshot) {
    return symbols.map(unavailableQuoteResult);
  }

  const quoteMap = new Map(snapshot.quotes.map((quote) => [normalizeSymbol(quote.symbol), quote]));

  return symbols.map((symbol) => {
    const normalized = normalizeSymbol(symbol);
    const quote = quoteMap.get(normalized);

    if (!quote || quote.price === null || quote.dataQuality === "unavailable") {
      return unavailableQuoteResult(normalized);
    }

    return {
      error: null,
      quote: {
        assetType: normalized.endsWith("USDT") ? "crypto" : "equity",
        change: quote.change,
        changePercent: quote.changePercent,
        currency: quote.currency ?? "USD",
        marketState: quote.marketState === "regular" ? "open" : "unknown",
        price: quote.price,
        provider: "yahoo_finance",
        sourceStatus: quote.dataQuality === "stale" ? "fallback" : "delayed",
        symbol: normalized,
        updatedAt: quote.asOf ?? snapshot.generatedAt,
      },
      requestedSymbol: normalized,
      sourceStatus: quote.dataQuality === "stale" ? "fallback" : "delayed",
      symbol: normalized,
    };
  });
}

async function getClientSafeMarketQuotes(symbols: string[]): Promise<MarketQuoteResult<MarketQuote>[]> {
  const requestedSymbols = Array.from(new Set(symbols.map(normalizeSymbol).filter(Boolean)));

  if (requestedSymbols.length === 0) {
    return [];
  }

  try {
    const response = await fetch(
      `/api/market/yahoo-quotes?symbols=${encodeURIComponent(requestedSymbols.join(","))}`,
      {
        cache: "no-store",
      },
    );
    const payload = (await response.json().catch(() => ({}))) as YahooQuotesApiResponse;

    if (!response.ok || !payload.ok || !payload.data) {
      return requestedSymbols.map(unavailableQuoteResult);
    }

    return yahooSnapshotToMarketQuoteResults(requestedSymbols, payload.data);
  } catch {
    return requestedSymbols.map(unavailableQuoteResult);
  }
}

function draftScheduleToObservationSchedule(
  draft: FCNDraftRecord,
): FCNObservationScheduleItem[] {
  return draft.schedule.map((item, index) => ({
    couponPaymentDate: item.couponDate,
    observationEnd: item.observationDate,
    observationStart: item.observationDate,
    periodLabel: item.label || `Draft observation ${index + 1}`,
    status: "draft",
  }));
}

function draftUnderlyingToPositionUnderlying(
  draft: FCNDraftRecord,
  index: number,
): FCNUnderlying {
  const underlying = draft.underlyings[index];
  const symbol = normalizeSymbol(underlying?.symbol);

  return {
    createdAt: draft.createdAt,
    currentPrice: parseDraftNumber(underlying?.currentPrice),
    fcnPositionId: `draft-${draft.id}`,
    id: `draft-${draft.id}-underlying-${index}`,
    initialPrice: parseDraftNumber(underlying?.initialPrice),
    kiPrice: parseDraftNumber(underlying?.kiPrice),
    koPrice: parseDraftNumber(underlying?.koPrice),
    market: underlying?.market ?? null,
    metadata: {
      source: "local_fcn_draft",
    },
    name: underlying?.name ?? null,
    strikePrice: parseDraftNumber(underlying?.strikePrice),
    symbol,
    updatedAt: draft.createdAt,
    userId: "local-draft",
    weightPct: parseDraftNumber(underlying?.weightPct),
  };
}

function draftToPosition(draft: FCNDraftRecord): FCNPosition {
  return {
    couponRatePct: parseDraftNumber(draft.couponRatePct),
    createdAt: draft.createdAt,
    currency: normalizeCurrency(draft.currency),
    id: `draft-${draft.id}`,
    issuer: draft.issuer ?? null,
    kiPct: parseDraftNumber(draft.kiPct),
    koPct: parseDraftNumber(draft.koPct),
    maturityDate: null,
    metadata: {
      observationFrequency: draft.observationFrequency,
      source: "local_fcn_draft",
      tenor: draft.tenor ?? null,
    },
    name: draft.name,
    notionalAmount: parseDraftNumber(draft.notionalAmount),
    observationSchedule: draftScheduleToObservationSchedule(draft),
    portfolioId: "local-draft",
    startDate: null,
    status: "active",
    strikePct: parseDraftNumber(draft.strikePct),
    underlyings: draft.underlyings.map((_, index) =>
      draftUnderlyingToPositionUnderlying(draft, index),
    ),
    updatedAt: draft.createdAt,
    userId: "local-draft",
    worstOfSummary: {
      riskEngineVersion: "v1.82.1",
      status: "missing_current_price",
      underlyings: [],
      worstUnderlyingCurrentPrice: null,
      worstUnderlyingInitialPrice: null,
      worstUnderlyingName: null,
      worstUnderlyingReturnPct: null,
      worstUnderlyingSymbol: null,
    },
  };
}

async function loadPersistedFcnPositions() {
  try {
    const headers = await getSupabaseAuthorizationHeaders();

    if (!headers) {
      return [];
    }

    const response = await fetch("/api/fcn", {
      cache: "no-store",
      headers,
    });
    const payload = (await response.json().catch(() => ({}))) as FCNListResponse;

    if (!response.ok || !payload.ok) {
      return [];
    }

    return payload.positions ?? [];
  } catch {
    return [];
  }
}

export async function getFcnPortfolioRiskSummary(): Promise<FcnPortfolioRiskSummary> {
  try {
    const persistedPositions = await loadPersistedFcnPositions();
    const draftPositions = loadFcnDrafts().map(draftToPosition);
    const positions = [...persistedPositions, ...draftPositions];
    const quoteResults = await getClientSafeMarketQuotes(getSymbols(positions));

    return buildFcnPortfolioRiskSummary({
      manualPrices: loadFcnManualPriceOverrides(),
      positions,
      quotesBySymbol: buildQuoteMap(quoteResults),
    });
  } catch {
    return EMPTY_SUMMARY;
  }
}

export async function getWorkspaceFcnRiskSummary() {
  return getFcnPortfolioRiskSummary();
}
