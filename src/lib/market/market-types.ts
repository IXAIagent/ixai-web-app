export type MarketAssetType =
  | "crypto"
  | "currency"
  | "equity"
  | "etf"
  | "fcn_underlying"
  | "index"
  | "unknown";

export type MarketRegion =
  | "CN"
  | "EU"
  | "GLOBAL"
  | "HK"
  | "JP"
  | "KR"
  | "SG"
  | "TW"
  | "US";

export type MarketProviderStatus =
  | "disabled"
  | "mock"
  | "placeholder"
  | "ready"
  | "unavailable";

export type MarketPriceStatus =
  | "delayed"
  | "mock"
  | "placeholder"
  | "realtime"
  | "unavailable";

export type MarketNewsCategory =
  | "crypto"
  | "fcn"
  | "macro"
  | "market"
  | "portfolio"
  | "stock";

export interface MarketQuote {
  assetType: MarketAssetType;
  currency: string;
  dailyChangePercent: number | null;
  marketStatus: MarketPriceStatus;
  name: string;
  price: number | null;
  providerId: string;
  region: MarketRegion;
  symbol: string;
  updatedAt: string;
}

export interface MarketSnapshot {
  generatedAt: string;
  providerId: string;
  quotes: MarketQuote[];
  requestedSymbols: string[];
  status: MarketProviderStatus;
  warnings: string[];
}

export interface MarketNews {
  category: MarketNewsCategory;
  id: string;
  providerId: string;
  publishedAt: string;
  source: string;
  summary: string;
  symbol: string | null;
  title: string;
  url: string | null;
}

export interface MarketNewsSnapshot {
  generatedAt: string;
  items: MarketNews[];
  providerId: string;
  requestedSymbols: string[];
  status: MarketProviderStatus;
  warnings: string[];
}
