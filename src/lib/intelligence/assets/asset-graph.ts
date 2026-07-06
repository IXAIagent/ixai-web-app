import type {
  AssetGraph,
  AssetIntelligence,
  AssetRelationship,
  AssetRelationshipType,
} from "@/src/lib/intelligence/assets/asset-types";

function addRelationship(
  relationships: AssetRelationship[],
  input: Omit<AssetRelationship, "confidence"> & { confidence?: number },
) {
  if (input.fromAssetId === input.toAssetId) {
    return;
  }

  const key = `${input.fromAssetId}:${input.toAssetId}:${input.type}`;
  const reverseKey = `${input.toAssetId}:${input.fromAssetId}:${input.type}`;
  const exists = relationships.some(
    (relationship) =>
      `${relationship.fromAssetId}:${relationship.toAssetId}:${relationship.type}` === key ||
      `${relationship.fromAssetId}:${relationship.toAssetId}:${relationship.type}` === reverseKey,
  );

  if (!exists) {
    relationships.push({
      confidence: input.confidence ?? 0.7,
      fromAssetId: input.fromAssetId,
      reason: input.reason,
      toAssetId: input.toAssetId,
      type: input.type,
    });
  }
}

function sameValue(a: string | null | undefined, b: string | null | undefined) {
  return Boolean(a && b && a.trim().toUpperCase() === b.trim().toUpperCase());
}

function addPairRelationships(assets: AssetIntelligence[], relationships: AssetRelationship[]) {
  for (let i = 0; i < assets.length; i += 1) {
    for (let j = i + 1; j < assets.length; j += 1) {
      const left = assets[i];
      const right = assets[j];

      if (sameValue(left.symbol, right.symbol)) {
        addRelationship(relationships, {
          confidence: 0.95,
          fromAssetId: left.id,
          reason: `Both assets use symbol ${left.symbol}.`,
          toAssetId: right.id,
          type: "same_symbol",
        });
      }

      if (left.market === right.market && left.market !== "unknown") {
        addRelationship(relationships, {
          confidence: 0.45,
          fromAssetId: left.id,
          reason: `Both assets are mapped to ${left.market}.`,
          toAssetId: right.id,
          type: "same_sector",
        });
      }

      if (left.themes.some((theme) => right.themes.includes(theme))) {
        addRelationship(relationships, {
          confidence: 0.64,
          fromAssetId: left.id,
          reason: "Assets share an editorial theme.",
          toAssetId: right.id,
          type: "same_theme",
        });
      }
    }
  }
}

function addExplicitRelationships(assets: AssetIntelligence[], relationships: AssetRelationship[]) {
  const assetBySymbol = new Map(assets.map((asset) => [asset.symbol, asset]));

  for (const asset of assets) {
    const relationshipGroups: Array<{
      references: AssetIntelligence["relatedAssets"];
      type: AssetRelationshipType;
    }> = [
      { references: asset.relatedAssets, type: "same_fcn" },
      { references: asset.relatedFcn, type: "same_fcn" },
      { references: asset.relatedWatchlist, type: "same_watchlist" },
    ];

    for (const group of relationshipGroups) {
      for (const reference of group.references) {
        const related = reference.symbol ? assetBySymbol.get(reference.symbol.toUpperCase()) : undefined;

        if (related) {
          addRelationship(relationships, {
            confidence: 0.8,
            fromAssetId: asset.id,
            reason: reference.label,
            toAssetId: related.id,
            type: group.type,
          });
        }
      }
    }
  }
}

export function buildAssetGraph(assets: AssetIntelligence[], generatedAt = new Date().toISOString()): AssetGraph {
  const relationships: AssetRelationship[] = [];

  addPairRelationships(assets, relationships);
  addExplicitRelationships(assets, relationships);

  return {
    assets,
    generatedAt,
    relationships,
  };
}
