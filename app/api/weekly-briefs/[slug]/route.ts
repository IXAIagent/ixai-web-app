import { getPublishedWeeklyDraftBySlugAsync, weeklyDraftToBrief } from "@/src/lib/editorial/weekly";

export const dynamic = "force-dynamic";

type PublicWeeklyRouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, context: PublicWeeklyRouteContext) {
  const { slug } = await context.params;
  const draft = await getPublishedWeeklyDraftBySlugAsync(slug);

  if (!draft) {
    return Response.json(
      {
        status: "not_found",
        message: "Weekly Intelligence not found or not published.",
      },
      { status: 404 },
    );
  }

  return Response.json(
    {
      brief: weeklyDraftToBrief(draft),
    },
    {
      headers: {
        "cache-control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
}
