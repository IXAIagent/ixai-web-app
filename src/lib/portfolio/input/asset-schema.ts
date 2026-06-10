import type {
  PortfolioInputAssetCategory,
  PortfolioInputMode,
  PortfolioInputRegion,
} from "@/src/lib/portfolio/input/asset-types";

export interface PortfolioInputAssetBase {
  accountAlias?: string;
  brokerName?: string;
  category: PortfolioInputAssetCategory;
  costBasis?: number;
  currency?: string;
  displayName?: string;
  inputMode: PortfolioInputMode;
  marketValue?: number;
  notes?: string;
  quantity?: number;
  region?: PortfolioInputRegion;
  symbol?: string;
  valuationDate?: string;
}

export interface FcnInputDraft extends PortfolioInputAssetBase {
  category: "FCN";
  issuer?: string;
  notionalAmount?: number;
  underlyingSymbols?: string[];
}

export interface StockInputDraft extends PortfolioInputAssetBase {
  category: "STOCK";
  market?: "HK" | "JP" | "OTHER" | "TW" | "US";
}

export interface CryptoInputDraft extends PortfolioInputAssetBase {
  category: "CRYPTO";
  exchangeName?: string;
  walletAlias?: string;
}

export interface GridInputDraft extends PortfolioInputAssetBase {
  category: "GRID";
  gridCount?: number;
  lowerPrice?: number;
  upperPrice?: number;
}

export interface DualInputDraft extends PortfolioInputAssetBase {
  category: "DUAL";
  settlementDate?: string;
  targetPrice?: number;
}

export interface CashInputDraft extends PortfolioInputAssetBase {
  category: "CASH";
  accountType?: "bank" | "brokerage" | "wallet";
}

export type PortfolioInputAssetDraft =
  | CashInputDraft
  | CryptoInputDraft
  | DualInputDraft
  | FcnInputDraft
  | GridInputDraft
  | StockInputDraft;
