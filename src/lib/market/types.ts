export type MarketAssetType = "crypto" | "equity";

export type MarketProviderName = "binance" | "mock" | "unknown" | "yahoo_finance";

export type MarketQuoteSourceStatus =
  | "delayed"
  | "fallback"
  | "live"
  | "stale"
  | "unavailable";

export type MarketQuoteState =
  | "closed"
  | "open"
  | "pre_market"
  | "post_market"
  | "unknown";

export interface MarketQuote {
  assetType: MarketAssetType;
  change: number | null;
  changePercent: number | null;
  currency: string;
  name?: string;
  marketState: MarketQuoteState;
  price: number | null;
  provider: MarketProviderName;
  sourceNote?: string;
  sourceStatus: MarketQuoteSourceStatus;
  symbol: string;
  updatedAt: string;
}

export interface EquityQuote extends MarketQuote {
  assetType: "equity";
  exchange: string | null;
  provider: "yahoo_finance";
}

export interface CryptoQuote extends MarketQuote {
  assetType: "crypto";
  baseAsset: string;
  provider: "binance";
  quoteAsset: string;
}

export interface MarketQuoteError {
  assetType: MarketAssetType | "unknown";
  message: string;
  provider: MarketProviderName;
  sourceStatus: "unavailable";
  symbol: string;
  updatedAt: string;
}

export interface MarketQuoteResult<TQuote extends MarketQuote = MarketQuote> {
  error: MarketQuoteError | null;
  quote: TQuote | null;
  requestedSymbol: string;
  sourceStatus: MarketQuoteSourceStatus;
  symbol: string;
}
