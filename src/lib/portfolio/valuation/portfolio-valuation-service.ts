"use client";

import { getMarketQuotes } from "@/src/lib/market/market-service";
import { loadPortfolioTruthReadback } from "@/src/lib/portfolio/truth/portfolio-truth-client";
import { buildPortfolioValuation } from "@/src/lib/portfolio/valuation/portfolio-valuation-engine";
import type { PortfolioValuationResult } from "@/src/lib/portfolio/valuation/portfolio-valuation-types";

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

export async function getPortfolioValuation(): Promise<PortfolioValuationResult> {
  const truth = await loadPortfolioTruthReadback();
  const symbols = collectQuoteSymbols({
    cryptoSymbols: truth.symbols.cryptoSymbols,
    stockSymbols: truth.symbols.stockSymbols,
  });
  const marketQuotes = symbols.length > 0 ? await getMarketQuotes(symbols) : [];

  return buildPortfolioValuation({
    marketQuotes,
    truth,
  });
}

export async function getWorkspacePortfolioValuation() {
  return getPortfolioValuation();
}
