import type {
  EditorialProductionHealth,
  EditorialProductionInput,
  EditorialProductionMetrics,
} from "@/src/lib/editorial/production/editorial-production-types";

export function buildEditorialProductionHealth({
  input,
  metrics,
}: {
  input: EditorialProductionInput;
  metrics: EditorialProductionMetrics;
}): EditorialProductionHealth {
  const blockingIssues: string[] = [];
  const warningIssues: string[] = [];

  if (input.rankedStoryCount === 0) {
    blockingIssues.push("No ranked stories are available.");
  }

  if (input.providerDiagnostics.publicationReadiness === "unavailable") {
    blockingIssues.push("Provider publication readiness is unavailable.");
  }

  if (input.topicCount === 0) {
    warningIssues.push("No ranked topics are available.");
  }

  if (metrics.providerFailureCount > 0) {
    warningIssues.push("One or more provider failures were recorded.");
  }

  if (metrics.sourceCoverage < 0.5) {
    warningIssues.push("Source coverage is limited.");
  }

  if (metrics.qualityScore < 0.55) {
    warningIssues.push("Provider quality score is limited.");
  }

  return {
    blockingIssues,
    nextAction: blockingIssues.length
      ? "Regenerate draft after provider recovery or use limited brief fallback."
      : warningIssues.length
        ? "Review source coverage and publish manually if editorial quality is acceptable."
        : "Review and publish manually when ready.",
    status: blockingIssues.length ? "red" : warningIssues.length ? "yellow" : "green",
    warningIssues,
  };
}
