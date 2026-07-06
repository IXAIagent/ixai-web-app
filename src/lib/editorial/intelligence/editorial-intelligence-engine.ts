import type { EditorialStory, EditorialTopic } from "@/src/lib/editorial/editorial-types";
import {
  detectEditorialThemes,
  getRequiredEditorialThemeIds,
  type EditorialTheme,
} from "@/src/lib/editorial/intelligence/editorial-theme-engine";
import {
  buildStoryRelationships,
  type StoryRelationship,
} from "@/src/lib/editorial/intelligence/story-relationship-engine";
import {
  detectEditorialSignals,
  type EditorialSignal,
} from "@/src/lib/editorial/intelligence/editorial-signals";
import {
  buildNarrativePriorities,
  type NarrativePriority,
} from "@/src/lib/editorial/intelligence/narrative-priority";
import {
  buildEditorialConfidenceLayer,
  type EditorialConfidenceLayer,
} from "@/src/lib/editorial/intelligence/editorial-confidence";
import {
  buildEditorialCoverageLayer,
  type EditorialCoverageLayer,
} from "@/src/lib/editorial/intelligence/editorial-coverage";

export type EditorialIntelligenceDiagnostics = {
  aiDependency: "rule_based_only";
  confidence: EditorialConfidenceLayer;
  coverage: EditorialCoverageLayer;
  generatedAt: string;
  providerIndependence: "provider_abstraction_required";
  relationshipCount: number;
  signalCount: number;
  themeCount: number;
};

export type EditorialIntelligenceResult = {
  confidence: EditorialConfidenceLayer;
  coverage: EditorialCoverageLayer;
  diagnostics: EditorialIntelligenceDiagnostics;
  narrativePriorities: NarrativePriority[];
  relationships: StoryRelationship[];
  signals: EditorialSignal[];
  themes: EditorialTheme[];
};

export function buildEditorialIntelligence({
  generatedAt = new Date().toISOString(),
  stories,
  topics,
}: {
  generatedAt?: string;
  stories: EditorialStory[];
  topics: EditorialTopic[];
}): EditorialIntelligenceResult {
  const themes = detectEditorialThemes(stories);
  const relationships = buildStoryRelationships(stories, themes);
  const signals = detectEditorialSignals(stories);
  const confidence = buildEditorialConfidenceLayer({
    requiredThemeCount: getRequiredEditorialThemeIds().length,
    stories,
    themes,
    topics,
  });
  const coverage = buildEditorialCoverageLayer({
    stories,
    themes,
  });
  const narrativePriorities = buildNarrativePriorities({
    signals,
    themes,
    topics,
  });

  return {
    confidence,
    coverage,
    diagnostics: {
      aiDependency: "rule_based_only",
      confidence,
      coverage,
      generatedAt,
      providerIndependence: "provider_abstraction_required",
      relationshipCount: relationships.length,
      signalCount: signals.length,
      themeCount: themes.length,
    },
    narrativePriorities,
    relationships,
    signals,
    themes,
  };
}
