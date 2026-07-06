import type {
  EditorialBrief,
  EditorialQualitySignal,
  EditorialStory,
  EditorialTopic,
  RawEditorialProviderItem,
} from "@/src/lib/editorial/editorial-types";
import type { EditorialIntelligenceResult } from "@/src/lib/editorial/intelligence";

export type WeeklyBrief2WeekRange = {
  end: string;
  label: string;
  start: string;
};

export type WeeklyBrief2FallbackState = {
  limitedBrief: boolean;
  limitedCoverage: boolean;
  missingAiProvider: boolean;
  missingWeeklyCoverage: boolean;
  noStories: boolean;
  socialPackUnavailable: boolean;
  suppressedDuplicateCount: number;
};

export type WeeklyBrief2CoverageStatus = {
  coveredThemes: string[];
  duplicateHeavyAreas: string[];
  lowCoverageAreas: string[];
  missingThemes: string[];
  sourceDiversity: number;
  sourceLabels: string[];
};

export type WeeklyBrief2ImportantStory = {
  id: string;
  reason: string;
  score: number;
  title: string;
};

export type WeeklyBrief2RadarItem = {
  confidence: number;
  focus: string;
  whyItMatters: string;
};

export type WeeklyBrief2RiskNote = {
  detail: string;
  severity: "info" | "warning";
};

export type WeeklyBrief2Diagnostics = {
  aiDependencyStatus: "rule_based_only";
  coverageConfidence: number;
  narrativeConfidence: number;
  relationshipCount: number;
  signalCount: number;
  sourceCount: number;
  storyCount: number;
  themeCount: number;
  topicCount: number;
};

export type WeeklyBrief2Snapshot = {
  coverageStatus: WeeklyBrief2CoverageStatus;
  diagnostics: WeeklyBrief2Diagnostics;
  disclaimer: string;
  editorialBrief: EditorialBrief;
  fallbackState: WeeklyBrief2FallbackState;
  generatedAt: string;
  importantStories: WeeklyBrief2ImportantStory[];
  intelligence: EditorialIntelligenceResult;
  narrativeSummary: string;
  nextWeekRadar: WeeklyBrief2RadarItem[];
  qualitySignals: EditorialQualitySignal[];
  riskNotes: WeeklyBrief2RiskNote[];
  title: string;
  topThemes: string[];
  version: "2.0-foundation";
  weekRange: WeeklyBrief2WeekRange;
  weeklyReview: string;
};

export type WeeklyBrief2BuildInput = {
  generatedAt?: string;
  items?: RawEditorialProviderItem[];
  socialPackAvailable?: boolean;
  weekEnd?: string;
  weekStart?: string;
};

export type WeeklyBrief2DiagnosticsInput = {
  editorialBrief: EditorialBrief;
  intelligence: EditorialIntelligenceResult;
  normalizedStories: EditorialStory[];
  rankedStories: EditorialStory[];
  socialPackAvailable: boolean;
  topics: EditorialTopic[];
};
