import type {
  CryptoQuote,
  MarketQuoteError,
  MarketQuoteResult,
} from "@/src/lib/market/types";

const SUPPORTED_CRYPTO_SYMBOLS = new Set(["BTCUSDT", "ETHUSDT", "BNBUSDT"]);
const BINANCE_TIMEOUT_MS = 5_000;

type BinanceTickerResponse = {
  lastPrice?: string;
  priceChange?: string;
  priceChangePercent?: string;
  symbol?: string;
};

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase();
}

function unavailableResult(input: {
  message: string;
  requestedSymbol: string;
  symbol: string;
}): MarketQuoteResult<CryptoQuote> {
  const updatedAt = new Date().toISOString();
  const error: MarketQuoteError = {
    assetType: "crypto",
    message: input.message,
    provider: "binance",
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

function parseNumber(value: string | undefined) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function splitCryptoPair(symbol: string) {
  if (symbol.endsWith("USDT")) {
    return {
      baseAsset: symbol.slice(0, -4),
      quoteAsset: "USDT",
    };
  }

  return {
    baseAsset: symbol,
    quoteAsset: "USDT",
  };
}

function buildBinanceUrl(symbol: string) {
  return `https://api.binance.com/api/v3/ticker/24hr?symbol=${encodeURIComponent(symbol)}`;
}

export function isSupportedBinanceCryptoSymbol(symbol: string) {
  return SUPPORTED_CRYPTO_SYMBOLS.has(normalizeSymbol(symbol));
}

export async function fetchBinanceCryptoQuote(
  symbol: string,
): Promise<MarketQuoteResult<CryptoQuote>> {
  const requestedSymbol = symbol;
  const normalizedSymbol = normalizeSymbol(symbol);

  if (!normalizedSymbol || !isSupportedBinanceCryptoSymbol(normalizedSymbol)) {
    return unavailableResult({
      message: "Symbol is not supported by the v4.20 Binance crypto provider.",
      requestedSymbol,
      symbol: normalizedSymbol,
    });
  }

  try {
    const response = await fetch(buildBinanceUrl(normalizedSymbol), {
      cache: "no-store",
      headers: {
        accept: "application/json",
      },
      signal: AbortSignal.timeout(BINANCE_TIMEOUT_MS),
    });

    if (!response.ok) {
      return unavailableResult({
        message: `Binance request failed with status ${response.status}.`,
        requestedSymbol,
        symbol: normalizedSymbol,
      });
    }

    const payload = (await response.json()) as BinanceTickerResponse;
    const price = parseNumber(payload.lastPrice);

    if (price === null) {
      return unavailableResult({
        message: "Binance response did not include a usable last price.",
        requestedSymbol,
        symbol: normalizedSymbol,
      });
    }

    const normalizedResponseSymbol = normalizeSymbol(payload.symbol ?? normalizedSymbol);
    const { baseAsset, quoteAsset } = splitCryptoPair(normalizedResponseSymbol);
    const quote: CryptoQuote = {
      assetType: "crypto",
      baseAsset,
      change: parseNumber(payload.priceChange),
      changePercent: parseNumber(payload.priceChangePercent),
      currency: quoteAsset,
      marketState: "open",
      name: baseAsset,
      price,
      provider: "binance",
      quoteAsset,
      sourceNote: "Binance public 24hr ticker endpoint via IXAI server route.",
      sourceStatus: "live",
      symbol: normalizedResponseSymbol,
      updatedAt: new Date().toISOString(),
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
          : "Binance request failed before a quote could be returned.",
      requestedSymbol,
      symbol: normalizedSymbol,
    });
  }
}

export async function fetchBinanceCryptoQuotes(
  symbols: string[],
): Promise<MarketQuoteResult<CryptoQuote>[]> {
  const dedupedSymbols = Array.from(new Set(symbols.map(normalizeSymbol).filter(Boolean)));
  return Promise.all(dedupedSymbols.map((symbol) => fetchBinanceCryptoQuote(symbol)));
}
