import {
  getLatestPublishedBriefAsync,
  getPublishedBriefBySlugAsync,
  getPublishedIntelligenceBriefsAsync,
} from "@/src/lib/editorial/repository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");

  if (slug) {
    const brief = await getPublishedBriefBySlugAsync(slug);

    return Response.json({
      brief: brief ?? null,
    });
  }

  const briefs = await getPublishedIntelligenceBriefsAsync();
  const latest = briefs[0] ?? (await getLatestPublishedBriefAsync());

  return Response.json({
    briefs,
    latest,
  });
}
