import type { NextRequest } from "next/server";
import { isAdminRequestAuthorized } from "@/src/lib/admin/auth";
import {
  isDailyIntelligencePersistenceReadable,
  isDailyIntelligencePersistenceWritable,
} from "@/src/lib/editorial/persistence";
import { getDraftsAsync, saveDraftAsync } from "@/src/lib/editorial/repository";
import { generateDailyIntelligenceDraftFromNews } from "@/src/lib/intelligence/generator";
import { getLatestNewsIntakeResult } from "@/src/lib/news/providers";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isAdminRequestAuthorized(request)) {
    return Response.json(
      {
        status: "unauthorized",
        message: "Missing or invalid admin gate token.",
      },
      { status: 401 },
    );
  }

  const intake = await getLatestNewsIntakeResult();
  const previousBriefs = await getDraftsAsync();
  const sourceLabels = [
    ...new Set(
      (intake.sourceStatus ?? intake.sources)
        .filter((source) => source.status === "success" && source.itemCount > 0)
        .map((source) => source.label),
    ),
  ];
  const draft = await generateDailyIntelligenceDraftFromNews(intake.items, {
    previousBriefs,
    sourceMode: intake.mode,
    sourceLabels,
    sourceStatus: intake.sourceStatus ?? intake.sources,
  });
  const drafts = await saveDraftAsync(draft);
  const intelligence = draft.intelligence;

  return Response.json({
    draft,
    drafts,
    persistence: {
      readable: isDailyIntelligencePersistenceReadable(),
      writable: isDailyIntelligencePersistenceWritable(),
    },
    intake,
    ai: {
      providerMode: intelligence?.providerMode ?? "fallback",
      providerStatus: intelligence?.providerStatus,
      openAIKeyDetected: intelligence?.providerStatus?.openAIKeyDetected ?? false,
      model: intelligence?.providerStatus?.model ?? "unknown",
      errorReason: intelligence?.providerStatus?.errorReason,
      errorMessage: intelligence?.providerStatus?.errorMessage,
      inputNewsCount: intelligence?.inputNewsCount ?? intake.itemCount,
      coverageScore: intelligence?.coverageScore,
      contentQuality: intelligence?.contentQuality,
      sourceMode: intelligence?.sourceMode ?? intake.mode,
      generatedAt: intelligence?.generatedAt ?? draft.createdAt,
      complianceNote: intelligence?.complianceNote,
      editorialReviewRequired: true,
    },
  });
}
