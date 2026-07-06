import type {
  EditorialFailureState,
  EditorialStory,
  EditorialTopic,
} from "@/src/lib/editorial/editorial-types";
import type {
  DailyBrief2Diagnostics,
  DailyBrief2DiagnosticsInput,
  DailyBrief2FallbackState,
  DailyBrief2PublicationReadiness,
  DailyBrief2RiskNote,
  DailyBrief2SourceCoverage,
} from "@/src/lib/editorial/daily-brief/daily-brief-types";

export function buildDailyBrief2FallbackState({
  failures,
  publishAvailable,
  rankedStories,
  socialPackAvailable,
  topics,
}: DailyBrief2DiagnosticsInput): DailyBrief2FallbackState {
  return {
    limitedBrief: rankedStories.length === 0,
    limitedCoverage:
      failures.some((failure) => failure.code === "low_confidence") ||
      rankedStories.some((story) => story.sourceConfidence < 0.45),
    missingAiProvider: true,
    missingTopicCoverage: topics.length === 0,
    noStories: rankedStories.length === 0,
    publishUnavailable: !publishAvailable,
    socialPackUnavailable: !socialPackAvailable,
    suppressedDuplicateCount: failures.filter((failure) => failure.code === "duplicate_stories").length,
  };
}

export function buildDailyBrief2SourceCoverage({
  normalizedStories,
  rankedStories,
  topics,
}: Pick<DailyBrief2DiagnosticsInput, "normalizedStories" | "rankedStories" | "topics">): DailyBrief2SourceCoverage {
  const sources = new Map(normalizedStories.map((story) => [story.source.id, story.source]));
  const providerKeys = new Set(
    normalizedStories
      .map((story) => story.source.providerKey)
      .filter((providerKey): providerKey is string => Boolean(providerKey)),
  );

  return {
    lowConfidenceCount: rankedStories.filter((story) => story.sourceConfidence < 0.45).length,
    normalizedStoryCount: normalizedStories.length,
    providerCount: providerKeys.size,
    rankedStoryCount: rankedStories.length,
    sourceCount: sources.size,
    sourceLabels: [...sources.values()].map((source) => source.label),
    topicCount: topics.length,
  };
}

export function buildDailyBrief2PublicationReadiness({
  fallbackState,
  rankedStories,
}: {
  fallbackState: DailyBrief2FallbackState;
  rankedStories: EditorialStory[];
}): DailyBrief2PublicationReadiness {
  if (!rankedStories.length) {
    return {
      canPreview: true,
      canPublish: false,
      reason: "Limited preview is available, but there are no ranked stories to publish.",
      socialPackBlocking: false,
    };
  }

  if (fallbackState.publishUnavailable) {
    return {
      canPreview: true,
      canPublish: false,
      reason: "Preview is generated, but publish is unavailable in this foundation path.",
      socialPackBlocking: false,
    };
  }

  return {
    canPreview: true,
    canPublish: !fallbackState.limitedBrief,
    reason: fallbackState.limitedCoverage
      ? "Preview is available with limited coverage; editorial review should confirm confidence."
      : "Preview is ready for editorial review.",
    socialPackBlocking: false,
  };
}

export function buildDailyBrief2RiskNotes({
  fallbackState,
  failures,
  rankedStories,
  topics,
}: {
  fallbackState: DailyBrief2FallbackState;
  failures: EditorialFailureState[];
  rankedStories: EditorialStory[];
  topics: EditorialTopic[];
}): DailyBrief2RiskNote[] {
  const notes: DailyBrief2RiskNote[] = [];

  if (fallbackState.noStories) {
    notes.push({
      detail: "No stories were available, so the snapshot falls back to a limited brief.",
      severity: "warning",
      type: "data_gap",
    });
  }

  if (fallbackState.limitedCoverage) {
    notes.push({
      detail: "At least one story has low source confidence; coverage should be treated as limited.",
      severity: "warning",
      type: "low_confidence",
    });
  }

  if (fallbackState.suppressedDuplicateCount > 0 || normalizedDuplicateFailure(failures)) {
    notes.push({
      detail: "Duplicate-heavy source content was suppressed before ranking.",
      severity: "info",
      type: "duplicate_suppression",
    });
  }

  if (fallbackState.missingAiProvider) {
    notes.push({
      detail: "No AI provider is called in this foundation path; narrative output is rule-based.",
      severity: "info",
      type: "missing_ai_provider",
    });
  }

  if (!topics.length) {
    notes.push({
      detail: "Topic coverage is unavailable because no ranked topics were produced.",
      severity: "warning",
      type: "missing_topic_coverage",
    });
  }

  if (rankedStories.some((story) => story.categories.includes("risk_volatility"))) {
    notes.push({
      detail: "Volatility or macro uncertainty appears in the ranked story set.",
      severity: "info",
      type: "high_volatility",
    });
  }

  if (fallbackState.socialPackUnavailable) {
    notes.push({
      detail: "Social Pack is unavailable but does not block the core Daily Brief preview.",
      severity: "info",
      type: "social_pack_unavailable",
    });
  }

  if (fallbackState.publishUnavailable) {
    notes.push({
      detail: "Publish is unavailable in this foundation preview; existing publish workflow remains unchanged.",
      severity: "info",
      type: "publish_unavailable",
    });
  }

  return notes;
}

export function buildDailyBrief2Diagnostics({
  failures,
  normalizedStories,
  publishAvailable,
  rankedStories,
  socialPackAvailable,
  topics,
}: DailyBrief2DiagnosticsInput): DailyBrief2Diagnostics {
  const fallbackState = buildDailyBrief2FallbackState({
    failures,
    normalizedStories,
    publishAvailable,
    rankedStories,
    socialPackAvailable,
    topics,
  });
  const providers = new Set(
    normalizedStories
      .map((story) => story.source.providerKey)
      .filter((providerKey): providerKey is string => Boolean(providerKey)),
  );

  return {
    aiDependencyStatus: "rule_based_only",
    dedupedStoryCount: Math.max(0, normalizedStories.length - rankedStories.length),
    fallbackState,
    lowConfidenceCount: rankedStories.filter((story) => story.sourceConfidence < 0.45).length,
    normalizedStoryCount: normalizedStories.length,
    providerIndependenceStatus:
      normalizedStories.length === 0 || providers.size !== 1 ? "pass" : "degraded",
    publicBriefReadiness: rankedStories.length
      ? fallbackState.limitedCoverage
        ? "limited"
        : "ready"
      : "limited",
    publicationDependencyStatus: "core_brief_independent",
    rankedStoryCount: rankedStories.length,
    sourceCount: new Set(normalizedStories.map((story) => story.source.id)).size,
    topicCount: topics.length,
  };
}

function normalizedDuplicateFailure(failures: EditorialFailureState[]) {
  return failures.some((failure) => failure.code === "duplicate_stories");
}
