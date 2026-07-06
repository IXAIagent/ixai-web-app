import { normalizeEditorialStories } from "@/src/lib/editorial/editorial-normalization";
import { buildEditorialIntelligence } from "@/src/lib/editorial/intelligence";
import { buildRuleBasedEditorialBrief } from "@/src/lib/editorial/narrative-builder";
import {
  getEditorialProviderSourceResult,
  getEditorialProviderSourceResultAsync,
} from "@/src/lib/editorial/providers";
import { rankEditorialStories } from "@/src/lib/editorial/story-ranking";
import { rankEditorialTopics } from "@/src/lib/editorial/topic-ranking";
import {
  buildWeeklyBrief2CoverageStatus,
  buildWeeklyBrief2Diagnostics,
  buildWeeklyBrief2FallbackState,
  buildWeeklyBrief2RiskNotes,
} from "@/src/lib/editorial/weekly-brief/weekly-brief-diagnostics";
import type {
  WeeklyBrief2BuildInput,
  WeeklyBrief2ImportantStory,
  WeeklyBrief2RadarItem,
  WeeklyBrief2Snapshot,
  WeeklyBrief2WeekRange,
} from "@/src/lib/editorial/weekly-brief/weekly-brief-types";
import type { EditorialStory } from "@/src/lib/editorial/editorial-types";

const DISCLAIMER =
  "IXAI Weekly Brief is public market awareness only. It is not investment advice, trading advice, a buy/sell/hold signal, a target price, or a portfolio recommendation.";

function productDate() {
  return new Date().toISOString().slice(0, 10);
}

function toDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function defaultWeekRange(now = new Date()): WeeklyBrief2WeekRange {
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const start = new Date(end);
  start.setUTCDate(end.getUTCDate() - 6);

  return {
    end: toDateOnly(end),
    label: `${toDateOnly(start)} to ${toDateOnly(end)}`,
    start: toDateOnly(start),
  };
}

function buildWeekRange(input: WeeklyBrief2BuildInput): WeeklyBrief2WeekRange {
  if (input.weekStart && input.weekEnd) {
    return {
      end: input.weekEnd,
      label: `${input.weekStart} to ${input.weekEnd}`,
      start: input.weekStart,
    };
  }

  return defaultWeekRange(input.generatedAt ? new Date(input.generatedAt) : undefined);
}

function importantStoryReason(story: EditorialStory) {
  return [
    `importance ${Math.round(story.importance * 100)}%`,
    `market relevance ${Math.round(story.marketRelevance * 100)}%`,
    `source confidence ${Math.round(story.sourceConfidence * 100)}%`,
  ].join(" · ");
}

function buildImportantStories(stories: EditorialStory[]): WeeklyBrief2ImportantStory[] {
  return stories.slice(0, 6).map((story) => ({
    id: story.id,
    reason: importantStoryReason(story),
    score: story.rankingScore ?? 0,
    title: story.title,
  }));
}

function buildNextWeekRadar(snapshot: {
  themes: string[];
  topStory?: EditorialStory;
}): WeeklyBrief2RadarItem[] {
  const radar = snapshot.themes.slice(0, 4).map((theme) => ({
    confidence: 0.68,
    focus: theme,
    whyItMatters: `${theme} was a top weekly theme and should remain on the public-market radar next week.`,
  }));

  if (snapshot.topStory) {
    radar.unshift({
      confidence: snapshot.topStory.sourceConfidence,
      focus: snapshot.topStory.title,
      whyItMatters:
        "This was the highest-ranked weekly story and may shape the next public brief if follow-up coverage appears.",
    });
  }

  return radar.slice(0, 5);
}

function buildWeeklyBrief2SnapshotFromProviderSource({
  input,
  providerSource,
}: {
  input: WeeklyBrief2BuildInput;
  providerSource: ReturnType<typeof getEditorialProviderSourceResult>;
}): WeeklyBrief2Snapshot {
  const items = input.items ?? providerSource.stories;
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const socialPackAvailable = input.socialPackAvailable ?? false;
  const weekRange = buildWeekRange(input);
  const normalizedStories = normalizeEditorialStories(items);
  const rankedStories = rankEditorialStories(normalizedStories);
  const rankedTopics = rankEditorialTopics(rankedStories);
  const editorialBrief = buildRuleBasedEditorialBrief({
    id: `weekly-brief-2-${weekRange.start}-${weekRange.end}`,
    items,
    productLine: "weekly",
  });
  const intelligence = buildEditorialIntelligence({
    generatedAt,
    stories: rankedStories,
    topics: rankedTopics,
  });
  const diagnosticsInput = {
    editorialBrief,
    intelligence,
    normalizedStories,
    rankedStories,
    socialPackAvailable,
    topics: rankedTopics,
  };
  const fallbackState = buildWeeklyBrief2FallbackState(diagnosticsInput);
  const coverageStatus = buildWeeklyBrief2CoverageStatus(diagnosticsInput);
  const riskNotes = buildWeeklyBrief2RiskNotes({
    fallbackState,
    intelligence,
  });
  const topThemes = intelligence.themes.slice(0, 5).map((theme) => theme.label);
  const importantStories = buildImportantStories(rankedStories);

  return {
    coverageStatus,
    diagnostics: buildWeeklyBrief2Diagnostics(diagnosticsInput),
    disclaimer: DISCLAIMER,
    editorialBrief: {
      ...editorialBrief,
      generatedAt,
    },
    fallbackState,
    generatedAt,
    importantStories,
    intelligence,
    narrativeSummary:
      rankedTopics.length > 0
        ? rankedTopics
            .slice(0, 4)
            .map((topic) => `${topic.title}: ${topic.summary}`)
            .join(" ")
        : "Limited weekly source coverage is available; this preview uses a rule-based limited summary.",
    nextWeekRadar: buildNextWeekRadar({
      themes: topThemes,
      topStory: rankedStories[0],
    }),
    providerDiagnostics: providerSource.diagnostics,
    qualitySignals: editorialBrief.qualitySignals,
    riskNotes,
    title: `Weekly Brief 2.0 Foundation Preview — ${productDate()}`,
    topThemes,
    version: "2.0-foundation",
    weekRange,
    weeklyReview:
      "This deterministic weekly foundation groups normalized market stories into themes, relationships, signals, and coverage status without calling an external provider or AI model.",
  };
}

export function buildWeeklyBrief2Snapshot(input: WeeklyBrief2BuildInput = {}): WeeklyBrief2Snapshot {
  return buildWeeklyBrief2SnapshotFromProviderSource({
    input,
    providerSource: getEditorialProviderSourceResult(),
  });
}

export async function buildWeeklyBrief2SnapshotAsync(
  input: WeeklyBrief2BuildInput = {},
): Promise<WeeklyBrief2Snapshot> {
  return buildWeeklyBrief2SnapshotFromProviderSource({
    input,
    providerSource: await getEditorialProviderSourceResultAsync(),
  });
}
