import {
  createEditorialFailureState,
  normalizeEditorialStories,
} from "@/src/lib/editorial/editorial-normalization";
import { rankEditorialStories } from "@/src/lib/editorial/story-ranking";
import { rankEditorialTopics } from "@/src/lib/editorial/topic-ranking";
import type {
  EditorialBrief,
  EditorialFailureState,
  EditorialNarrative,
  EditorialProductLine,
  EditorialQualitySignal,
  EditorialSource,
  RawEditorialProviderItem,
} from "@/src/lib/editorial/editorial-types";

const COMPLIANCE_NOTE =
  "IXAI provides monitoring and market awareness only. This is not investment advice.";

function uniqueSources(stories: { source: EditorialSource }[]) {
  const sources = new Map<string, EditorialSource>();

  for (const story of stories) {
    sources.set(story.source.id, story.source);
  }

  return [...sources.values()];
}

function buildQualitySignals({
  failures,
  sourceCount,
  storyCount,
  topicCount,
}: {
  failures: EditorialFailureState[];
  sourceCount: number;
  storyCount: number;
  topicCount: number;
}): EditorialQualitySignal[] {
  return [
    {
      detail:
        sourceCount > 0
          ? `${sourceCount} normalized editorial source(s) available.`
          : "No normalized editorial sources are available.",
      id: "source-coverage",
      label: "Source coverage",
      severity: sourceCount > 0 ? "info" : "warning",
      status: sourceCount > 0 ? "pass" : "degraded",
    },
    {
      detail:
        storyCount > 0
          ? `${storyCount} ranked story candidate(s) available.`
          : "No story candidates are available; use limited brief fallback.",
      id: "story-coverage",
      label: "Story coverage",
      severity: storyCount > 0 ? "info" : "warning",
      status: storyCount > 0 ? "pass" : "degraded",
    },
    {
      detail:
        topicCount > 0
          ? `${topicCount} topic group(s) ranked deterministically.`
          : "No topic grouping is available.",
      id: "topic-coverage",
      label: "Topic coverage",
      severity: topicCount > 0 ? "info" : "warning",
      status: topicCount > 0 ? "pass" : "degraded",
    },
    {
      detail:
        failures.length > 0
          ? `${failures.length} degradation state(s) recorded.`
          : "No degradation state recorded.",
      id: "degradation",
      label: "Failure degradation",
      severity: failures.some((failure) => failure.severity === "critical") ? "critical" : "info",
      status: failures.some((failure) => failure.publishBlocking) ? "fail" : "pass",
    },
  ];
}

function buildNarrative({
  productLine,
  topics,
  limited,
}: {
  productLine: EditorialProductLine;
  topics: ReturnType<typeof rankEditorialTopics>;
  limited: boolean;
}): EditorialNarrative {
  const topTopics = topics.slice(0, productLine === "weekly" ? 5 : 3);
  const title =
    productLine === "weekly"
      ? "Weekly market relevance review"
      : "Daily market relevance brief";

  if (!topTopics.length) {
    return {
      complianceNote: COMPLIANCE_NOTE,
      keyPoints: ["Limited market coverage is available right now."],
      limited: true,
      marketSummary: "Limited source coverage is available. IXAI can produce a limited brief only.",
      productLine,
      title,
      topics: [],
      whyItMatters:
        "This fallback prevents the public brief from stopping when source or AI coverage is unavailable.",
    };
  }

  return {
    complianceNote: COMPLIANCE_NOTE,
    keyPoints: topTopics.map((topic) => topic.title),
    limited,
    marketSummary: topTopics
      .map((topic) => `${topic.title}: ${topic.summary}`)
      .join(" "),
    productLine,
    title,
    topics: topTopics,
    whyItMatters:
      "These topics ranked highest by importance, freshness, market relevance, source diversity, and duplication controls.",
  };
}

export function buildRuleBasedEditorialBrief({
  id,
  items,
  productLine,
}: {
  id: string;
  items: RawEditorialProviderItem[];
  productLine: EditorialProductLine;
}): EditorialBrief {
  const failures: EditorialFailureState[] = [];

  if (!items.length) {
    failures.push(
      createEditorialFailureState("no_sources", "No source items were available.", {
        fallbackUsed: "limited_brief",
      }),
    );
  }

  failures.push(
    createEditorialFailureState("missing_ai_provider", "AI provider is not used in V16A Sprint 1.", {
      fallbackUsed: "rule_based_summary",
      severity: "info",
    }),
  );

  const normalizedStories = normalizeEditorialStories(items);
  const rankedStories = rankEditorialStories(normalizedStories);
  const rankedTopics = rankEditorialTopics(rankedStories);
  const lowConfidence = rankedStories.some((story) => story.sourceConfidence < 0.45);
  const duplicateSuppression = normalizedStories.length > rankedStories.length;

  if (lowConfidence) {
    failures.push(
      createEditorialFailureState("low_confidence", "One or more sources have low confidence.", {
        fallbackUsed: "limited_brief",
      }),
    );
  }

  if (duplicateSuppression) {
    failures.push(
      createEditorialFailureState("duplicate_stories", "Duplicate stories were suppressed.", {
        fallbackUsed: "none",
        severity: "info",
      }),
    );
  }

  const sources = uniqueSources(rankedStories);
  const limited = !rankedStories.length || lowConfidence;
  const narrative = buildNarrative({
    limited,
    productLine,
    topics: rankedTopics,
  });
  const qualitySignals = buildQualitySignals({
    failures,
    sourceCount: sources.length,
    storyCount: rankedStories.length,
    topicCount: rankedTopics.length,
  });

  return {
    failures,
    generatedAt: new Date().toISOString(),
    id,
    narrative,
    productLine,
    qualitySignals,
    sources,
    status: rankedStories.length ? (limited ? "limited" : "ready") : "limited",
    stories: rankedStories,
    topics: rankedTopics,
  };
}
