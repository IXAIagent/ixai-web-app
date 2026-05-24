import { getLatestPublishedWeeklyDraftAsync, weeklyDraftToBrief } from "@/src/lib/editorial/weekly";

export const dynamic = "force-dynamic";

export async function GET() {
  const draft = await getLatestPublishedWeeklyDraftAsync();

  if (!draft) {
    return Response.json(
      {
        status: "empty",
        message: "No published Weekly Intelligence is available yet.",
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
