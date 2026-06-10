import type { PortfolioInputRegion } from "@/src/lib/portfolio/input/asset-types";

export type PortfolioAccountProvider =
  | "BINANCE"
  | "BYBIT"
  | "CSV"
  | "CTBC"
  | "FIRSTRRADE"
  | "FUBON"
  | "IBKR"
  | "MANUAL"
  | "OKX"
  | "YUANTA";

export type PortfolioAccountType =
  | "bank"
  | "brokerage"
  | "crypto_exchange"
  | "manual"
  | "structured_product";

export type PortfolioAccount = {
  accountType: PortfolioAccountType;
  createdAt: string;
  currency: string;
  id: string;
  isActive: boolean;
  name: string;
  provider: PortfolioAccountProvider;
  region: PortfolioInputRegion;
  updatedAt: string;
  userId: string;
};
