import {
  buildEditorialPipelineDiagnostics,
} from "@/src/lib/editorial/editorial-diagnostics";
import {
  normalizeEditorialStories,
} from "@/src/lib/editorial/editorial-normalization";
import { buildEditorialIntelligence } from "@/src/lib/editorial/intelligence";
import {
  buildRuleBasedEditorialBrief,
} from "@/src/lib/editorial/narrative-builder";
import { rankEditorialStories } from "@/src/lib/editorial/story-ranking";
import { rankEditorialTopics } from "@/src/lib/editorial/topic-ranking";
import {
  buildDailyBrief2Diagnostics,
  buildDailyBrief2FallbackState,
  buildDailyBrief2PublicationReadiness,
  buildDailyBrief2RiskNotes,
  buildDailyBrief2SourceCoverage,
} from "@/src/lib/editorial/daily-brief/daily-brief-diagnostics";
import {
  getEditorialProviderSourceResult,
  getEditorialProviderSourceResultAsync,
} from "@/src/lib/editorial/providers";
import type {
  DailyBrief2BuildInput,
  DailyBrief2FocusItem,
  DailyBrief2MarketPulse,
  DailyBrief2Narrative,
  DailyBrief2RankedStory,
  DailyBrief2RankedTopic,
  DailyBrief2Snapshot,
} from "@/src/lib/editorial/daily-brief/daily-brief-types";
import type { EditorialStory, EditorialTopic } from "@/src/lib/editorial/editorial-types";

const DISCLAIMER =
  "IXAI Daily Brief is public market awareness only. It is not investment advice, trading advice, a buy/sell/hold signal, a target price, or a portfolio recommendation.";

function productDate() {
  return new Date().toISOString().slice(0, 10);
}

function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function toRankedStory(story: EditorialStory): DailyBrief2RankedStory {
  return {
    duplicationRisk: story.duplicationRisk,
    freshness: story.freshness,
    id: story.id,
    importance: story.importance,
    rankingExplanation: [
      `importance ${Math.round(story.importance * 100)}%`,
      `freshness ${Math.round(story.freshness * 100)}%`,
      `relevance ${Math.round(story.marketRelevance * 100)}%`,
      `source confidence ${Math.round(story.sourceConfidence * 100)}%`,
    ].join(" · "),
    rankingScore: story.rankingScore ?? 0,
    relevance: story.marketRelevance,
    sourceConfidence: story.sourceConfidence,
    title: story.title,
  };
}

function toRankedTopic(topic: EditorialTopic): DailyBrief2RankedTopic {
  return {
    id: topic.id,
    importance: topic.importance,
    marketImpact: topic.marketImpact,
    sourceDiversity: topic.sourceDiversity,
    storyCount: topic.storyCount,
    summary: topic.summary,
    title: topic.title,
  };
}

function buildTodayFocus(topics: EditorialTopic[]): DailyBrief2FocusItem[] {
  return topics.slice(0, 3).map((topic) => {
    const supportingStories = topic.stories.slice(0, 3);
    const confidence = average(supportingStories.map((story) => story.sourceConfidence));
    const hasRiskStory = supportingStories.some((story) =>
      story.categories.some((category) => category.includes("risk") || category.includes("volatility")),
    );

    return {
      confidence,
      relatedStories: supportingStories.map((story) => story.id),
      relatedTopic: topic.id,
      riskNote: hasRiskStory
        ? "Risk or volatility appears in the source set; treat this as market awareness, not a trading signal."
        : undefined,
      summary: topic.summary,
      title: topic.title,
      whyItMatters: `${topic.title} ranked as a top public-market theme based on story importance, source diversity, and market impact.`,
    };
  });
}

function buildMarketPulse(stories: EditorialStory[], topics: EditorialTopic[]): DailyBrief2MarketPulse {
  const averageImportance = average(stories.map((story) => story.importance));
  const riskStoryCount = stories.filter((story) =>
    story.categories.some((category) => category.includes("risk") || category.includes("volatility")),
  ).length;
  const lowConfidenceCount = stories.filter((story) => story.sourceConfidence < 0.45).length;

  return {
    majorDrivers: topics.slice(0, 4).map((topic) => topic.title),
    marketTone:
      riskStoryCount > 1
        ? "cautious"
        : averageImportance >= 0.75
          ? "constructive"
          : "mixed",
    sourceCoverageStatus:
      stories.length === 0 ? "unavailable" : lowConfidenceCount > 0 ? "limited" : "strong",
    uncertaintyLevel:
      riskStoryCount > 1 || lowConfidenceCount > 0
        ? "elevated"
        : averageImportance >= 0.7
          ? "moderate"
          : "low",
  };
}

