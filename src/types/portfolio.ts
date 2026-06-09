export const PORTFOLIO_BASE_CURRENCIES = ["USD", "TWD", "USDT"] as const;
export const PORTFOLIO_STATUSES = ["active", "archived"] as const;

export type BaseCurrency = (typeof PORTFOLIO_BASE_CURRENCIES)[number];
export type PortfolioStatus = (typeof PORTFOLIO_STATUSES)[number];

export type Portfolio = {
  id: string;
  userId: string;
  name: string;
  baseCurrency: BaseCurrency;
  description: string | null;
  status: PortfolioStatus;
  createdAt: string;
  updatedAt: string;
};

export type PortfolioCreateInput = {
  name: string;
  baseCurrency?: BaseCurrency;
  description?: string | null;
};

export type PortfolioUpdateInput = {
  name?: string;
  baseCurrency?: BaseCurrency;
  description?: string | null;
  status?: PortfolioStatus;
};

export type PortfolioRow = {
  id: string;
  user_id: string;
  name: string;
  base_currency: BaseCurrency;
  description: string | null;
  status: PortfolioStatus;
  created_at: string;
  updated_at: string;
};
