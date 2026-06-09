export const CRYPTO_CURRENCIES = ["USD", "TWD", "USDT", "HKD", "JPY"] as const;
export const CRYPTO_POSITION_TYPES = ["spot", "futures", "grid", "dual", "other"] as const;
export const CRYPTO_STRATEGY_TYPES = ["holding", "grid", "dual", "futures_grid", "other"] as const;
export const CRYPTO_POSITION_STATUSES = ["active", "closed", "archived"] as const;

export type CryptoCurrency = (typeof CRYPTO_CURRENCIES)[number];
export type CryptoPositionType = (typeof CRYPTO_POSITION_TYPES)[number];
export type CryptoStrategyType = (typeof CRYPTO_STRATEGY_TYPES)[number];
export type CryptoPositionStatus = (typeof CRYPTO_POSITION_STATUSES)[number];

export type CryptoPosition = {
  id: string;
  userId: string;
  portfolioId: string;
  symbol: string;
  name: string | null;
  exchange: string | null;
  currency: CryptoCurrency;
  quantity: number;
  averageCost: number | null;
  currentPrice: number | null;
  positionType: CryptoPositionType;
  strategyType: CryptoStrategyType;
  leverage: number | null;
  gridLowerPrice: number | null;
  gridUpperPrice: number | null;
  gridCount: number | null;
  dualTargetPrice: number | null;
  dualSettlementDate: string | null;
  status: CryptoPositionStatus;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type CryptoPositionCreateInput = {
  portfolioId: string;
  symbol: string;
  name?: string | null;
  exchange?: string | null;
  currency?: CryptoCurrency;
  quantity?: number;
  averageCost?: number | null;
  currentPrice?: number | null;
  positionType?: CryptoPositionType;
  strategyType?: CryptoStrategyType;
  leverage?: number | null;
  gridLowerPrice?: number | null;
  gridUpperPrice?: number | null;
  gridCount?: number | null;
  dualTargetPrice?: number | null;
  dualSettlementDate?: string | null;
  metadata?: Record<string, unknown>;
};

export type CryptoPositionUpdateInput = {
  symbol?: string;
  name?: string | null;
  exchange?: string | null;
  currency?: CryptoCurrency;
  quantity?: number;
  averageCost?: number | null;
  currentPrice?: number | null;
  positionType?: CryptoPositionType;
  strategyType?: CryptoStrategyType;
  leverage?: number | null;
  gridLowerPrice?: number | null;
  gridUpperPrice?: number | null;
  gridCount?: number | null;
  dualTargetPrice?: number | null;
  dualSettlementDate?: string | null;
  status?: CryptoPositionStatus;
  metadata?: Record<string, unknown>;
};

export type CryptoPositionRow = {
  id: string;
  user_id: string;
  portfolio_id: string;
  symbol: string;
  name: string | null;
  exchange: string | null;
  currency: CryptoCurrency;
  quantity: number;
  average_cost: number | null;
  current_price: number | null;
  position_type: CryptoPositionType;
  strategy_type: CryptoStrategyType;
  leverage: number | null;
  grid_lower_price: number | null;
  grid_upper_price: number | null;
  grid_count: number | null;
  dual_target_price: number | null;
  dual_settlement_date: string | null;
  status: CryptoPositionStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};
