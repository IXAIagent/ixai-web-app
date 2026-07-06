import type { AssetDiagnostics, AssetIntelligence, AssetReadiness } from "@/src/lib/intelligence/assets/asset-types";

export function buildAssetReadiness(diagnostics: AssetDiagnostics): AssetReadiness {
  const blockingIssues: string[] = [];
  const warningIssues: string[] = [];

  if (diagnostics.assetCount === 0) {
    blockingIssues.push("No assets are available for intelligence coverage.");
  }

  if (diagnostics.offlineAssets > 0) {
    blockingIssues.push(`${diagnostics.offlineAssets} asset(s) are offline.`);
  }

  if (diagnostics.missingPrice > 0) {
    warningIssues.push(`${diagnostics.missingPrice} asset(s) are missing price state.`);
  }

  if (diagnostics.missingNews > 0) {
    warningIssues.push(`${diagnostics.missingNews} asset(s) are missing news state.`);
  }

  if (diagnostics.missingCoverage > 0) {
    warningIssues.push(`${diagnostics.missingCoverage} asset(s) have limited coverage.`);
  }

  if (blockingIssues.length > 0) {
    return {
      blockingIssues,
      level: "red",
      nextAction: "Add or recover asset data before enabling monitoring workflows.",
      warningIssues,
    };
  }

  if (warningIssues.length > 0 || diagnostics.warningAssets > 0) {
    return {
      blockingIssues,
      level: "yellow",
      nextAction: "Review missing price, news, and coverage before using this layer for monitoring.",
      warningIssues,
    };
  }

  return {
    blockingIssues,
    level: "green",
    nextAction: "Asset Intelligence foundation is ready for downstream V17 monitoring design.",
    warningIssues,
  };
}

export function summarizeAssetReadiness(assets: AssetIntelligence[]): AssetReadiness {
  const diagnostics: AssetDiagnostics = {
    assetCount: assets.length,
    generatedAt: new Date().toISOString(),
    healthyAssets: assets.filter((asset) => asset.health.status === "healthy").length,
    missingCoverage: assets.filter((asset) => asset.coverage.score < 0.35).length,
    missingNews: assets.filter((asset) => asset.newsState.status === "missing").length,
    missingPrice: assets.filter((asset) => asset.priceState.status === "missing").length,
    offlineAssets: assets.filter((asset) => asset.health.status === "offline").length,
    warningAssets: assets.filter((asset) => asset.health.status === "degraded").length,
  };

  return buildAssetReadiness(diagnostics);
}
