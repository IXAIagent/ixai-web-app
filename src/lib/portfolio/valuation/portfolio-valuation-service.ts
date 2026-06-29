"use client";

import type { MarketQuote, MarketQuoteResult } from "@/src/lib/market/types";
import { loadPortfolioTruthReadback } from "@/src/lib/portfolio/truth/portfolio-truth-client";
import { buildPortfolioValuation } from "@/src/lib/portfolio/valuation/portfolio-valuation-engine";
import type { PortfolioValuationResult } from "@/src/lib/portfolio/valuation/portfolio-valuation-types";

type LiveQuotesApiResponse = {
  error?: string;
  ok: boolean;
  quotes?: MarketQuoteResult<MarketQuote>[];
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
      message: "Quote unavailable from internal live quote API route.",
      provider: "unknown",
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

async function getClientSafeMarketQuotes(symbols: string[]): Promise<MarketQuoteResult<MarketQuote>[]> {
  const requestedSymbols = Array.from(new Set(symbols.map(normalizeSymbol).filter(Boolean)));

  if (requestedSymbols.length === 0) {
    return [];
  }

  try {
    const response = await fetch(
      `/api/market/live-quotes?symbols=${encodeURIComponent(requestedSymbols.join(","))}`,
      {
        cache: "no-store",
      },
    );
    const payload = (await response.json().catch(() => ({}))) as LiveQuotesApiResponse;

    if (!response.ok || !payload.ok || !payload.quotes) {
      return requestedSymbols.map(unavailableQuoteResult);
    }

    const resultBySymbol = new Map<string, MarketQuoteResult<MarketQuote>>();

    payload.quotes.forEach((result) => {
      resultBySymbol.set(normalizeSymbol(result.symbol), result);
      resultBySymbol.set(normalizeSymbol(result.requestedSymbol), result);
    });

    return requestedSymbols.map(
      (symbol) => resultBySymbol.get(normalizeSymbol(symbol)) ?? unavailableQuoteResult(symbol),
    );
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
