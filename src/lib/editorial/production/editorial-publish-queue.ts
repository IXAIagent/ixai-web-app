import type {
  EditorialProductionInput,
  EditorialPublishGuard,
  EditorialPublishQueueItem,
} from "@/src/lib/editorial/production/editorial-production-types";

export function buildEditorialPublishGuard(input: EditorialProductionInput): EditorialPublishGuard {
  const reasons: string[] = ["Manual publish is required. Scheduler remains draft/review only."];

  if (input.rankedStoryCount === 0) {
    reasons.push("No ranked stories are available.");
  }

  if (input.providerDiagnostics.publicationReadiness === "unavailable") {
    reasons.push("Provider publication readiness is unavailable.");
  }

  if (input.providerDiagnostics.errors.length > 0) {
    reasons.push("One or more provider errors were recorded.");
  }

  return {
    canPublish:
      input.rankedStoryCount > 0 &&
      input.providerDiagnostics.publicationReadiness !== "unavailable",
    manualOnly: true,
    reasons,
  };
}

export function buildEditorialPublishQueue(input: EditorialProductionInput): EditorialPublishQueueItem {
  const publishGuard = buildEditorialPublishGuard(input);

  return {
    briefId: input.briefId,
    createdAt: input.generatedAt,
    manualPublishRequired: true,
    productLine: input.productLine,
    publishGuard,
    queueState: publishGuard.canPublish
      ? "manual_publish_required"
      : input.rankedStoryCount > 0
        ? "ready_for_review"
        : "blocked",
  };
}
