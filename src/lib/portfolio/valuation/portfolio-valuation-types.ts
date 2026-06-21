export type AssetClass = "cash" | "crypto" | "fcn" | "stock" | "unknown";

export type ValuationSourceStatus =
  | "delayed"
  | "fallback"
  | "live"
  | "partial"
  | "unavailable";

export type ValuationCurrency =
  | "HKD"
  | "JPY"
  | "MIXED"
  | "TWD"
  | "USD"
  | "USDT";

export interface ValuationWarning {
  code:
    | "fcn_placeholder"
    | "missing_cost"
    | "missing_position_data"
    | "missing_quote"
    | "mixed_currency"
    | "no_positions";
  message: string;
  positionId?: string;
  symbol?: string;
}

export interface PositionValuation {
  allocationPercent: number;
  assetClass: AssetClass;
  costBasis: number | null;
  currency: ValuationCurrency;
  fcnRiskStatus?: "partial" | "pending" | "unavailable";
  id: string;
  marketPrice: number | null;
  marketValue: number | null;
  name: string;
  nearestKiDistancePercent?: number | null;
  quantity: number | null;
  sourceStatus: ValuationSourceStatus;
  symbol: string;
  unrealizedPnl: number | null;
  unrealizedPnlPercent: number | null;
  warningMessage?: string;
  worstOfSymbol?: string | null;
}

export interface AssetClassValuation {
  allocationPercent: number;
  assetClass: AssetClass;
  costBasis: number;
  marketValue: number;
  positionCount: number;
  pricedPositionCount: number;
  sourceStatus: ValuationSourceStatus;
  unrealizedPnl: number;
  unrealizedPnlPercent: number | null;
}

export interface PortfolioValuationSummary {
  assetAllocation: AssetClassValuation[];
  positionCount: number;
  pricedPositionCount: number;
  sourceStatus: ValuationSourceStatus;
  totalCostBasis: number;
  totalMarketValue: number;
  totalUnrealizedPnl: number;
  totalUnrealizedPnlPercent: number | null;
  unpricedPositionCount: number;
  updatedAt: string;
  warnings: ValuationWarning[];
}

export interface PortfolioValuationResult {
  currency: ValuationCurrency;
  positions: PositionValuation[];
  summary: PortfolioValuationSummary;
}
