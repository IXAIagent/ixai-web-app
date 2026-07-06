import type {
  EditorialProviderCoverageArea,
  EditorialProviderCoverageScore,
  EditorialRawStory,
} from "@/src/lib/editorial/providers/provider-types";

const COVERAGE_AREAS: EditorialProviderCoverageArea[] = [
  "macro",
  "us",
  "taiwan",
  "china",
  "crypto",
  "energy",
  "fcn",
  "macro_risk",
  "ai",
  "technology",
];

function storyText(story: EditorialRawStory) {
  return [
    story.title,
    story.summary,
    ...story.categories,
    ...story.markets,
    ...story.symbols,
  ]
    .join(" ")
    .toLowerCase();
}

function matchesArea(story: EditorialRawStory, area: EditorialProviderCoverageArea) {
  const text = storyText(story);

  if (area === "us") {
    return story.markets.includes("us");
  }

  if (area === "taiwan") {
    return story.markets.includes("tw") || /taiwan|2330|tsm/.test(text);
  }

  if (area === "china") {
    return story.markets.includes("hk") || /china|hong kong|0700/.test(text);
  }

  if (area === "macro_risk") {
    return /risk|volatility|vix|uncertainty/.test(text);
  }

  if (area === "technology") {
    return /tech|technology|semiconductor|chip|ai/.test(text);
  }

  return text.includes(area.replace("_", " "));
}

export function buildProviderCoverageScore(stories: EditorialRawStory[]): EditorialProviderCoverageScore {
  const areaScores = COVERAGE_AREAS.reduce(
    (scores, area) => ({
      ...scores,
      [area]: stories.some((story) => matchesArea(story, area)) ? 1 : 0,
    }),
    {} as Record<EditorialProviderCoverageArea, number>,
  );
  const coveredAreas = COVERAGE_AREAS.filter((area) => areaScores[area] > 0);
  const missingAreas = COVERAGE_AREAS.filter((area) => areaScores[area] === 0);

  return {
    areaScores,
    coveredAreas,
    missingAreas,
    overall: coveredAreas.length / COVERAGE_AREAS.length,
  };
}
