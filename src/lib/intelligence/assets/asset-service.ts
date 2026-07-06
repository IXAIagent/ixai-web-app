import {
  createAssetIntelligenceFromFcnPosition,
  createAssetIntelligenceFromPortfolioPosition,
  createAssetIntelligenceFromWatchlistItem,
  createPlaceholderAssetIntelligence,
} from "@/src/lib/intelligence/assets/asset-intelligence";
import { buildAssetDiagnostics } from "@/src/lib/intelligence/assets/asset-diagnostics";
import { buildAssetGraph } from "@/src/lib/intelligence/assets/asset-graph";
import { buildAssetReadiness } from "@/src/lib/intelligence/assets/asset-readiness";
import { buildAssetSummary } from "@/src/lib/intelligence/assets/asset-summary";
import type {
  AssetDiagnostics,
  AssetGraph,
  AssetIntelligence,
  AssetIntelligenceInput,
  AssetIntelligenceServiceResult,
  AssetReadiness,
  AssetSummary,
} from "@/src/lib/intelligence/assets/asset-types";

function dedupeAssets(assets: AssetIntelligence[]) {
  const seen = new Map<string, AssetIntelligence>();

  for (const asset of assets) {
    const key = `${asset.assetType}:${asset.symbol}:${asset.id}`;
    if (!seen.has(key)) {
      seen.set(key, asset);
    }
  }

  return Array.from(seen.values());
}

export function getAssetIntelligence(input: AssetIntelligenceInput = {}): AssetIntelligence[] {
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const assets = [
    ...(input.portfolioPositions ?? []).map(createAssetIntelligenceFromPortfolioPosition),
    ...(input.fcnPositions ?? []).map(createAssetIntelligenceFromFcnPosition),
    ...(input.watchlistItems ?? []).map(createAssetIntelligenceFromWatchlistItem),
    createPlaceholderAssetIntelligence("cash", generatedAt),
    createPlaceholderAssetIntelligence("future_asset", generatedAt),
  ];

  return dedupeAssets(assets);
}

export function getAssetGraph(input: AssetIntelligenceInput | AssetIntelligence[] = {}): AssetGraph {
  const assets = Array.isArray(input) ? input : getAssetIntelligence(input);
  const generatedAt = Array.isArray(input) ? new Date().toISOString() : input.generatedAt;

  return buildAssetGraph(assets, generatedAt);
}

export function getAssetSummary(input: AssetIntelligenceInput | AssetIntelligence[] = {}): AssetSummary {
  const assets = Array.isArray(input) ? input : getAssetIntelligence(input);
  const generatedAt = Array.isArray(input) ? new Date().toISOString() : input.generatedAt;

  return buildAssetSummary(assets, generatedAt);
}

export function getAssetDiagnostics(input: AssetIntelligenceInput | AssetIntelligence[] = {}): AssetDiagnostics {
  const assets = Array.isArray(input) ? input : getAssetIntelligence(input);
  const generatedAt = Array.isArray(input) ? new Date().toISOString() : input.generatedAt;

  return buildAssetDiagnostics(assets, generatedAt);
}

export function getAssetReadiness(input: AssetIntelligenceInput | AssetIntelligence[] = {}): AssetReadiness {
  return buildAssetReadiness(getAssetDiagnostics(input));
}

export function getAssetIntelligenceService(input: AssetIntelligenceInput = {}): AssetIntelligenceServiceResult {
  const assets = getAssetIntelligence(input);
  const diagnostics = getAssetDiagnostics(assets);

  return {
    assets,
    diagnostics,
    graph: getAssetGraph(assets),
    readiness: buildAssetReadiness(diagnostics),
    summary: getAssetSummary(assets),
  };
}
