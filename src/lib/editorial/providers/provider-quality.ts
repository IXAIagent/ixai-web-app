import type {
  EditorialProviderHealth,
  EditorialProviderQualityScore,
  EditorialRawStory,
} from "@/src/lib/editorial/providers/provider-types";
import type { EditorialProviderCoverageScore } from "@/src/lib/editorial/providers/provider-types";

function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function fingerprint(story: EditorialRawStory) {
  return `${story.title} ${story.summary}`
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ")
    .trim();
}

export function buildProviderQualityScore({
  coverage,
  health,
  stories,
}: {
  coverage: EditorialProviderCoverageScore;
  health: EditorialProviderHealth[];
  stories: EditorialRawStory[];
}): EditorialProviderQualityScore {
  const uniqueFingerprints = new Set(stories.map(fingerprint));
  const duplicateScore = stories.length ? uniqueFingerprints.size / stories.length : 0;
  const availability = health.length
    ? health.filter((item) => item.status === "healthy" || item.status === "degraded").length / health.length
    : 0;
  const confidence = average(stories.map((story) => story.confidence));
  const freshness = stories.length ? 0.82 : 0;
  const latency = health.every((item) => item.latencyMs === null)
    ? 0
    : 1 - Math.min(1, average(health.map((item) => item.latencyMs ?? 1_000)) / 5_000);
  const overall =
    availability * 0.2 +
    confidence * 0.22 +
    coverage.overall * 0.24 +
    duplicateScore * 0.14 +
    freshness * 0.12 +
    latency * 0.08;

  return {
    availability,
    confidence,
    coverage: coverage.overall,
    duplicates: duplicateScore,
    freshness,
    latency,
    overall,
  };
}
