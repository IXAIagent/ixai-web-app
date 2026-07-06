import type { AssetHealth, AssetIntelligence, AssetStateStatus } from "@/src/lib/intelligence/assets/asset-types";

function hasMissingState(status: AssetStateStatus) {
  return status === "missing" || status === "unknown";
}

export function buildAssetHealth(input: {
  coverageScore: number;
  eventStatus: AssetStateStatus;
  newsStatus: AssetStateStatus;
  priceStatus: AssetStateStatus;
  qualityScore: number;
}): AssetHealth {
  const reasons: string[] = [];

  if (hasMissingState(input.priceStatus)) {
    reasons.push("Missing price state.");
  }

  if (hasMissingState(input.newsStatus)) {
    reasons.push("Missing news state.");
  }

  if (hasMissingState(input.eventStatus)) {
    reasons.push("Missing event state.");
  }

  if (input.coverageScore < 0.35) {
    reasons.push("Coverage is limited.");
  }

  if (input.qualityScore < 0.35) {
    reasons.push("Quality confidence is limited.");
  }

  if (input.priceStatus === "missing" && input.newsStatus === "missing" && input.coverageScore === 0) {
    return {
      reasons: reasons.length ? reasons : ["Asset has no usable intelligence coverage."],
      status: "offline",
    };
  }

  if (reasons.length > 0) {
    return {
      reasons,
      status: "degraded",
    };
  }

  return {
    reasons: ["Asset intelligence has usable price, news, event, coverage, and quality states."],
    status: "healthy",
  };
}

export function summarizeAssetHealth(assets: AssetIntelligence[]) {
  return {
    degraded: assets.filter((asset) => asset.health.status === "degraded").length,
    healthy: assets.filter((asset) => asset.health.status === "healthy").length,
    offline: assets.filter((asset) => asset.health.status === "offline").length,
    unknown: assets.filter((asset) => asset.health.status === "unknown").length,
  };
}
