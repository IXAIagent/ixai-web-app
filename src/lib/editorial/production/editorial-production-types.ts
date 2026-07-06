import type { EditorialProviderDiagnostics } from "@/src/lib/editorial/providers";

export type EditorialProductionStage = "draft" | "review" | "publish_ready" | "queued" | "published";

export type EditorialProductionStatus = "ready" | "warning" | "blocked";

export type EditorialRetryMetadata = {
  attemptCount: number;
  lastAttemptAt?: string;
  nextRetryAt?: string;
  retryable: boolean;
};

export type EditorialProductionFailureState = {
  blocking: boolean;
  code: string;
  message: string;
  severity: "info" | "warning" | "critical";
};

export type EditorialPublishQueueItem = {
  briefId: string;
  createdAt: string;
  manualPublishRequired: true;
  productLine: "daily" | "weekly";
  publishGuard: EditorialPublishGuard;
  queueState: "not_queued" | "ready_for_review" | "manual_publish_required" | "blocked";
};

export type EditorialPublishGuard = {
  canPublish: boolean;
  manualOnly: true;
  reasons: string[];
};

export type EditorialProductionMetrics = {
  cacheHitRate: number;
  fallbackCount: number;
  generationLatencyMs: number;
  providerFailureCount: number;
  providerSuccessRate: number;
  publicationReadiness: number;
  qualityScore: number;
  sourceCoverage: number;
};

export type EditorialProductionHealth = {
  blockingIssues: string[];
  nextAction: string;
  status: "green" | "yellow" | "red";
  warningIssues: string[];
};

export type EditorialProductionChecklistItem = {
  key: string;
  label: string;
  passed: boolean;
  required: boolean;
};

export type EditorialProductionChecklist = {
  items: EditorialProductionChecklistItem[];
  passed: boolean;
};

export type EditorialProductionMetadata = {
  checklist: EditorialProductionChecklist;
  failureState: EditorialProductionFailureState[];
  health: EditorialProductionHealth;
  metrics: EditorialProductionMetrics;
  pipeline: {
    draft: EditorialProductionStatus;
    failureState: EditorialProductionFailureState[];
    publishQueue: EditorialPublishQueueItem;
    publishReadiness: EditorialProductionStatus;
    retry: EditorialRetryMetadata;
    review: EditorialProductionStatus;
    stage: EditorialProductionStage;
  };
  providerDiagnostics: EditorialProviderDiagnostics;
  schedulerReadiness: {
    autoPublishEnabled: false;
    mode: "draft_review_only";
    ready: boolean;
    reason: string;
  };
};

export type EditorialProductionInput = {
  briefId: string;
  generatedAt: string;
  productLine: "daily" | "weekly";
  providerDiagnostics: EditorialProviderDiagnostics;
  rankedStoryCount: number;
  topicCount: number;
};
