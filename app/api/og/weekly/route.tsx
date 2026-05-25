import { ImageResponse } from "next/og";
import { getPublishedWeeklyDraftBySlugAsync } from "@/src/lib/editorial/weekly";
import {
  OG_HEIGHT,
  OG_WIDTH,
  renderIntelligenceCard,
  type IntelligenceCardEvent,
} from "@/app/api/og/_lib/intelligence-card";

// v1.33.1 — Weekly Intelligence OG card. Node runtime keeps the existing
// editorial repository helpers compatible (Supabase fetch, content
// imports).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug") ?? "";

  const brief = slug ? await getPublishedWeeklyDraftBySlugAsync(slug) : null;
  const narrative = brief?.sections.narrative ?? null;

  const surfaceLabel = "Weekly Intelligence";
  const contextLine = brief
    ? `${brief.weekStart} – ${brief.weekEnd}`
    : "AI · Macro · Taiwan · Crypto";
  const title =
    narrative?.marketNarrative ??
    brief?.summary ??
    brief?.title ??
    "IXAI Weekly Intelligence — past-week recap and next-week catalysts.";

  const events: IntelligenceCardEvent[] = (brief?.sections.upcomingWeek ?? []).map(
    (event) => ({
      date: event.date,
      title: event.title,
      category: event.category,
    }),
  );

  return new ImageResponse(
    renderIntelligenceCard({
      surfaceLabel,
      contextLine,
      title,
      narrative,
      events,
    }),
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
    },
  );
}
