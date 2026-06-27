"use client";

import type { MarketQuote, MarketQuoteResult } from "@/src/lib/market/types";
import type { YahooQuoteSnapshot } from "@/src/lib/market-data/yahoo/yahoo-quote-types";
import { loadPortfolioTruthReadback } from "@/src/lib/portfolio/truth/portfolio-truth-client";
import { buildPortfolioValuation } from "@/src/lib/portfolio/valuation/portfolio-valuation-engine";
import type { PortfolioValuationResult } from "@/src/lib/portfolio/valuation/portfolio-valuation-types";

type YahooQuotesApiResponse = {
  data?: YahooQuoteSnapshot;
  error?: string;
  ok: boolean;
};

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase();
}

function quoteSymbolForCrypto(symbol: string) {
  const normalized = normalizeSymbol(symbol);

  if (normalized.endsWith("USDT")) {
    return normalized;
  }

  if (normalized === "BTC" || normalized === "ETH" || normalized === "BNB") {
    return `${normalized}USDT`;
  }

  return normalized;
}

function collectQuoteSymbols(input: {
  cryptoSymbols: string[];
  stockSymbols: string[];
}) {
  return Array.from(
    new Set([
      ...input.stockSymbols.map(normalizeSymbol),
      ...input.cryptoSymbols.map(quoteSymbolForCrypto),
    ].filter(Boolean)),
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

export async function getPortfolioValuation(): Promise<PortfolioValuationResult> {
  const truth = await loadPortfolioTruthReadback();
  const symbols = collectQuoteSymbols({
    cryptoSymbols: truth.symbols.cryptoSymbols,
    stockSymbols: truth.symbols.stockSymbols,
  });
  const marketQuotes = symbols.length > 0 ? await getClientSafeMarketQuotes(symbols) : [];

  return buildPortfolioValuation({
    marketQuotes,
    truth,
  });
}

export async function getWorkspacePortfolioValuation() {
  return getPortfolioValuation();
}
