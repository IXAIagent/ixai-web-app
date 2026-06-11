import type { PortfolioAccount } from "@/src/lib/portfolio/data-model/portfolio-account-types";
import type { PortfolioAsset } from "@/src/lib/portfolio/data-model/portfolio-asset-types";
import type { PortfolioExposureEngine } from "@/src/lib/portfolio/exposure/exposure-engine";
import type {
  PortfolioExposureCategory,
  PortfolioExposureInput,
  PortfolioExposureItem,
  PortfolioExposureReport,
} from "@/src/lib/portfolio/exposure/exposure-types";
import type { PortfolioMarketSnapshot } from "@/src/lib/portfolio/market-data/market-data-types";

const GENERATED_AT = "2026-06-11T00:00:00.000Z";
const STABLE_COIN_SUFFIXES = ["USDT", "USDC", "USD", "TWD", "HKD", "JPY"];

function normalizeSymbol(value: string | undefined) {
  return value?.trim().toUpperCase().replace(/[^A-Z0-9.-]/gu, "") ?? "";
}

function normalizeCryptoSymbol(value: string | undefined) {
  let symbol = normalizeSymbol(value);

  for (const suffix of STABLE_COIN_SUFFIXES) {
    if (symbol.length > suffix.length && symbol.endsWith(suffix)) {
      symbol = symbol.slice(0, -suffix.length);
      break;
    }
  }

  return symbol;
}

function readUnderlyingSymbols(asset: PortfolioAsset) {
  const underlyings = asset.metadata?.underlyings;

  if (!Array.isArray(underlyings)) {
    return [];
  }

  return underlyings
    .map((underlying) => (typeof underlying === "string" ? normalizeSymbol(underlying) : ""))
    .filter(Boolean);
}

function addExposureValue(values: Map<string, number>, key: string, marketValue: number) {
  if (!key || !Number.isFinite(marketValue) || marketValue <= 0) {
    return;
  }

  values.set(key, (values.get(key) ?? 0) + marketValue);
}

function buildExposureItems(
  values: Map<string, number>,
  totalMarketValue: number,
  category: PortfolioExposureCategory,
) {
  return Array.from(values.entries())
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map<PortfolioExposureItem>(([key, marketValue]) => ({
      category,
      key,
      label: key,
      marketValue,
      percentage: totalMarketValue > 0 ? (marketValue / totalMarketValue) * 100 : 0,
    }));
}

function findSnapshotValue(asset: PortfolioAsset, snapshots: PortfolioMarketSnapshot[]) {
  const symbol = normalizeSymbol(asset.symbol);
  const cryptoSymbol = normalizeCryptoSymbol(asset.symbol);
  const snapshot = snapshots.find((item) => item.symbol === symbol || item.symbol === cryptoSymbol);

  if (!snapshot) {
    return null;
  }

  return snapshot.price;
}

function findAssetMarketValue(input: {
  asset: PortfolioAsset;
  assets: PortfolioAsset[];
  snapshots: PortfolioMarketSnapshot[];
  valuationReport: PortfolioExposureInput["valuationReport"];
}) {
  const { asset, assets, snapshots, valuationReport } = input;
  const allocationItem = valuationReport.allocation.byAssetType.find(
    (item) => item.key === asset.category,
  );
  const metadataMarketValue = asset.metadata?.marketValue;
  const metadataQuantity = asset.metadata?.quantity;
  const snapshotPrice = findSnapshotValue(asset, snapshots);
  const sameCategoryAssetCount = assets.filter(
    (candidate) => candidate.category === asset.category,
  ).length;

  if (typeof metadataMarketValue === "number" && Number.isFinite(metadataMarketValue)) {
    return metadataMarketValue;
  }

  if (
    typeof metadataQuantity === "number" &&
    Number.isFinite(metadataQuantity) &&
    metadataQuantity > 0 &&
    snapshotPrice
  ) {
    return metadataQuantity * snapshotPrice;
  }

  if (allocationItem && sameCategoryAssetCount > 0) {
    return allocationItem.marketValue / sameCategoryAssetCount;
  }

  return 0;
}

