import type { MarketQuote } from "@/src/lib/market-data/types";

const nowIso = () => new Date().toISOString();

export function normalizeMarketSymbol(symbol: string): string {
  const normalized = symbol.trim().toUpperCase();

  if (normalized === "TWD=X") {
    return "USDTWD=X";
  }

  if (normalized === "VIX") {
    return "^VIX";
  }

  if (normalized === "TNX" || normalized === "US10Y") {
    return "^TNX";
  }

  if (normalized === "DXY") {
    return "DX-Y.NYB";
  }

  if (normalized === "TSMC") {
    return "TSM";
  }

  if (normalized === "2330" || normalized === "0050") {
    return `${normalized}.TW`;
  }

  return normalized;
}

const fallbackQuoteMap: Record<string, Omit<MarketQuote, "updatedAt">> = {
  BTC: {
    symbol: "BTC",
    name: "Bitcoin",
    price: "$104,860",
    dailyChange: "-0.28%",
    direction: "down",
    source: "fallback-mock",
    sourceLabel: "備援資料",
    status: "simulated",
  },
  SOL: {
    symbol: "SOL",
    name: "Solana",
    price: "$168.20",
    dailyChange: "+0.32%",
    direction: "up",
    source: "fallback-mock",
    sourceLabel: "備援資料",
    status: "simulated",
  },
  ETH: {
    symbol: "ETH",
    name: "Ethereum",
    price: "$3,820",
    dailyChange: "+0.09%",
    direction: "flat",
    source: "fallback-mock",
    sourceLabel: "備援資料",
    status: "simulated",
  },
  SPY: {
    symbol: "SPY",
    name: "S&P 500 ETF",
    price: "$621.40",
    dailyChange: "+0.42%",
    direction: "up",
    source: "fallback-mock",
    sourceLabel: "備援資料",
    status: "simulated",
  },
  QQQ: {
    symbol: "QQQ",
    name: "Nasdaq 100 ETF",
    price: "$537.18",
    dailyChange: "+0.61%",
    direction: "up",
    source: "fallback-mock",
    sourceLabel: "備援資料",
    status: "simulated",
  },
  NVDA: {
    symbol: "NVDA",
    name: "NVIDIA",
    price: "$138.22",
    dailyChange: "+1.18%",
    direction: "up",
    source: "fallback-mock",
    sourceLabel: "備援資料",
    status: "simulated",
  },
  TSM: {
    symbol: "TSM",
    name: "台積電 ADR",
    price: "$186.72",
    dailyChange: "+0.74%",
    direction: "up",
    source: "fallback-mock",
    sourceLabel: "備援資料",
    status: "simulated",
  },
  "0050.TW": {
    symbol: "0050.TW",
    name: "元大台灣50",
    price: "NT$196.40",
    dailyChange: "+0.35%",
    direction: "up",
    source: "fallback-mock",
    sourceLabel: "備援資料",
    status: "simulated",
  },
  "2330.TW": {
    symbol: "2330.TW",
    name: "台積電",
    price: "NT$1,045",
    dailyChange: "+0.48%",
    direction: "up",
    source: "fallback-mock",
    sourceLabel: "備援資料",
    status: "simulated",
  },
  "2382.TW": {
    symbol: "2382.TW",
    name: "廣達",
    price: "資料不可用",
    dailyChange: "--",
    direction: "flat",
    source: "taiwan-fallback",
    sourceLabel: "備援資料",
    status: "unavailable",
  },
  "3231.TW": {
    symbol: "3231.TW",
    name: "緯創",
    price: "資料不可用",
    dailyChange: "--",
    direction: "flat",
    source: "taiwan-fallback",
    sourceLabel: "備援資料",
    status: "unavailable",
  },
  "2376.TW": {
    symbol: "2376.TW",
    name: "技嘉",
    price: "資料不可用",
    dailyChange: "--",
    direction: "flat",
    source: "taiwan-fallback",
    sourceLabel: "備援資料",
    status: "unavailable",
  },
  "6669.TW": {
    symbol: "6669.TW",
    name: "緯穎",
    price: "資料不可用",
    dailyChange: "--",
    direction: "flat",
    source: "taiwan-fallback",
    sourceLabel: "備援資料",
    status: "unavailable",
  },
  "3017.TW": {
    symbol: "3017.TW",
    name: "奇鋐",
    price: "資料不可用",
    dailyChange: "--",
    direction: "flat",
    source: "taiwan-fallback",
    sourceLabel: "備援資料",
    status: "unavailable",
  },
  "3324.TW": {
    symbol: "3324.TW",
    name: "雙鴻",
    price: "資料不可用",
    dailyChange: "--",
    direction: "flat",
    source: "taiwan-fallback",
    sourceLabel: "備援資料",
    status: "unavailable",
  },
  "2308.TW": {
    symbol: "2308.TW",
    name: "台達電",
    price: "資料不可用",
    dailyChange: "--",
    direction: "flat",
    source: "taiwan-fallback",
    sourceLabel: "備援資料",
    status: "unavailable",
  },
  "2454.TW": {
    symbol: "2454.TW",
    name: "聯發科",
    price: "資料不可用",
    dailyChange: "--",
    direction: "flat",
    source: "taiwan-fallback",
    sourceLabel: "備援資料",
    status: "unavailable",
  },
  "USDTWD=X": {
    symbol: "USDTWD=X",
    name: "USD/TWD 美金兌台幣",
    price: "資料不可用",
    dailyChange: "--",
    direction: "flat",
    source: "macro-fallback",
    sourceLabel: "備援資料",
    status: "unavailable",
  },
  "GC=F": {
    symbol: "GC=F",
    name: "黃金期貨",
    price: "資料不可用",
    dailyChange: "--",
    direction: "flat",
    source: "macro-fallback",
    sourceLabel: "備援資料",
    status: "unavailable",
  },
  "SI=F": {
    symbol: "SI=F",
    name: "白銀期貨",
    price: "資料不可用",
    dailyChange: "--",
    direction: "flat",
    source: "macro-fallback",
    sourceLabel: "備援資料",
    status: "unavailable",
  },
  "^VIX": {
    symbol: "^VIX",
    name: "VIX 波動率指數",
    price: "資料不可用",
    dailyChange: "--",
    direction: "flat",
    source: "sentiment-fallback",
    sourceLabel: "備援資料",
    status: "unavailable",
  },
  "^TNX": {
    symbol: "^TNX",
    name: "美國 10 年期公債殖利率",
    price: "資料不可用",
    dailyChange: "--",
    direction: "flat",
    source: "sentiment-fallback",
    sourceLabel: "備援資料",
    status: "unavailable",
  },
  "DX-Y.NYB": {
    symbol: "DX-Y.NYB",
    name: "DXY 美元指數",
    price: "資料不可用",
    dailyChange: "--",
    direction: "flat",
    source: "sentiment-fallback",
    sourceLabel: "備援資料",
    status: "unavailable",
  },
};

export function getFallbackMarketQuote(symbol: string): MarketQuote {
  const normalized = normalizeMarketSymbol(symbol);
  const quote = fallbackQuoteMap[normalized];

  if (!quote) {
    return {
      symbol: normalized,
      name: normalized,
      price: "資料不可用",
      dailyChange: "--",
      direction: "flat",
      source: "fallback-mock",
      sourceLabel: "備援資料",
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

export const defaultMarketSymbols = ["BTC", "ETH", "SOL", "SPY", "QQQ", "NVDA", "TSM", "2330.TW", "0050.TW"];

export const macroMarketSymbols = ["USDTWD=X", "GC=F", "SI=F"];

export const marketSentimentSymbols = ["^VIX", "^TNX", "DX-Y.NYB"];

export const aiSupplyChainSymbols = [
  "2330.TW",
  "2382.TW",
  "3231.TW",
  "2376.TW",
  "6669.TW",
  "3017.TW",
  "3324.TW",
  "2308.TW",
  "2454.TW",
];
