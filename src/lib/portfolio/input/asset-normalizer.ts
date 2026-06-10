import type { PortfolioInputAssetCategory } from "@/src/lib/portfolio/input/asset-types";
import type {
  PortfolioInputAssetBase,
  PortfolioInputAssetDraft,
} from "@/src/lib/portfolio/input/asset-schema";

function cleanText(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function cleanNumber(value: number | undefined): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function normalizePortfolioInputAsset<T extends PortfolioInputAssetBase>(
  asset: T,
): T {
  return {
    ...asset,
    accountAlias: cleanText(asset.accountAlias),
    brokerName: cleanText(asset.brokerName),
    costBasis: cleanNumber(asset.costBasis),
    currency: cleanText(asset.currency)?.toUpperCase(),
    displayName: cleanText(asset.displayName),
    marketValue: cleanNumber(asset.marketValue),
    notes: cleanText(asset.notes),
    quantity: cleanNumber(asset.quantity),
    symbol: cleanText(asset.symbol)?.toUpperCase(),
    valuationDate: cleanText(asset.valuationDate),
  };
}

export function getDefaultAssetInputDraft(
  category: PortfolioInputAssetCategory = "FCN",
): PortfolioInputAssetDraft {
  const base = {
    inputMode: "manual" as const,
    region: "GLOBAL" as const,
  };

  switch (category) {
    case "CASH":
      return {
        ...base,
        category: "CASH",
        currency: "USD",
      };
    case "CRYPTO":
      return {
        ...base,
        category: "CRYPTO",
        currency: "USDT",
      };
    case "DUAL":
      return {
        ...base,
        category: "DUAL",
        currency: "USDT",
      };
    case "GRID":
      return {
        ...base,
        category: "GRID",
        currency: "USDT",
      };
    case "STOCK":
      return {
        ...base,
        category: "STOCK",
        currency: "USD",
      };
    case "FCN":
    default:
      return {
        ...base,
        category: "FCN",
        currency: "USD",
      };
  }
}