function getSymbolExposureCategory(asset: PortfolioAsset): PortfolioExposureCategory {
  if (asset.category === "CASH") {
    return "cash";
  }

  if (asset.category === "CRYPTO" || asset.category === "GRID" || asset.category === "DUAL") {
    return "crypto";
  }

  return "asset_type";
}

function buildSummary(report: Omit<PortfolioExposureReport, "summary">) {
  const top = report.topExposures[0];

  if (!top) {
    return "Portfolio Exposure Engine is enabled, but no exposure data is available yet.";
  }

  return `Largest current exposure is ${top.label} at ${top.percentage.toFixed(
    1,
  )}% of mock portfolio market value. Monitoring and risk-awareness only.`;
}

export const mockPortfolioExposureEngine: PortfolioExposureEngine = {
  async generateExposure(input: PortfolioExposureInput): Promise<PortfolioExposureReport> {
    const accountById = new Map<string, PortfolioAccount>(
      input.accounts.map((account) => [account.id, account]),
    );
    const assetTypeValues = new Map<string, number>();
    const symbolValues = new Map<string, number>();
    const regionValues = new Map<string, number>();
    const providerValues = new Map<string, number>();
    const totalMarketValue = input.valuationReport.valuation.totalMarketValue;

    for (const asset of input.assets) {
      const assetMarketValue = findAssetMarketValue({
        asset,
        assets: input.assets,
        snapshots: input.marketDataFeed.snapshots,
        valuationReport: input.valuationReport,
      });
      const account = accountById.get(asset.accountId);

      addExposureValue(assetTypeValues, asset.category, assetMarketValue);
      addExposureValue(regionValues, asset.region, assetMarketValue);
      addExposureValue(providerValues, account?.provider ?? "UNKNOWN", assetMarketValue);

      if (asset.category === "FCN") {
        const underlyings = readUnderlyingSymbols(asset);
        const splitValue = underlyings.length > 0 ? assetMarketValue / underlyings.length : 0;

        for (const underlying of underlyings) {
          addExposureValue(symbolValues, underlying, splitValue);
        }
        continue;
      }

      if (asset.category === "GRID" || asset.category === "DUAL" || asset.category === "CRYPTO") {
        addExposureValue(symbolValues, normalizeCryptoSymbol(asset.symbol || asset.name), assetMarketValue);
        continue;
      }

      addExposureValue(symbolValues, normalizeSymbol(asset.symbol || asset.name), assetMarketValue);
    }

    const assetTypeExposure = buildExposureItems(
      assetTypeValues,
      totalMarketValue,
      "asset_type",
    );
    const regionExposure = buildExposureItems(regionValues, totalMarketValue, "region");
    const providerExposure = buildExposureItems(providerValues, totalMarketValue, "provider");
    const symbolExposure = Array.from(symbolValues.entries())
      .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
      .map<PortfolioExposureItem>(([key, marketValue]) => {
        const matchingAsset = input.assets.find((asset) => {
          if (asset.category === "FCN") {
            return readUnderlyingSymbols(asset).includes(key);
          }
          if (asset.category === "GRID" || asset.category === "DUAL" || asset.category === "CRYPTO") {
            return normalizeCryptoSymbol(asset.symbol || asset.name) === key;
          }
          return normalizeSymbol(asset.symbol || asset.name) === key;
        });

        return {
          category:
            matchingAsset?.category === "FCN"
              ? "fcn_underlying"
              : matchingAsset
                ? getSymbolExposureCategory(matchingAsset)
                : "asset_type",
          key,
          label: key,
          marketValue,
          percentage: totalMarketValue > 0 ? (marketValue / totalMarketValue) * 100 : 0,
        };
      });
    const topExposures = [
      ...assetTypeExposure,
      ...symbolExposure,
      ...regionExposure,
      ...providerExposure,
    ]
      .sort((left, right) => right.percentage - left.percentage || left.label.localeCompare(right.label))
      .slice(0, 5);
    const reportWithoutSummary: Omit<PortfolioExposureReport, "summary"> = {
      assetTypeExposure,
      generatedAt: GENERATED_AT,
      id: "mock-portfolio-exposure-report-v2-05",
      providerExposure,
      regionExposure,
      symbolExposure,
      topExposures,
      totalMarketValue,
    };

    return {
      ...reportWithoutSummary,
      summary: buildSummary(reportWithoutSummary),
    };
  },
};
