import type { EditorialStory, EditorialTopic } from "@/src/lib/editorial/editorial-types";
import { rankEditorialStories } from "@/src/lib/editorial/story-ranking";

function slug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function primaryTopicKey(story: EditorialStory) {
  return story.categories[0] ?? story.markets[0] ?? "market";
}

function sourceDiversity(stories: EditorialStory[]) {
  if (!stories.length) {
    return 0;
  }

  return new Set(stories.map((story) => story.source.id)).size / stories.length;
}

function average(stories: EditorialStory[], field: keyof Pick<EditorialStory, "importance" | "marketRelevance">) {
  if (!stories.length) {
    return 0;
  }

  return stories.reduce((sum, story) => sum + story[field], 0) / stories.length;
}

function topicTitle(key: string) {
  return key
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export function groupStoriesIntoTopics(stories: EditorialStory[]): EditorialTopic[] {
  const rankedStories = rankEditorialStories(stories);
  const groups = new Map<string, EditorialStory[]>();

  for (const story of rankedStories) {
    const key = primaryTopicKey(story);
    groups.set(key, [...(groups.get(key) ?? []), story]);
  }

  return [...groups.entries()].map(([key, topicStories]) => {
    const topStory = topicStories[0];
    const importance = average(topicStories, "importance");
    const marketImpact = average(topicStories, "marketRelevance");
    const diversity = sourceDiversity(topicStories);

    return {
      id: slug(key) || "market",
      importance,
      marketImpact,
      rankingScore: scoreEditorialTopic({
        importance,
        marketImpact,
        sourceDiversity: diversity,
        storyCount: topicStories.length,
      }),
      sourceDiversity: diversity,
      stories: topicStories,
      storyCount: topicStories.length,
      summary: topStory?.summary ?? "Limited story detail is available.",
      title: topicTitle(key),
    };
  });
}

export function scoreEditorialTopic({
  importance,
  marketImpact,
  sourceDiversity,
  storyCount,
}: Pick<EditorialTopic, "importance" | "marketImpact" | "sourceDiversity" | "storyCount">) {
  const countScore = Math.min(1, storyCount / 5);

  return Math.min(
    1,
    importance * 0.35 + marketImpact * 0.3 + sourceDiversity * 0.2 + countScore * 0.15,
  );
}

export function rankEditorialTopics(stories: EditorialStory[]): EditorialTopic[] {
  return groupStoriesIntoTopics(stories).sort((a, b) => {
    const scoreDelta = (b.rankingScore ?? 0) - (a.rankingScore ?? 0);

    if (scoreDelta !== 0) {
      return scoreDelta;
    }

    return b.storyCount - a.storyCount;
  });
}
