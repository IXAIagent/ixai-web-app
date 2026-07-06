import type { EditorialStory } from "@/src/lib/editorial/editorial-types";
import {
  getRequiredEditorialThemeIds,
  type EditorialTheme,
  type EditorialThemeId,
} from "@/src/lib/editorial/intelligence/editorial-theme-engine";

export type EditorialCoverageLayer = {
  coveredThemes: EditorialThemeId[];
  duplicateHeavyAreas: string[];
  lowCoverageAreas: EditorialThemeId[];
  missingThemes: EditorialThemeId[];
  sourceDiversity: number;
  sourceLabels: string[];
};

export function buildEditorialCoverageLayer({
  stories,
  themes,
}: {
  stories: EditorialStory[];
  themes: EditorialTheme[];
}): EditorialCoverageLayer {
  const requiredThemes = getRequiredEditorialThemeIds();
  const coveredThemes = themes.map((theme) => theme.id);
  const missingThemes = requiredThemes.filter((theme) => !coveredThemes.includes(theme));
  const sourceLabels = [...new Set(stories.map((story) => story.source.label))];
  const sourceDiversity = stories.length ? sourceLabels.length / stories.length : 0;
  const lowCoverageAreas = themes
    .filter((theme) => theme.matchedStoryIds.length <= 1 || theme.confidence < 0.45)
    .map((theme) => theme.id);
  const duplicateHeavyAreas = themes
    .filter((theme) =>
      theme.matchedStoryIds.some((storyId) => {
        const story = stories.find((candidate) => candidate.id === storyId);
        return Boolean(story && (story.duplicationRisk > 0.6 || story.duplicateOf));
      }),
    )
    .map((theme) => theme.label);

  return {
    coveredThemes,
    duplicateHeavyAreas,
    lowCoverageAreas,
    missingThemes,
    sourceDiversity,
    sourceLabels,
  };
}
