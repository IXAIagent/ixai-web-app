import { ImageResponse } from "next/og";
import { getPublishedBriefBySlugAsync } from "@/src/lib/editorial/repository";
import { getDailyBriefBySlug } from "@/src/lib/dailyBriefs";
import {
  getNextWeekRange,
  selectUpcomingEvents,
} from "@/src/lib/editorial/weekly-calendar";
import {
  OG_HEIGHT,
  OG_WIDTH,
  renderIntelligenceCard,
  type IntelligenceCardEvent,
} from "@/app/api/og/_lib/intelligence-card";

// v1.33.1 — Daily Brief OG card. Mirrors the weekly card layout so the
// IXAI brand reads the same across surfaces. Upcoming events come from
// the curated calendar (Daily intake itself has no calendar; the chips
// give readers concrete catalysts ahead of them).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function deriveWeekAnchor(publishedAt?: string): string {
  if (!publishedAt) {
    return new Date().toISOString().slice(0, 10);
  }
  return publishedAt.slice(0, 10).replace(/[./]/g, "-");
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug") ?? "";

  const persisted = slug ? await getPublishedBriefBySlugAsync(slug) : null;
  const localBrief = slug ? getDailyBriefBySlug(slug) : null;

  const narrative = persisted?.intelligence?.narrative ?? null;

  const surfaceLabel = "Daily Brief";
  const publishedAt =
    persisted?.publishedAt ?? localBrief?.publishedAt ?? "";
  const contextLine = publishedAt
    ? publishedAt
    : "AI · Fed · Taiwan · Crypto";

  const title =
    narrative?.marketNarrative ??
    persisted?.marketSummary ??
    localBrief?.marketSummary ??
    persisted?.title ??
    localBrief?.title ??
    "IXAI Daily Brief — risk-first read of today's market.";

  // Daily card pulls event chips from the curated upcoming-week calendar
  // window around its publish date. No new providers, no live news fetch.
  const anchor = deriveWeekAnchor(publishedAt);
  const { nextWeekStart, nextWeekEnd } = getNextWeekRange(anchor);
  const upcoming = selectUpcomingEvents({ nextWeekStart, nextWeekEnd });
  const events: IntelligenceCardEvent[] = upcoming.map((event) => ({
    date: event.date,
    title: event.title,
    category: event.category,
  }));

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
