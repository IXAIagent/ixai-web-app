import type {
  IntelligenceConfidence,
  IntelligenceConfidenceLevel,
  IntelligenceSourceState,
} from "@/src/lib/intelligence/platform/platform-types";
import { clampScore, isFallbackSource } from "@/src/lib/intelligence/platform/platform-normalization";

function confidenceLevel(score: number | null): IntelligenceConfidenceLevel {
  if (score === null) return "unknown";
  if (score >= 0.75) return "high";
  if (score >= 0.5) return "medium";
  if (score >= 0.25) return "low";
  return "limited";
}

export function buildIntelligenceConfidence(input: {
  freshness?: IntelligenceConfidence["freshness"];
  limitations?: string[];
  reasons?: string[];
  score?: number | null;
  sourceCoverage?: IntelligenceSourceState[];
}): IntelligenceConfidence {
  const score = clampScore(input.score);
  const sourceCoverage = input.sourceCoverage ?? ["unavailable"];
  const fallbackActive = sourceCoverage.some(isFallbackSource);
  const limitations = [
    ...(input.limitations ?? []),
    ...(fallbackActive ? ["Some sources are unavailable or degraded."] : []),
  ];

  return {
    fallbackActive,
    freshness: input.freshness ?? "unknown",
    level: confidenceLevel(score),
    limitations: Array.from(new Set(limitations)),
    reasons: input.reasons ?? [],
    score,
    sourceCoverage,
  };
}
