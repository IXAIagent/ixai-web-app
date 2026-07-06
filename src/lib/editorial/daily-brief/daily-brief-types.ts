import type {
  EditorialBrief,
  EditorialFailureState,
  EditorialQualitySignal,
  EditorialStory,
  EditorialTopic,
  RawEditorialProviderItem,
} from "@/src/lib/editorial/editorial-types";

export type DailyBrief2MarketTone = "constructive" | "cautious" | "mixed" | "risk_off";

export type DailyBrief2UncertaintyLevel = "low" | "moderate" | "elevated";

export type DailyBrief2FocusItem = {
  confidence: number;
  relatedStories: string[];
  relatedTopic: string;
  riskNote?: string;
  summary: string;
  title: string;
  whyItMatters: string;
};

export type DailyBrief2MarketPulse = {
  majorDrivers: string[];
  marketTone: DailyBrief2MarketTone;
  sourceCoverageStatus: "strong" | "limited" | "unavailable";
  uncertaintyLevel: DailyBrief2UncertaintyLevel;
};

export type DailyBrief2RankedStory = {
  duplicationRisk: number;
  freshness: number;
  id: string;
  importance: number;
  rankingExplanation: string;
  rankingScore: number;
  relevance: number;
  sourceConfidence: number;
  title: string;
};

export type DailyBrief2RankedTopic = {
  id: string;
  importance: number;
  marketImpact: number;
  sourceDiversity: number;
  storyCount: number;
  summary: string;
  title: string;
};

export type DailyBrief2Narrative = {
  confidence: number;
  limitationNote?: string;
  narrativeBody: string;
  narrativeTitle: string;
  supportingStories: string[];
  supportingTopics: string[];
};

export type DailyBrief2RiskNote = {
  detail: string;
  severity: "info" | "warning";
  type:
    | "data_gap"
    | "duplicate_suppression"
    | "high_volatility"
    | "low_confidence"
    | "missing_ai_provider"
    | "missing_topic_coverage"
    | "publish_unavailable"
    | "social_pack_unavailable";
};

export type DailyBrief2SourceCoverage = {
  lowConfidenceCount: number;
  normalizedStoryCount: number;
  providerCount: number;
  rankedStoryCount: number;
  sourceCount: number;
  sourceLabels: string[];
  topicCount: number;
};

export type DailyBrief2FallbackState = {
  limitedBrief: boolean;
  limitedCoverage: boolean;
  missingAiProvider: boolean;
  missingTopicCoverage: boolean;
  noStories: boolean;
  publishUnavailable: boolean;
  socialPackUnavailable: boolean;
  suppressedDuplicateCount: number;
};

export type DailyBrief2PublicationReadiness = {
  canPreview: boolean;
  canPublish: boolean;
  reason: string;
  socialPackBlocking: false;
};

export type DailyBrief2Diagnostics = {
  aiDependencyStatus: "rule_based_only";
  dedupedStoryCount: number;
  fallbackState: DailyBrief2FallbackState;
  lowConfidenceCount: number;
  normalizedStoryCount: number;
  providerIndependenceStatus: "pass" | "degraded";
  publicBriefReadiness: "ready" | "limited" | "unavailable";
  publicationDependencyStatus: "core_brief_independent";
  rankedStoryCount: number;
  sourceCount: number;
  topicCount: number;
};

export type DailyBrief2Snapshot = {
  briefDate: string;
  diagnostics: DailyBrief2Diagnostics;
  disclaimer: string;
  editorialBrief: EditorialBrief;
  fallbackState: DailyBrief2FallbackState;
  generatedAt: string;
  keyNarratives: DailyBrief2Narrative[];
  marketPulse: DailyBrief2MarketPulse;
  publicationReadiness: DailyBrief2PublicationReadiness;
  qualitySignals: EditorialQualitySignal[];
  rankedStories: DailyBrief2RankedStory[];
  rankedTopics: DailyBrief2RankedTopic[];
  riskUncertaintyNotes: DailyBrief2RiskNote[];
  sourceCoverage: DailyBrief2SourceCoverage;
  subtitle: string;
  title: string;
  todayFocus: DailyBrief2FocusItem[];
  version: "2.0-foundation";
};

export type DailyBrief2BuildInput = {
  briefDate?: string;
  generatedAt?: string;
  items?: RawEditorialProviderItem[];
  publishAvailable?: boolean;
  socialPackAvailable?: boolean;
};

export type DailyBrief2DiagnosticsInput = {
  normalizedStories: EditorialStory[];
  rankedStories: EditorialStory[];
  topics: EditorialTopic[];
  failures: EditorialFailureState[];
  publishAvailable: boolean;
  socialPackAvailable: boolean;
};
