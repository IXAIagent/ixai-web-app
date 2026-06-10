export type PortfolioPosition = {
  assetId: string;
  costBasis: number | null;
  createdAt: string;
  id: string;
  marketValue: number | null;
  quantity: number;
  unrealizedPnl: number | null;
  unrealizedPnlPct: number | null;
  updatedAt: string;
};
