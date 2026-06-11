import type { PortfolioAccount } from "@/src/lib/portfolio/data-model/portfolio-account-types";
import type { PortfolioAsset } from "@/src/lib/portfolio/data-model/portfolio-asset-types";
import type { PortfolioPosition } from "@/src/lib/portfolio/data-model/portfolio-position-types";
import type { PortfolioMarketSnapshot } from "@/src/lib/portfolio/market-data/market-data-types";
import type { PortfolioValuationEngine } from "@/src/lib/portfolio/valuation/valuation-engine";
import type {
  PortfolioAllocationItem,
  PortfolioValuationInput,
  PortfolioValuationReport,
} from "@/src/lib/portfolio/valuation/valuation-types";

const GENERATED_AT = "2026-06-11T00:00:00.000Z";

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function readNumericMetadata(
  asset: PortfolioAsset,
  key: "costBasis" | "marketValue" | "quantity",
) {
  const value = asset.metadata?.[key];
  return isFiniteNumber(value) ? value : null;
}

function findMarketSnapshot(asset: PortfolioAsset, snapshots: PortfolioMarketSnapshot[]) {
  const symbol = asset.symbol.trim().toUpperCase();
  const normalizedSymbol = symbol.replace(/(USDT|USDC|USD|TWD|HKD|JPY)$/u, "");

  return snapshots.find((snapshot) => {
    const snapshotSymbol = snapshot.symbol.trim().toUpperCase();
    return snapshotSymbol === symbol || snapshotSymbol === normalizedSymbol;
  });
}

function calculateAssetValue(input: {
  asset: PortfolioAsset;
  position: PortfolioPosition | undefined;
  snapshot: PortfolioMarketSnapshot | undefined;
}) {
  const { asset, position, snapshot } = input;
  const quantity =
    position && isFiniteNumber(position.quantity)
      ? position.quantity
      : readNumericMetadata(asset, "quantity") ?? 0;
  const costBasis =
    position && isFiniteNumber(position.costBasis)
      ? position.costBasis
      : readNumericMetadata(asset, "costBasis") ?? 0;
  const storedMarketValue =
    position && isFiniteNumber(position.marketValue)
      ? position.marketValue
      : readNumericMetadata(asset, "marketValue") ?? null;

  if (asset.category === "CASH" && storedMarketValue !== null) {
    return {
      costBasis,
      marketValue: storedMarketValue,
    };
  }

  if (snapshot && quantity > 0) {
    return {
      costBasis,
      marketValue: quantity * snapshot.price,
    };
  }

  return {
    costBasis,
    marketValue: storedMarketValue ?? costBasis,
  };
}

function buildAllocationItems(values: Map<string, number>, totalMarketValue: number) {
  return Array.from(values.entries())
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map<PortfolioAllocationItem>(([key, marketValue]) => ({
      key,
      label: key,
      marketValue,
      sharePercent: totalMarketValue > 0 ? (marketValue / totalMarketValue) * 100 : 0,
    }));
}

function addAllocationValue(values: Map<string, number>, key: string, marketValue: number) {
  values.set(key, (values.get(key) ?? 0) + marketValue);
}

export const mockPortfolioValuationEngine: PortfolioValuationEngine = {
  async generateValuation(input: PortfolioValuationInput): Promise<PortfolioValuationReport> {
    const accountById = new Map<string, PortfolioAccount>(
      input.accounts.map((account) => [account.id, account]),
    );
    const positionByAssetId = new Map<string, PortfolioPosition>(
      input.positions.map((position) => [position.assetId, position]),
    );
    const allocationByAssetType = new Map<string, number>();
    const allocationByProvider = new Map<string, number>();
    const allocationByRegion = new Map<string, number>();
    let totalCostBasis = 0;
    let totalMarketValue = 0;

    for (const asset of input.assets) {
      const position = positionByAssetId.get(asset.id);
      const snapshot = findMarketSnapshot(asset, input.marketSnapshots);
      const { costBasis, marketValue } = calculateAssetValue({
        asset,
        position,
        snapshot,
      });
      const account = accountById.get(asset.accountId);

      totalCostBasis += costBasis;
      totalMarketValue += marketValue;
      addAllocationValue(allocationByAssetType, asset.category, marketValue);
      addAllocationValue(allocationByProvider, account?.provider ?? "UNKNOWN", marketValue);
      addAllocationValue(allocationByRegion, asset.region, marketValue);
    }

    const unrealizedPnL = totalMarketValue - totalCostBasis;

    return {
      allocation: {
        byAssetType: buildAllocationItems(allocationByAssetType, totalMarketValue),
        byProvider: buildAllocationItems(allocationByProvider, totalMarketValue),
        byRegion: buildAllocationItems(allocationByRegion, totalMarketValue),
      },
      providerSource: "mock",
      valuation: {
        assetCount: input.assets.length,
        generatedAt: GENERATED_AT,
        positionCount: input.positions.length,
        totalCostBasis,
        totalMarketValue,
        unrealizedPnL,
        unrealizedPnLPercent:
          totalCostBasis > 0 ? (unrealizedPnL / totalCostBasis) * 100 : 0,
      },
    };
  },
};