function buildKeyNarratives(topics: EditorialTopic[]): DailyBrief2Narrative[] {
  return topics.slice(0, 3).map((topic) => {
    const supportingStories = topic.stories.slice(0, 3);
    const confidence = average(supportingStories.map((story) => story.sourceConfidence));

    return {
      confidence,
      limitationNote:
        confidence < 0.55
          ? "Source confidence is limited; editorial review should confirm this narrative."
          : undefined,
      narrativeBody: `${topic.summary} This narrative is generated from ranked public-market stories and does not use portfolio holdings.`,
      narrativeTitle: topic.title,
      supportingStories: supportingStories.map((story) => story.id),
      supportingTopics: [topic.id],
    };
  });
}

function buildDailyBrief2SnapshotFromProviderSource({
  input,
  providerSource,
}: {
  input: DailyBrief2BuildInput;
  providerSource: ReturnType<typeof getEditorialProviderSourceResult>;
}): DailyBrief2Snapshot {
  const items = input.items ?? providerSource.stories;
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const briefDate = input.briefDate ?? productDate();
  const publishAvailable = input.publishAvailable ?? false;
  const socialPackAvailable = input.socialPackAvailable ?? false;
  const normalizedStories = normalizeEditorialStories(items);
  const rankedStories = rankEditorialStories(normalizedStories);
  const rankedTopics = rankEditorialTopics(rankedStories);
  const intelligence = buildEditorialIntelligence({
    generatedAt,
    stories: rankedStories,
    topics: rankedTopics,
  });
  const editorialBrief = buildRuleBasedEditorialBrief({
    id: `daily-brief-2-${briefDate}`,
    items,
    productLine: "daily",
  });
  const pipelineDiagnostics = buildEditorialPipelineDiagnostics({
    brief: editorialBrief,
    publicationDependsOnSocialPack: false,
  });
  const diagnosticsInput = {
    failures: editorialBrief.failures,
    normalizedStories,
    publishAvailable,
    rankedStories,
    socialPackAvailable,
    topics: rankedTopics,
  };
  const fallbackState = buildDailyBrief2FallbackState(diagnosticsInput);
  const publicationReadiness = buildDailyBrief2PublicationReadiness({
    fallbackState,
    rankedStories,
  });
  const sourceCoverage = buildDailyBrief2SourceCoverage({
    normalizedStories,
    rankedStories,
    topics: rankedTopics,
  });
  const riskUncertaintyNotes = buildDailyBrief2RiskNotes({
    failures: editorialBrief.failures,
    fallbackState,
    rankedStories,
    topics: rankedTopics,
  });
  const diagnostics = buildDailyBrief2Diagnostics(diagnosticsInput);

  return {
    briefDate,
    diagnostics,
    disclaimer: DISCLAIMER,
    editorialBrief: {
      ...editorialBrief,
      generatedAt,
    },
    fallbackState,
    generatedAt,
    intelligence,
    keyNarratives: buildKeyNarratives(rankedTopics),
    marketPulse: buildMarketPulse(rankedStories, rankedTopics),
    publicationReadiness,
    providerDiagnostics: providerSource.diagnostics,
    qualitySignals: [...editorialBrief.qualitySignals, pipelineDiagnostics.providerIndependence],
    rankedStories: rankedStories.map(toRankedStory),
    rankedTopics: rankedTopics.map(toRankedTopic),
    riskUncertaintyNotes,
    sourceCoverage,
    subtitle:
      "A rule-based preview of what matters in the public market today, built from normalized editorial stories.",
    title: "Daily Brief 2.0 Foundation Preview",
    todayFocus: buildTodayFocus(rankedTopics),
    version: "2.0-foundation",
  };
}

export function buildDailyBrief2Snapshot(input: DailyBrief2BuildInput = {}): DailyBrief2Snapshot {
  return buildDailyBrief2SnapshotFromProviderSource({
    input,
    providerSource: getEditorialProviderSourceResult(),
  });
}

export async function buildDailyBrief2SnapshotAsync(
  input: DailyBrief2BuildInput = {},
): Promise<DailyBrief2Snapshot> {
  return buildDailyBrief2SnapshotFromProviderSource({
    input,
    providerSource: await getEditorialProviderSourceResultAsync(),
  });
}
