import type {
  WeeklyBrief2CoverageStatus,
  WeeklyBrief2Diagnostics,
  WeeklyBrief2DiagnosticsInput,
  WeeklyBrief2FallbackState,
  WeeklyBrief2RiskNote,
} from "@/src/lib/editorial/weekly-brief/weekly-brief-types";

export function buildWeeklyBrief2FallbackState({
  editorialBrief,
  intelligence,
  normalizedStories,
  rankedStories,
  socialPackAvailable,
  topics,
}: WeeklyBrief2DiagnosticsInput): WeeklyBrief2FallbackState {
  return {
    limitedBrief: rankedStories.length === 0,
    limitedCoverage:
      editorialBrief.status === "limited" ||
      intelligence.confidence.coverageConfidence < 0.45 ||
      rankedStories.some((story) => story.sourceConfidence < 0.45),
    missingAiProvider: true,
    missingWeeklyCoverage: topics.length < 3,
    noStories: rankedStories.length === 0,
    socialPackUnavailable: !socialPackAvailable,
    suppressedDuplicateCount: Math.max(0, normalizedStories.length - rankedStories.length),
  };
}

export function buildWeeklyBrief2CoverageStatus({
  intelligence,
}: Pick<WeeklyBrief2DiagnosticsInput, "intelligence">): WeeklyBrief2CoverageStatus {
  return {
    coveredThemes: intelligence.coverage.coveredThemes,
    duplicateHeavyAreas: intelligence.coverage.duplicateHeavyAreas,
    lowCoverageAreas: intelligence.coverage.lowCoverageAreas,
    missingThemes: intelligence.coverage.missingThemes,
    sourceDiversity: intelligence.coverage.sourceDiversity,
    sourceLabels: intelligence.coverage.sourceLabels,
  };
}

export function buildWeeklyBrief2RiskNotes({
  fallbackState,
  intelligence,
}: {
  fallbackState: WeeklyBrief2FallbackState;
  intelligence: WeeklyBrief2DiagnosticsInput["intelligence"];
}): WeeklyBrief2RiskNote[] {
  const notes: WeeklyBrief2RiskNote[] = [];

  if (fallbackState.noStories) {
    notes.push({
      detail: "No weekly stories are available, so the foundation produces a limited weekly brief.",
      severity: "warning",
    });
  }

  if (fallbackState.limitedCoverage) {
    notes.push({
      detail: "Weekly coverage confidence is limited; editorial review should confirm the narrative.",
      severity: "warning",
    });
  }

  if (fallbackState.suppressedDuplicateCount > 0) {
    notes.push({
      detail: "Duplicate-heavy source content was suppressed before weekly ranking.",
      severity: "info",
    });
  }

  if (fallbackState.missingAiProvider) {
    notes.push({
      detail: "No AI provider is called; weekly narrative remains deterministic and rule-based.",
      severity: "info",
    });
  }

  if (fallbackState.socialPackUnavailable) {
    notes.push({
      detail: "Social Pack is unavailable but does not block core Weekly Brief preview.",
      severity: "info",
    });
  }

  if (intelligence.coverage.missingThemes.length > 0) {
    notes.push({
      detail: `Missing theme coverage: ${intelligence.coverage.missingThemes.slice(0, 4).join(", ")}.`,
      severity: "info",
    });
  }

  return notes;
}

export function buildWeeklyBrief2Diagnostics({
  editorialBrief,
  intelligence,
}: WeeklyBrief2DiagnosticsInput): WeeklyBrief2Diagnostics {
  return {
    aiDependencyStatus: "rule_based_only",
    coverageConfidence: intelligence.confidence.coverageConfidence,
    narrativeConfidence: intelligence.confidence.narrativeConfidence,
    relationshipCount: intelligence.relationships.length,
    signalCount: intelligence.signals.length,
    sourceCount: editorialBrief.sources.length,
    storyCount: editorialBrief.stories.length,
    themeCount: intelligence.themes.length,
    topicCount: editorialBrief.topics.length,
  };
}
