import {
  getLatestPublishedBriefAsync,
  getPublishedBriefBySlugAsync,
  getPublishedIntelligenceBriefsAsync,
} from "@/src/lib/editorial/repository";
import type { DailyBriefDraft, DailyIntelligenceDraft } from "@/src/types/editorial";

export const dynamic = "force-dynamic";

function toPublicIntelligence(intelligence: DailyIntelligenceDraft): DailyIntelligenceDraft {
  const publicIntelligence: DailyIntelligenceDraft = { ...intelligence };

  delete publicIntelligence.providerMode;
  delete publicIntelligence.providerStatus;
  delete publicIntelligence.sourceMode;
  delete publicIntelligence.sourceLabels;
  delete publicIntelligence.inputNewsCount;
  delete publicIntelligence.coverageScore;
  delete publicIntelligence.contentQuality;
  delete publicIntelligence.providerHealth;

  return publicIntelligence;
}

function toPublicBrief(brief: DailyBriefDraft): DailyBriefDraft {
  return {
    ...brief,
    intelligence: brief.intelligence ? toPublicIntelligence(brief.intelligence) : undefined,
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");

  if (slug) {
    const brief = await getPublishedBriefBySlugAsync(slug);

    return Response.json({
      brief: brief ? toPublicBrief(brief) : null,
    });
  }

  const briefs = (await getPublishedIntelligenceBriefsAsync()).map(toPublicBrief);
  const latest = briefs[0] ?? toPublicBrief(await getLatestPublishedBriefAsync());

  return Response.json({
    briefs,
    latest,
  });
}
