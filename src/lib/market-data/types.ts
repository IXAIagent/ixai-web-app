export type MarketDirection = "up" | "down" | "flat";

export type MarketDataStatus = "real" | "realtime" | "delayed" | "fallback" | "simulated" | "unavailable";

export type MarketQuote = {
  symbol: string;
  name: string;
  price: string;
  dailyChange: string;
  direction: MarketDirection;
  source: string;
  sourceLabel: string;
  status: MarketDataStatus;
  updatedAt: string;
};

export type MarketQuoteProvider = {
  id: string;
  label: string;
  supports(symbol: string): boolean;
  getQuotes(symbols: string[]): Promise<MarketQuote[]>;
};

export type NewsProvider = {
  id: string;
  label: string;
  status: "placeholder" | "active";
  description: string;
};

export type MarketQuotesResponse = {
  quotes: MarketQuote[];
  disclaimer: string;
  requestedSymbols: string[];
  generatedAt: string;
};

export const MARKET_DATA_DISCLAIMER =
  "市場資料可能延遲，僅供資訊參考，不構成投資建議、買賣指令或報酬承諾。";
