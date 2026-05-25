import type { NextRequest } from "next/server";
import { isAdminRequestAuthorized } from "@/src/lib/admin/auth";
import { log } from "@/src/lib/log";

export const dynamic = "force-dynamic";

type HogQlRow = [
  string,
  string | null,
  string | null,
  string | null,
  string,
  number,
];

type IdentityHogQlRow = [number, number];

const TRACKED_EVENTS = [
  "weekly_open",
  "daily_open",
  "market_open",
  "share_click",
  "cta_click",
  "distribution_cta_click",
  "email_capture_submit",
  "email_capture_success",
  "share_to_x",
  "share_to_line",
  "share_to_linkedin",
];

function getPosthogServerConfig() {
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://us.i.posthog.com";
  const projectId = process.env.POSTHOG_PROJECT_ID?.trim();
  const personalApiKey = process.env.POSTHOG_PERSONAL_API_KEY?.trim();

  if (!projectId || !personalApiKey) {
    return null;
  }

  return { host: host.replace(/\/$/, ""), projectId, personalApiKey };
}

function emptySnapshot(mode: "disabled" | "posthog") {
  return {
    mode,
    weeklyOpens: 0,
    dailyOpens: 0,
    marketOpens: 0,
    shareClicks: 0,
    ctaClicks: 0,
    knownSubscribers: 0,
    anonymousVisitors: 0,
    subscriberConversionRate: 0,
    topSurfaces: [] as { label: string; count: number }[],
    topReferrers: [] as { label: string; count: number }[],
    topUtmSources: [] as { label: string; count: number }[],
    trends: [] as { date: string; count: number }[],
  };
}

async function queryPosthog<T>(
  config: NonNullable<ReturnType<typeof getPosthogServerConfig>>,
  query: string,
) {
  const response = await fetch(`${config.host}/api/projects/${config.projectId}/query/`, {
    body: JSON.stringify({
      query: {
        kind: "HogQLQuery",
        query,
      },
    }),
    cache: "no-store",
    headers: {
      authorization: `Bearer ${config.personalApiKey}`,
      "content-type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`PostHog query failed: ${response.status} ${body.slice(0, 160)}`);
  }

  return (await response.json()) as { results?: T[] };
}

function increment(map: Map<string, number>, key: string | null | undefined, count: number) {
  const label = key?.trim();

  if (!label) {
    return;
  }

  map.set(label, (map.get(label) ?? 0) + count);
}

function topRows(map: Map<string, number>) {
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

export async function GET(request: NextRequest) {
  if (!isAdminRequestAuthorized(request)) {
    return Response.json(
      {
        status: "unauthorized",
        message: "Missing or invalid admin session.",
      },
      { status: 401 },
    );
  }

  const config = getPosthogServerConfig();

  if (!config) {
    return Response.json({
      ok: true,
      snapshot: emptySnapshot("disabled"),
      note: "PostHog server aggregation is disabled until POSTHOG_PROJECT_ID and POSTHOG_PERSONAL_API_KEY are configured.",
    });
  }

  try {
    const eventQuery = `
      SELECT
        event,
        toString(properties['surface']),
        toString(properties['referrer']),
        toString(properties['attribution']['utm_source']),
        toString(toDate(timestamp)),
        count()
      FROM events
      WHERE event IN (${TRACKED_EVENTS.map((event) => `'${event}'`).join(",")})
        AND timestamp >= now() - INTERVAL 7 DAY
      GROUP BY event, properties['surface'], properties['referrer'], properties['attribution']['utm_source'], toDate(timestamp)
      ORDER BY toDate(timestamp) DESC
      LIMIT 500
    `;

    const identityQuery = `
      SELECT
        count(DISTINCT distinct_id),
        count(DISTINCT CASE WHEN event = 'email_capture_success' THEN distinct_id ELSE NULL END)
      FROM events
      WHERE event IN (${[...TRACKED_EVENTS, "page_view"].map((event) => `'${event}'`).join(",")})
        AND timestamp >= now() - INTERVAL 7 DAY
    `;

    const payload = await queryPosthog<HogQlRow>(config, eventQuery);
    const identityPayload = await queryPosthog<IdentityHogQlRow>(config, identityQuery);
    const rows = payload.results ?? [];
    const identityRow = identityPayload.results?.[0];
    const surfaces = new Map<string, number>();
    const referrers = new Map<string, number>();
    const utmSources = new Map<string, number>();
    const trends = new Map<string, number>();
    const snapshot = emptySnapshot("posthog");

    for (const [event, surface, referrer, utmSource, date, count] of rows) {
      if (event === "weekly_open") snapshot.weeklyOpens += count;
      if (event === "daily_open") snapshot.dailyOpens += count;
      if (event === "market_open") snapshot.marketOpens += count;
      if (event.startsWith("share_") || event === "share_click") snapshot.shareClicks += count;
      if (event === "cta_click" || event === "distribution_cta_click") snapshot.ctaClicks += count;

      increment(surfaces, surface, count);
      increment(referrers, referrer, count);
      increment(utmSources, utmSource, count);
      increment(trends, date, count);
    }

    snapshot.topSurfaces = topRows(surfaces);
    snapshot.topReferrers = topRows(referrers);
    snapshot.topUtmSources = topRows(utmSources);
    snapshot.trends = [...trends.entries()]
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    if (identityRow) {
      const [uniqueVisitors, knownSubscribers] = identityRow;
      snapshot.knownSubscribers = knownSubscribers;
      snapshot.anonymousVisitors = Math.max(uniqueVisitors - knownSubscribers, 0);
      snapshot.subscriberConversionRate = uniqueVisitors
        ? Number(((knownSubscribers / uniqueVisitors) * 100).toFixed(1))
        : 0;
    }

    return Response.json({
      ok: true,
      snapshot,
    });
  } catch (error) {
    log.warn("[ixai.analytics.admin] PostHog snapshot failed", error);

    return Response.json(
      {
        ok: false,
        message: "Unable to load analytics snapshot.",
      },
      { status: 502 },
    );
  }
}
