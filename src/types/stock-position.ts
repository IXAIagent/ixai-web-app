export const STOCK_MARKETS = ["US", "TW", "HK", "JP", "OTHER"] as const;
export const STOCK_CURRENCIES = ["USD", "TWD", "USDT", "HKD", "JPY"] as const;
export const STOCK_POSITION_TYPES = ["equity", "etf", "other"] as const;
export const STOCK_POSITION_STATUSES = ["active", "closed", "archived"] as const;

export type StockMarket = (typeof STOCK_MARKETS)[number];
export type StockCurrency = (typeof STOCK_CURRENCIES)[number];
export type StockPositionType = (typeof STOCK_POSITION_TYPES)[number];
export type StockPositionStatus = (typeof STOCK_POSITION_STATUSES)[number];

export type StockPosition = {
  id: string;
  userId: string;
  portfolioId: string;
  symbol: string;
  name: string | null;
  market: StockMarket;
  currency: StockCurrency;
  quantity: number;
  averageCost: number | null;
  currentPrice: number | null;
  positionType: StockPositionType;
  status: StockPositionStatus;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type StockPositionCreateInput = {
  portfolioId: string;
  symbol: string;
  name?: string | null;
  market?: StockMarket;
  currency?: StockCurrency;
  quantity?: number;
  averageCost?: number | null;
  currentPrice?: number | null;
  positionType?: StockPositionType;
  metadata?: Record<string, unknown>;
};

export type StockPositionUpdateInput = {
  symbol?: string;
  name?: string | null;
  market?: StockMarket;
  currency?: StockCurrency;
  quantity?: number;
  averageCost?: number | null;
  currentPrice?: number | null;
  positionType?: StockPositionType;
  status?: StockPositionStatus;
  metadata?: Record<string, unknown>;
};

export type StockPositionRow = {
  id: string;
  user_id: string;
  portfolio_id: string;
  symbol: string;
  name: string | null;
  market: StockMarket;
  currency: StockCurrency;
  quantity: number;
  average_cost: number | null;
  current_price: number | null;
  position_type: StockPositionType;
  status: StockPositionStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};
