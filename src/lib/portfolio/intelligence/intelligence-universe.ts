import type { PortfolioAsset } from "@/src/lib/portfolio/data-model/portfolio-asset-types";
import type {
  IntelligenceTrackedSymbol,
  PortfolioIntelligenceUniverse,
} from "@/src/lib/portfolio/intelligence/intelligence-types";

const STABLE_COIN_SUFFIXES = ["USDT", "USDC", "USD", "TWD", "HKD", "JPY"];

function cleanSymbol(value: string | undefined): string | null {
  const symbol = value?.trim().toUpperCase().replace(/[^A-Z0-9.-]/g, "");
  return symbol ? symbol : null;
}

function normalizeCryptoPairSymbol(value: string | undefined): string | null {
  let symbol = cleanSymbol(value);

  if (!symbol) {
    return null;
  }

  for (const suffix of STABLE_COIN_SUFFIXES) {
    if (symbol.length > suffix.length && symbol.endsWith(suffix)) {
      symbol = symbol.slice(0, -suffix.length);
      break;
    }
  }

  return symbol || null;
}

function readUnderlyingSymbols(asset: PortfolioAsset): string[] {
  const underlyings = asset.metadata?.underlyings;

  if (!Array.isArray(underlyings)) {
    return [];
  }

  return underlyings
    .map((underlying) => (typeof underlying === "string" ? cleanSymbol(underlying) : null))
    .filter((symbol): symbol is string => Boolean(symbol));
}

function buildTrackedSymbol(
  asset: PortfolioAsset,
  symbol: string,
  source: IntelligenceTrackedSymbol["source"],
): IntelligenceTrackedSymbol {
  return {
    category: asset.category,
    source,
    sourceAssetId: asset.id,
    sourceAssetName: asset.name,
    symbol,
  };
}

export function buildPortfolioIntelligenceUniverse(
  assets: PortfolioAsset[],
): PortfolioIntelligenceUniverse {
  const trackedSymbols: IntelligenceTrackedSymbol[] = [];
  let ignoredCashCount = 0;

  for (const asset of assets) {
    if (asset.category === "CASH") {
      ignoredCashCount += 1;
      continue;
    }

    if (asset.category === "FCN") {
      for (const symbol of readUnderlyingSymbols(asset)) {
        trackedSymbols.push(buildTrackedSymbol(asset, symbol, "fcn_underlying"));
      }
      continue;
    }

    if (asset.category === "GRID" || asset.category === "DUAL") {
      const symbol = normalizeCryptoPairSymbol(asset.symbol || asset.name);
      if (symbol) {
        trackedSymbols.push(buildTrackedSymbol(asset, symbol, "grid_or_dual_symbol"));
      }
      continue;
    }

    const symbol = cleanSymbol(asset.symbol || asset.name);
    if (symbol) {
      trackedSymbols.push(buildTrackedSymbol(asset, symbol, "asset_symbol"));
    }
  }

  const symbols = Array.from(new Set(trackedSymbols.map((item) => item.symbol))).sort((a, b) =>
    a.localeCompare(b),
  );

  return {
    ignoredCashCount,
    sourceCount: trackedSymbols.length,
    symbols,
    totalTrackedSymbols: symbols.length,
    trackedSymbols,
  };
}
