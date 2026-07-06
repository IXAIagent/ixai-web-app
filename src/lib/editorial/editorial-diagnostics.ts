import type {
  EditorialBrief,
  EditorialFailureState,
  EditorialPipelineDiagnostics,
  EditorialQualitySignal,
} from "@/src/lib/editorial/editorial-types";

function signal({
  detail,
  id,
  label,
  pass,
}: {
  detail: string;
  id: string;
  label: string;
  pass: boolean;
}): EditorialQualitySignal {
  return {
    detail,
    id,
    label,
    severity: pass ? "info" : "warning",
    status: pass ? "pass" : "degraded",
  };
}

export function buildEditorialPipelineDiagnostics({
  brief,
  publicationDependsOnSocialPack = false,
}: {
  brief: EditorialBrief;
  publicationDependsOnSocialPack?: boolean;
}): EditorialPipelineDiagnostics {
  const providerKeys = new Set(
    brief.sources
      .map((source) => source.providerKey)
      .filter((providerKey): providerKey is string => Boolean(providerKey)),
  );
  const hasProviderAbstraction = brief.sources.every((source) => source.id && source.kind);
  const providerIndependent = hasProviderAbstraction && providerKeys.size !== 1;
  const blockingFailures = brief.failures.filter((failure) => failure.publishBlocking);

  return {
    fallbackReadiness: signal({
      detail: brief.failures.length
        ? "Fallback and degradation states are recorded."
        : "No fallback was needed for this brief.",
      id: "fallback-readiness",
      label: "Fallback readiness",
      pass: blockingFailures.length === 0,
    }),
    failures: brief.failures,
    notes: buildNotes(brief.failures, publicationDependsOnSocialPack),
    providerIndependence: signal({
      detail: providerIndependent
        ? "Sources use IXAI-owned source objects and are not hard-bound to one provider."
        : "One provider or placeholder source dominates; keep downstream contracts provider-neutral.",
      id: "provider-independence",
      label: "Provider independence",
      pass: providerIndependent || brief.sources.length === 0,
    }),
    publicationDependency: signal({
      detail: publicationDependsOnSocialPack
        ? "Publication appears coupled to Social Pack and should be split."
        : "Core brief publication is independent from Social Pack.",
      id: "publication-dependency",
      label: "Publication dependency",
      pass: !publicationDependsOnSocialPack,
    }),
    ready: blockingFailures.length === 0,
    sourceCount: brief.sources.length,
    storyCount: brief.stories.length,
    topicCount: brief.topics.length,
  };
}

function buildNotes(failures: EditorialFailureState[], publicationDependsOnSocialPack: boolean) {
  const notes = [
    "V16A Sprint 1 is deterministic and rule-based only.",
    "No external provider fetch, AI provider call, scheduler auto-publish, or notification delivery is performed.",
  ];

  if (failures.some((failure) => failure.code === "no_sources")) {
    notes.push("No source state degrades to a limited brief instead of stopping publication.");
  }

  if (failures.some((failure) => failure.code === "missing_ai_provider")) {
    notes.push("Missing AI provider uses rule-based summary fallback.");
  }

  if (publicationDependsOnSocialPack) {
    notes.push("Social Pack must remain downstream optional and non-blocking.");
  }

  return notes;
}
