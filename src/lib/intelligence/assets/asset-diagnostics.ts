import type { AssetDiagnostics, AssetIntelligence } from "@/src/lib/intelligence/assets/asset-types";

export function buildAssetDiagnostics(
  assets: AssetIntelligence[],
  generatedAt = new Date().toISOString(),
): AssetDiagnostics {
  return {
    assetCount: assets.length,
    generatedAt,
    healthyAssets: assets.filter((asset) => asset.health.status === "healthy").length,
    missingCoverage: assets.filter((asset) => asset.coverage.score < 0.35).length,
    missingNews: assets.filter((asset) => asset.newsState.status === "missing").length,
    missingPrice: assets.filter((asset) => asset.priceState.status === "missing").length,
    offlineAssets: assets.filter((asset) => asset.health.status === "offline").length,
    warningAssets: assets.filter((asset) => asset.health.status === "degraded").length,
  };
}
