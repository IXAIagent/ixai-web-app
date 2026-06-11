import type { PortfolioNewsProvider } from "@/src/lib/portfolio/news/news-provider";
import type { PortfolioNewsCategory, PortfolioNewsItem } from "@/src/lib/portfolio/news/news-types";

const SUPPORTED_SYMBOLS = [
  "AAPL",
  "AVGO",
  "BTC",
  "ETH",
  "GOOGL",
  "MDB",
  "MSFT",
  "NVDA",
  "ORCL",
  "PLTR",
  "TSLA",
] as const;

const CRYPTO_SYMBOLS = new Set(["BTC", "ETH"]);
const FCN_UNDERLYING_SYMBOLS = new Set(["MDB", "ORCL", "MSFT", "NVDA", "AVGO", "TSLA"]);

function buildCategory(symbol: string): PortfolioNewsCategory {
  if (CRYPTO_SYMBOLS.has(symbol)) {
    return "crypto";
  }

  if (FCN_UNDERLYING_SYMBOLS.has(symbol)) {
    return "fcn_underlying";
  }

  return "stock";
}

function buildMockNewsItem(symbol: string): PortfolioNewsItem {
  return {
    category: buildCategory(symbol),
    id: `mock-news-${symbol.toLowerCase()}`,
    publishedAt: "2026-06-11T00:00:00.000Z",
    source: "IXAI Mock News Provider",
    summary: `${symbol} is included in the current portfolio intelligence universe for future holding-aware news monitoring.`,
    symbol,
    title: `${symbol} monitoring signal for portfolio news foundation`,
    url: `https://app.ixuan.ai/my-ixai/portfolio?symbol=${encodeURIComponent(symbol)}`,
  };
}

export const mockNewsProvider: PortfolioNewsProvider = {
  async getNewsForSymbols(symbols) {
    const supported = new Set<string>(SUPPORTED_SYMBOLS);

    return symbols
      .filter((symbol) => supported.has(symbol))
      .map(buildMockNewsItem);
  },
};
