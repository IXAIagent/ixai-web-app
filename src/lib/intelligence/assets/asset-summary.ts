import type { AssetIntelligence, AssetSummary, AssetSummaryBucket } from "@/src/lib/intelligence/assets/asset-types";

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function bucket(label: string, assetCount: number, score: number): AssetSummaryBucket {
  return {
    assetCount,
    label,
    score: Math.round(score * 100) / 100,
  };
}

export function buildAssetSummary(assets: AssetIntelligence[], generatedAt = new Date().toISOString()): AssetSummary {
  const portfolioAssets = assets.filter((asset) => asset.monitoringState.scope === "portfolio");
  const marketAssets = assets.filter((asset) => asset.market !== "unknown" && asset.market !== "future");
  const attentionAssets = assets.filter((asset) => asset.riskState.level === "attention" || asset.riskState.level === "critical");

  return {
    assetCount: assets.length,
    coverageSummary: bucket("Coverage", assets.length, average(assets.map((asset) => asset.coverage.score))),
    generatedAt,
    marketSummary: bucket("Market mapping", marketAssets.length, assets.length ? marketAssets.length / assets.length : 0),
    portfolioAssetSummary: bucket("Portfolio assets", portfolioAssets.length, assets.length ? portfolioAssets.length / assets.length : 0),
    qualitySummary: bucket("Quality", assets.length, average(assets.map((asset) => asset.quality.score))),
    riskSummary: bucket("Risk attention", attentionAssets.length, assets.length ? 1 - attentionAssets.length / assets.length : 0),
  };
}
