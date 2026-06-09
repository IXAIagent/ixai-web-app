export type AssetCategory = "CASH" | "CRYPTO" | "DUAL" | "FCN" | "GRID" | "STOCK";

export type PortfolioAssetCategoryCounts = Record<AssetCategory, number>;

export type PortfolioAssetSummary = {
  category: AssetCategory;
  count: number;
  sharePct: number | null;
  valueApprox: number;
};

export type PortfolioAssetSummaryInput = {
  cashValueApprox?: number;
  cryptoCount: number;
  cryptoDualCount: number;
  cryptoGridCount: number;
  cryptoMarketValueApprox: number;
  fcnCount: number;
  fcnNotionalApprox: number;
  stockCount: number;
  stockMarketValueApprox: number;
};

export const PORTFOLIO_ASSET_CATEGORIES: AssetCategory[] = [
  "FCN",
  "STOCK",
  "CRYPTO",
  "GRID",
  "DUAL",
  "CASH",
];

export const EMPTY_ASSET_CATEGORY_COUNTS: PortfolioAssetCategoryCounts = {
  CASH: 0,
  CRYPTO: 0,
  DUAL: 0,
  FCN: 0,
  GRID: 0,
  STOCK: 0,
};

function safeNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : 0;
}

function buildSummaryItem(input: {
  category: AssetCategory;
  count: number;
  totalValueApprox: number;
  valueApprox: number;
}): PortfolioAssetSummary {
  const valueApprox = safeNumber(input.valueApprox);

  return {
    category: input.category,
    count: Math.max(0, input.count),
    sharePct:
      input.totalValueApprox > 0 && valueApprox > 0
        ? (valueApprox / input.totalValueApprox) * 100
        : null,
    valueApprox,
  };
}

export function buildPortfolioAssetSummary(input: PortfolioAssetSummaryInput) {
  const counts: PortfolioAssetCategoryCounts = {
    CASH: 0,
    CRYPTO: Math.max(0, input.cryptoCount),
    DUAL: Math.max(0, input.cryptoDualCount),
    FCN: Math.max(0, input.fcnCount),
    GRID: Math.max(0, input.cryptoGridCount),
    STOCK: Math.max(0, input.stockCount),
  };
  const cashValueApprox = safeNumber(input.cashValueApprox);
  const fcnValueApprox = safeNumber(input.fcnNotionalApprox);
  const stockValueApprox = safeNumber(input.stockMarketValueApprox);
  const cryptoValueApprox = safeNumber(input.cryptoMarketValueApprox);
  const totalValueApprox =
    cashValueApprox + fcnValueApprox + stockValueApprox + cryptoValueApprox;

  return {
    assetAllocationSummary: PORTFOLIO_ASSET_CATEGORIES.map((category) => {
      if (category === "FCN") {
        return buildSummaryItem({
          category,
          count: counts.FCN,
          totalValueApprox,
          valueApprox: fcnValueApprox,
        });
      }

      if (category === "STOCK") {
        return buildSummaryItem({
          category,
          count: counts.STOCK,
          totalValueApprox,
          valueApprox: stockValueApprox,
        });
      }

      if (category === "CRYPTO") {
        return buildSummaryItem({
          category,
          count: counts.CRYPTO,
          totalValueApprox,
          valueApprox: cryptoValueApprox,
        });
      }

      if (category === "CASH") {
        return buildSummaryItem({
          category,
          count: counts.CASH,
          totalValueApprox,
          valueApprox: cashValueApprox,
        });
      }

      return buildSummaryItem({
        category,
        count: counts[category],
        totalValueApprox,
        valueApprox: 0,
      });
    }),
    assetCategoryCounts: counts,
    portfolioAssetCategories: PORTFOLIO_ASSET_CATEGORIES,
  };
}
