import type { MarketQuote } from "@/src/lib/market-data/types";

const nowIso = () => new Date().toISOString();

export function normalizeMarketSymbol(symbol: string): string {
  return symbol.trim().toUpperCase();
}

const fallbackQuoteMap: Record<string, Omit<MarketQuote, "updatedAt">> = {
  BTC: {
    symbol: "BTC",
    name: "Bitcoin",
    price: "$104,860",
    dailyChange: "-0.28%",
    direction: "down",
    source: "fallback-mock",
    sourceLabel: "Fallback Mock",
    status: "simulated",
  },
  ETH: {
    symbol: "ETH",
    name: "Ethereum",
    price: "$3,820",
    dailyChange: "+0.09%",
    direction: "flat",
    source: "fallback-mock",
    sourceLabel: "Fallback Mock",
    status: "simulated",
  },
  SPY: {
    symbol: "SPY",
    name: "S&P 500 ETF",
    price: "$621.40",
    dailyChange: "+0.42%",
    direction: "up",
    source: "yahoo-style-placeholder",
    sourceLabel: "Yahoo-style Placeholder",
    status: "simulated",
  },
  QQQ: {
    symbol: "QQQ",
    name: "Nasdaq 100 ETF",
    price: "$537.18",
    dailyChange: "+0.61%",
    direction: "up",
    source: "yahoo-style-placeholder",
    sourceLabel: "Yahoo-style Placeholder",
    status: "simulated",
  },
  NVDA: {
    symbol: "NVDA",
    name: "NVIDIA",
    price: "$138.22",
    dailyChange: "+1.18%",
    direction: "up",
    source: "yahoo-style-placeholder",
    sourceLabel: "Yahoo-style Placeholder",
    status: "simulated",
  },
  TSMC: {
    symbol: "TSMC",
    name: "台積電 ADR",
    price: "$186.72",
    dailyChange: "+0.74%",
    direction: "up",
    source: "yahoo-style-placeholder",
    sourceLabel: "Yahoo-style Placeholder",
    status: "simulated",
  },
  "2330": {
    symbol: "2330.TW",
    name: "台積電",
    price: "NT$1,045",
    dailyChange: "+0.48%",
    direction: "up",
    source: "taiwan-stock-placeholder",
    sourceLabel: "Taiwan Stock Placeholder",
    status: "simulated",
  },
  "2330.TW": {
    symbol: "2330.TW",
    name: "台積電",
    price: "NT$1,045",
    dailyChange: "+0.48%",
    direction: "up",
    source: "taiwan-stock-placeholder",
    sourceLabel: "Taiwan Stock Placeholder",
    status: "simulated",
  },
  VIX: {
    symbol: "VIX",
    name: "Volatility Index",
    price: "16.8",
    dailyChange: "-2.10%",
    direction: "down",
    source: "macro-placeholder",
    sourceLabel: "Macro Placeholder",
    status: "simulated",
  },
  DXY: {
    symbol: "DXY",
    name: "US Dollar Index",
    price: "104.2",
    dailyChange: "+0.04%",
    direction: "flat",
    source: "macro-placeholder",
    sourceLabel: "Macro Placeholder",
    status: "simulated",
  },
};

export function getFallbackMarketQuote(symbol: string): MarketQuote {
  const normalized = normalizeMarketSymbol(symbol);
  const quote = fallbackQuoteMap[normalized];

  if (!quote) {
    return {
      symbol: normalized,
      name: normalized,
      price: "暫無資料",
      dailyChange: "--",
      direction: "flat",
      source: "fallback-mock",
      sourceLabel: "Fallback Mock",
      status: "unavailable",
      updatedAt: nowIso(),
    };
  }

  return {
    ...quote,
    updatedAt: nowIso(),
  };
}

export function getFallbackMarketQuotes(symbols: string[]): MarketQuote[] {
  return symbols.map((symbol) => getFallbackMarketQuote(symbol));
}

export const defaultMarketSymbols = ["BTC", "ETH", "SPY", "QQQ", "NVDA", "TSMC", "2330.TW"];
