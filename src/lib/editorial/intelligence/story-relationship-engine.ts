import type { EditorialStory } from "@/src/lib/editorial/editorial-types";
import type { EditorialTheme } from "@/src/lib/editorial/intelligence/editorial-theme-engine";

export type StoryRelationshipType =
  | "same_company"
  | "same_sector"
  | "same_theme"
  | "macro_impact"
  | "supply_chain_relation"
  | "risk_relation"
  | "follow_up_relation";

export type StoryRelationship = {
  confidence: number;
  evidence: string;
  fromStoryId: string;
  toStoryId: string;
  type: StoryRelationshipType;
};

function intersection(a: string[], b: string[]) {
  const right = new Set(b.map((value) => value.toLowerCase()));
  return a.filter((value) => right.has(value.toLowerCase()));
}

function storyThemeIds(storyId: string, themes: EditorialTheme[]) {
  return themes
    .filter((theme) => theme.matchedStoryIds.includes(storyId))
    .map((theme) => theme.id);
}

function relationship(
  fromStoryId: string,
  toStoryId: string,
  type: StoryRelationshipType,
  confidence: number,
  evidence: string,
): StoryRelationship {
  return {
    confidence,
    evidence,
    fromStoryId,
    toStoryId,
    type,
  };
}

export function buildStoryRelationships(
  stories: EditorialStory[],
  themes: EditorialTheme[],
): StoryRelationship[] {
  const relationships: StoryRelationship[] = [];

  for (let leftIndex = 0; leftIndex < stories.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < stories.length; rightIndex += 1) {
      const left = stories[leftIndex];
      const right = stories[rightIndex];
      const sharedSymbols = intersection(left.symbols, right.symbols);
      const sharedCategories = intersection(left.categories, right.categories);
      const sharedThemes = intersection(storyThemeIds(left.id, themes), storyThemeIds(right.id, themes));

      if (sharedSymbols.length > 0) {
        relationships.push(
          relationship(
            left.id,
            right.id,
            "same_company",
            0.9,
            `Shared symbol(s): ${sharedSymbols.join(", ")}`,
          ),
        );
      }

      if (sharedCategories.length > 0) {
        relationships.push(
          relationship(
            left.id,
            right.id,
            "same_sector",
            0.72,
            `Shared category: ${sharedCategories.slice(0, 2).join(", ")}`,
          ),
        );
      }

      if (sharedThemes.length > 0) {
        relationships.push(
          relationship(
            left.id,
            right.id,
            "same_theme",
            0.78,
            `Shared theme: ${sharedThemes.slice(0, 2).join(", ")}`,
          ),
        );
      }

      if (left.categories.includes("macro") || right.categories.includes("macro")) {
        relationships.push(
          relationship(left.id, right.id, "macro_impact", 0.58, "One story is macro-related."),
        );
      }

      if (
        sharedThemes.includes("ai") &&
        (sharedThemes.includes("semiconductor") ||
          left.categories.includes("taiwan_market") ||
          right.categories.includes("taiwan_market"))
      ) {
        relationships.push(
          relationship(left.id, right.id, "supply_chain_relation", 0.64, "AI and semiconductor supply-chain themes overlap."),
        );
      }

      if (
        left.categories.some((category) => category.includes("risk") || category.includes("volatility")) ||
        right.categories.some((category) => category.includes("risk") || category.includes("volatility"))
      ) {
        relationships.push(
          relationship(left.id, right.id, "risk_relation", 0.56, "Risk or volatility is part of the story pair."),
        );
      }

      if (left.title.toLowerCase() === right.title.toLowerCase()) {
        relationships.push(
          relationship(left.id, right.id, "follow_up_relation", 0.7, "Titles match after normalization."),
        );
      }
    }
  }

  return relationships.sort((a, b) => b.confidence - a.confidence).slice(0, 24);
}
