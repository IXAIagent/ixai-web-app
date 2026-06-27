import type { YahooMarketState, YahooQuote } from "@/src/lib/market-data/yahoo/yahoo-quote-types";

type YahooChartResult = {
  meta?: {
    chartPreviousClose?: number;
    currency?: string;
    currentTradingPeriod?: unknown;
    exchangeTimezoneName?: string;
    firstTradeDate?: number;
    fullExchangeName?: string;
    gmtoffset?: number;
    instrumentType?: string;
    marketState?: string;
    previousClose?: number;
    regularMarketPrice?: number;
    regularMarketTime?: number;
    symbol?: string;
    timezone?: string;
  };
};

type YahooChartResponse = {
  chart?: {
    error?: {
      code?: string;
      description?: string;
    } | null;
    result?: YahooChartResult[] | null;
  };
};

function asFiniteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function normalizeYahooSymbol(symbol: string) {
  return symbol.trim().toUpperCase();
}

export function normalizeYahooMarketState(value: unknown): YahooMarketState {
  if (typeof value !== "string") {
    return "unknown";
  }

  const normalized = value.trim().toUpperCase();

  if (normalized === "REGULAR") return "regular";
  if (normalized === "PRE" || normalized === "PREMARKET") return "premarket";
  if (normalized === "POST" || normalized === "POSTMARKET") return "postmarket";
  if (normalized === "CLOSED") return "closed";

  return "unknown";
}

export function buildUnavailableYahooQuote(symbol: string, errorMessage: string): YahooQuote {
  return {
    asOf: null,
    change: null,
    changePercent: null,
    currency: null,
    dataQuality: "unavailable",
    errorMessage,
    marketState: "unknown",
    previousClose: null,
    price: null,
    source: "yahoo",
    symbol: normalizeYahooSymbol(symbol),
  };
}

export function normalizeYahooChartResponse(
  symbol: string,
  payload: YahooChartResponse,
): YahooQuote {
  const error = payload.chart?.error;

  if (error) {
    return buildUnavailableYahooQuote(
      symbol,
      error.description ?? error.code ?? "Yahoo quote response returned an error.",
    );
  }

  const result = payload.chart?.result?.[0];
  const meta = result?.meta;

  if (!meta) {
    return buildUnavailableYahooQuote(symbol, "Yahoo quote response did not include metadata.");
  }

  const price = asFiniteNumber(meta.regularMarketPrice);
  const previousClose =
    asFiniteNumber(meta.previousClose) ?? asFiniteNumber(meta.chartPreviousClose);
  const change =
    price !== null && previousClose !== null ? price - previousClose : null;
  const changePercent =
    change !== null && previousClose !== null && previousClose !== 0
      ? (change / previousClose) * 100
      : null;
  const regularMarketTime = asFiniteNumber(meta.regularMarketTime);

  return {
    asOf: regularMarketTime ? new Date(regularMarketTime * 1000).toISOString() : null,
    change,
    changePercent,
    currency: typeof meta.currency === "string" ? meta.currency : null,
    dataQuality: price === null ? "unavailable" : "live",
    errorMessage: price === null ? "Yahoo quote response did not include a usable price." : undefined,
    marketState: normalizeYahooMarketState(meta.marketState),
    previousClose,
    price,
    source: "yahoo",
    symbol: normalizeYahooSymbol(meta.symbol ?? symbol),
  };
}
