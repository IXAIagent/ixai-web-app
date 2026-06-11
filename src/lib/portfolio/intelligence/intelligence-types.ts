import type { PortfolioInputAssetCategory } from "@/src/lib/portfolio/input/asset-types";

export type IntelligenceUniverseSource =
  | "asset_symbol"
  | "cash_ignored"
  | "fcn_underlying"
  | "grid_or_dual_symbol";

export type IntelligenceTrackedSymbol = {
  category: PortfolioInputAssetCategory;
  source: IntelligenceUniverseSource;
  sourceAssetId: string;
  sourceAssetName: string;
  symbol: string;
};

export type PortfolioIntelligenceUniverse = {
  ignoredCashCount: number;
  sourceCount: number;
  symbols: string[];
  totalTrackedSymbols: number;
  trackedSymbols: IntelligenceTrackedSymbol[];
};
