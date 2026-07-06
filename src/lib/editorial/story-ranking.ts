import type { EditorialStory } from "@/src/lib/editorial/editorial-types";

export type StoryRankingWeights = {
  duplicationRisk: number;
  freshness: number;
  importance: number;
  marketRelevance: number;
  sourceConfidence: number;
};

export const DEFAULT_STORY_RANKING_WEIGHTS: StoryRankingWeights = {
  duplicationRisk: 0.12,
  freshness: 0.2,
  importance: 0.3,
  marketRelevance: 0.25,
  sourceConfidence: 0.13,
};

function clamp(value: number) {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
}

function storyFingerprint(story: EditorialStory) {
  return `${story.title} ${story.summary}`
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ")
    .split(" ")
    .filter((token) => token.length > 2)
    .slice(0, 12)
    .join(" ");
}

function duplicationRisk(story: EditorialStory, seen: Set<string>) {
  const fingerprint = storyFingerprint(story);

  if (!fingerprint) {
    return 0.2;
  }

  if (seen.has(fingerprint)) {
    return 1;
  }

  seen.add(fingerprint);
  return story.duplicationRisk;
}

export function scoreEditorialStory(
  story: EditorialStory,
  weights: StoryRankingWeights = DEFAULT_STORY_RANKING_WEIGHTS,
) {
  return clamp(
    story.importance * weights.importance +
      story.freshness * weights.freshness +
      story.marketRelevance * weights.marketRelevance +
      story.sourceConfidence * weights.sourceConfidence -
      story.duplicationRisk * weights.duplicationRisk,
  );
}

export function rankEditorialStories(
  stories: EditorialStory[],
  weights: StoryRankingWeights = DEFAULT_STORY_RANKING_WEIGHTS,
): EditorialStory[] {
  const seen = new Set<string>();

  return stories
    .map((story) => {
      const duplicateScore = duplicationRisk(story, seen);

      return {
        ...story,
        duplicationRisk: duplicateScore,
        duplicateOf: duplicateScore >= 1 ? "suppressed_duplicate" : story.duplicateOf,
      };
    })
    .filter((story) => story.duplicationRisk < 1)
    .map((story) => ({
      ...story,
      rankingScore: scoreEditorialStory(story, weights),
    }))
    .sort((a, b) => {
      const scoreDelta = (b.rankingScore ?? 0) - (a.rankingScore ?? 0);

      if (scoreDelta !== 0) {
        return scoreDelta;
      }

      return (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "");
    });
}
