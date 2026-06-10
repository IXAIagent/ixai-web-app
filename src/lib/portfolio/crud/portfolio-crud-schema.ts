import type {
  PortfolioInputAssetCategory,
  PortfolioInputRegion,
} from "@/src/lib/portfolio/input/asset-types";
import type {
  PortfolioCrudAssetInput,
  PortfolioCrudValidationResult,
} from "@/src/lib/portfolio/crud/portfolio-crud-types";

export const PORTFOLIO_CRUD_ASSET_CATEGORIES: PortfolioInputAssetCategory[] = [
  "FCN",
  "STOCK",
  "CRYPTO",
  "GRID",
  "DUAL",
  "CASH",
];

export const PORTFOLIO_CRUD_REGIONS: PortfolioInputRegion[] = [
  "TW",
  "HK",
  "CN",
  "JP",
  "KR",
  "US",
  "EU",
  "GLOBAL",
];

export const PORTFOLIO_CRUD_CURRENCIES = [
  "USD",
  "TWD",
  "USDT",
  "HKD",
  "JPY",
  "KRW",
  "EUR",
] as const;

export type PortfolioCrudCurrency = (typeof PORTFOLIO_CRUD_CURRENCIES)[number];

export const DEFAULT_PORTFOLIO_CRUD_INPUT: PortfolioCrudAssetInput = {
  category: "FCN",
  currency: "USD",
  name: "",
  notes: "",
  region: "GLOBAL",
};

export function validatePortfolioCrudAssetInput(
  input: PortfolioCrudAssetInput,
): PortfolioCrudValidationResult {
  const errors: PortfolioCrudValidationResult["errors"] = {};

  if (!input.name.trim()) {
    errors.name = "請輸入 Asset Name";
  }

  if (!PORTFOLIO_CRUD_ASSET_CATEGORIES.includes(input.category)) {
    errors.category = "請選擇有效資產類別";
  }

  if (!PORTFOLIO_CRUD_REGIONS.includes(input.region)) {
    errors.region = "請選擇有效市場區域";
  }

  if (!PORTFOLIO_CRUD_CURRENCIES.includes(input.currency as PortfolioCrudCurrency)) {
    errors.currency = "請選擇有效幣別";
  }

  return {
    errors,
    ok: Object.keys(errors).length === 0,
  };
}
