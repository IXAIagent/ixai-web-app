import type { EditorialStory, EditorialTopic } from "@/src/lib/editorial/editorial-types";
import type { EditorialTheme } from "@/src/lib/editorial/intelligence/editorial-theme-engine";

export type EditorialConfidenceLayer = {
  coverageConfidence: number;
  narrativeConfidence: number;
  sourceConfidence: number;
  topicConfidence: number;
};

function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number) {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
}

export function buildEditorialConfidenceLayer({
  requiredThemeCount,
  stories,
  themes,
  topics,
}: {
  requiredThemeCount: number;
  stories: EditorialStory[];
  themes: EditorialTheme[];
  topics: EditorialTopic[];
}): EditorialConfidenceLayer {
  const sourceConfidence = average(stories.map((story) => story.sourceConfidence));
  const topicConfidence = average(
    topics.map((topic) => (topic.rankingScore ?? 0) * 0.55 + topic.sourceDiversity * 0.45),
  );
  const coverageConfidence = clamp(themes.length / Math.max(1, requiredThemeCount));
  const narrativeConfidence = clamp(
    sourceConfidence * 0.42 + topicConfidence * 0.32 + coverageConfidence * 0.26,
  );

  return {
    coverageConfidence,
    narrativeConfidence,
    sourceConfidence,
    topicConfidence,
  };
}
