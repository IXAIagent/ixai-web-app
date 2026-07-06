import { buildEditorialProductionChecklist } from "@/src/lib/editorial/production/editorial-production-checklist";
import { buildEditorialProductionHealth } from "@/src/lib/editorial/production/editorial-production-health";
import { buildEditorialProductionMetrics } from "@/src/lib/editorial/production/editorial-production-metrics";
import { buildEditorialPublishQueue } from "@/src/lib/editorial/production/editorial-publish-queue";
import type {
  EditorialProductionInput,
  EditorialProductionMetadata,
  EditorialProductionFailureState,
  EditorialProductionStatus,
} from "@/src/lib/editorial/production/editorial-production-types";

function statusFromReady(ready: boolean, warning: boolean): EditorialProductionStatus {
  if (!ready) {
    return "blocked";
  }

  return warning ? "warning" : "ready";
}

function buildFailureState(input: EditorialProductionInput): EditorialProductionFailureState[] {
  return [
    ...input.providerDiagnostics.errors.map((error) => ({
      blocking: false,
      code: "provider_error",
      message: error,
      severity: "warning" as const,
    })),
    ...(input.rankedStoryCount === 0
      ? [
          {
            blocking: true,
            code: "no_ranked_stories",
            message: "No ranked stories are available.",
            severity: "critical" as const,
          },
        ]
      : []),
  ];
}

export function buildEditorialProductionMetadata(input: EditorialProductionInput): EditorialProductionMetadata {
  const metrics = buildEditorialProductionMetrics(input);
  const health = buildEditorialProductionHealth({ input, metrics });
  const checklist = buildEditorialProductionChecklist(input);
  const publishQueue = buildEditorialPublishQueue(input);
  const failureState = buildFailureState(input);

  return {
    checklist,
    failureState,
    health,
    metrics,
    pipeline: {
      draft: statusFromReady(input.rankedStoryCount > 0, input.providerDiagnostics.sourceStatus !== "real"),
      failureState,
      publishQueue,
      publishReadiness: statusFromReady(publishQueue.publishGuard.canPublish, health.status === "yellow"),
      retry: {
        attemptCount: input.providerDiagnostics.errors.length,
        lastAttemptAt: input.providerDiagnostics.errors.length ? input.generatedAt : undefined,
        retryable: input.providerDiagnostics.errors.length > 0,
      },
      review: statusFromReady(input.topicCount > 0, health.status !== "green"),
      stage: publishQueue.publishGuard.canPublish ? "review" : "draft",
    },
    providerDiagnostics: input.providerDiagnostics,
    schedulerReadiness: {
      autoPublishEnabled: false,
      mode: "draft_review_only",
      ready: input.rankedStoryCount > 0,
      reason: "Scheduler readiness is diagnostics-only. Auto-publish remains disabled.",
    },
  };
}
