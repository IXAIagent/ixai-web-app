import type { EditorialTopic } from "@/src/lib/editorial/editorial-types";
import type { EditorialSignal } from "@/src/lib/editorial/intelligence/editorial-signals";
import type { EditorialTheme } from "@/src/lib/editorial/intelligence/editorial-theme-engine";

export type NarrativePriority = {
  confidence: number;
  explanation: string;
  priorityScore: number;
  relatedSignals: string[];
  relatedThemes: string[];
  topicId: string;
  topicTitle: string;
};

function clamp(value: number) {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
}

export function buildNarrativePriorities({
  signals,
  themes,
  topics,
}: {
  signals: EditorialSignal[];
  themes: EditorialTheme[];
  topics: EditorialTopic[];
}): NarrativePriority[] {
  return topics.map((topic) => {
    const topicStoryIds = topic.stories.map((story) => story.id);
    const relatedSignals = signals.filter((signal) => topicStoryIds.includes(signal.storyId));
    const relatedThemes = themes.filter((theme) =>
      theme.matchedStoryIds.some((storyId) => topicStoryIds.includes(storyId)),
    );
    const signalScore = Math.min(1, relatedSignals.length / 5);
    const themeScore = Math.min(1, relatedThemes.length / 3);
    const priorityScore = clamp((topic.rankingScore ?? 0) * 0.55 + signalScore * 0.25 + themeScore * 0.2);

    return {
      confidence: clamp(
        topic.sourceDiversity * 0.3 +
          topic.marketImpact * 0.3 +
          relatedThemes.reduce((sum, theme) => sum + theme.confidence, 0) /
            Math.max(1, relatedThemes.length) *
            0.4,
      ),
      explanation: `${topic.title} is prioritized by topic rank, related signals, and theme coverage.`,
      priorityScore,
      relatedSignals: [...new Set(relatedSignals.map((signal) => signal.signal))],
      relatedThemes: relatedThemes.map((theme) => theme.label),
      topicId: topic.id,
      topicTitle: topic.title,
    };
  }).sort((a, b) => b.priorityScore - a.priorityScore);
}
