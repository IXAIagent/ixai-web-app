import "server-only";

import type {
  EquityQuote,
  MarketQuoteError,
  MarketQuoteResult,
  MarketQuoteState,
} from "@/src/lib/market/types";

const SUPPORTED_EQUITY_SYMBOLS = new Set([
  "AAPL",
  "TSLA",
  "NVDA",
  "MSFT",
  "GOOGL",
  "PLTR",
  "AVGO",
  "MDB",
  "AFRM",
  "MRVL",
]);

type YahooChartResponse = {
  chart?: {
    error?: {
      code?: string;
      description?: string;
    } | null;
    result?: {
      meta?: {
        currency?: string;
        exchangeName?: string;
        instrumentType?: string;
        previousClose?: number;
        regularMarketPrice?: number;
        regularMarketTime?: number;
        symbol?: string;
      };
    }[];
  };
};

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase();
}

function unavailableResult(input: {
  message: string;
  requestedSymbol: string;
  symbol: string;
}): MarketQuoteResult<EquityQuote> {
  const updatedAt = new Date().toISOString();
  const error: MarketQuoteError = {
    assetType: "equity",
    message: input.message,
    provider: "yahoo_finance",
    sourceStatus: "unavailable",
    symbol: input.symbol,
    updatedAt,
  };

  return {
    error,
    quote: null,
    requestedSymbol: input.requestedSymbol,
    sourceStatus: "unavailable",
    symbol: input.symbol,
  };
}

function marketStateFromYahoo(instrumentType?: string): MarketQuoteState {
  return instrumentType ? "unknown" : "unknown";
}

function toNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function buildYahooUrl(symbol: string) {
  const encodedSymbol = encodeURIComponent(symbol);
  return `https://query1.finance.yahoo.com/v8/finance/chart/${encodedSymbol}?interval=1d&range=1d`;
}

export function isSupportedYahooEquitySymbol(symbol: string) {
  return SUPPORTED_EQUITY_SYMBOLS.has(normalizeSymbol(symbol));
}

export async function fetchYahooEquityQuote(
  symbol: string,
): Promise<MarketQuoteResult<EquityQuote>> {
  const requestedSymbol = symbol;
  const normalizedSymbol = normalizeSymbol(symbol);

  if (!normalizedSymbol || !isSupportedYahooEquitySymbol(normalizedSymbol)) {
    return unavailableResult({
      message: "Symbol is not supported by the v4.20 Yahoo Finance equity provider.",
      requestedSymbol,
      symbol: normalizedSymbol,
    });
  }

  try {
    const response = await fetch(buildYahooUrl(normalizedSymbol), {
      cache: "no-store",
      headers: {
        accept: "application/json",
      },
    });

    if (!response.ok) {
      return unavailableResult({
        message: `Yahoo Finance request failed with status ${response.status}.`,
        requestedSymbol,
        symbol: normalizedSymbol,
      });
    }

    const payload = (await response.json()) as YahooChartResponse;
    const chartError = payload.chart?.error;

    if (chartError) {
      return unavailableResult({
        message:
          chartError.description ??
          chartError.code ??
          "Yahoo Finance returned an unavailable chart response.",
        requestedSymbol,
        symbol: normalizedSymbol,
      });
    }

    const meta = payload.chart?.result?.[0]?.meta;
    const price = toNumber(meta?.regularMarketPrice);

    if (price === null) {
      return unavailableResult({
        message: "Yahoo Finance response did not include a usable regular market price.",
        requestedSymbol,
        symbol: normalizedSymbol,
      });
    }

    const previousClose = toNumber(meta?.previousClose);
    const change = previousClose === null ? null : price - previousClose;
    const changePercent =
      previousClose === null || previousClose === 0
        ? null
        : (change ?? 0) / previousClose * 100;
    const updatedAt = meta?.regularMarketTime
      ? new Date(meta.regularMarketTime * 1000).toISOString()
      : new Date().toISOString();
    const quote: EquityQuote = {
      assetType: "equity",
      change,
      changePercent,
      currency: meta?.currency ?? "USD",
      exchange: meta?.exchangeName ?? null,
      marketState: marketStateFromYahoo(meta?.instrumentType),
      price,
      provider: "yahoo_finance",
      sourceStatus: "delayed",
      symbol: normalizeSymbol(meta?.symbol ?? normalizedSymbol),
      updatedAt,
    };

    return {
      error: null,
      quote,
      requestedSymbol,
      sourceStatus: quote.sourceStatus,
      symbol: quote.symbol,
    };
  } catch (error) {
    return unavailableResult({
      message:
        error instanceof Error
          ? error.message
          : "Yahoo Finance request failed before a quote could be returned.",
      requestedSymbol,
      symbol: normalizedSymbol,
    });
  }
}

export async function fetchYahooEquityQuotes(
  symbols: string[],
): Promise<MarketQuoteResult<EquityQuote>[]> {
  const dedupedSymbols = Array.from(new Set(symbols.map(normalizeSymbol).filter(Boolean)));
  return Promise.all(dedupedSymbols.map((symbol) => fetchYahooEquityQuote(symbol)));
}
