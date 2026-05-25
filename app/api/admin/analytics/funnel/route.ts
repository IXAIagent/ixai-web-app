import type { NextRequest } from "next/server";
import { isAdminRequestAuthorized } from "@/src/lib/admin/auth";
import { log } from "@/src/lib/log";
import {
  FUNNEL_STAGES,
  decorateFunnelStages,
  emptyFunnelSnapshot,
  eventInClause,
  type FunnelStageKey,
} from "@/src/lib/analytics/funnels";
import { listSubscriberStats } from "@/src/lib/distribution/subscribers";

export const dynamic = "force-dynamic";

// v1.36.3 — Conversion funnel aggregation. Talks to PostHog via HogQL
// when env is configured; otherwise returns the empty-state shape so
// the admin UI renders without errors.

type StageHogQlRow = [string, number];
type CapturePathHogQlRow = [string | null, number];

function getPosthogServerConfig() {
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://us.i.posthog.com";
  const projectId = process.env.POSTHOG_PROJECT_ID?.trim();
  const personalApiKey = process.env.POSTHOG_PERSONAL_API_KEY?.trim();

  if (!projectId || !personalApiKey) {
    return null;
  }

  return { host: host.replace(/\/$/, ""), projectId, personalApiKey };
}

async function queryPosthog<T>(
  config: NonNullable<ReturnType<typeof getPosthogServerConfig>>,
  query: string,
) {
  const response = await fetch(`${config.host}/api/projects/${config.projectId}/query/`, {
    body: JSON.stringify({
      query: { kind: "HogQLQuery", query },
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
    throw new Error(`PostHog funnel query failed: ${response.status} ${body.slice(0, 160)}`);
  }

  return (await response.json()) as { results?: T[] };
}

// Returning visitor = a distinct_id that had `page_view` on at least
// two separate calendar days within the 7-day window. The threshold is
// deliberately session-day rather than event-count so a noisy single
// session doesn't inflate the figure.
const FUNNEL_WINDOW_DAYS = 7;

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
  const subscriberStats = await listSubscriberStats().catch(() => null);
  const totalSubscribers = subscriberStats?.activeSubscribers ?? 0;

  if (!config) {
    const snapshot = emptyFunnelSnapshot("disabled");
    snapshot.totalSubscribers = totalSubscribers;
    return Response.json({
      ok: true,
      snapshot,
      note: "PostHog server aggregation is disabled until POSTHOG_PROJECT_ID and POSTHOG_PERSONAL_API_KEY are configured.",
    });
  }

  try {
    // Per-stage unique-visitor counts. read_depth_50 carries the
    // predicate from the stage definition.
    const stageQueries = FUNNEL_STAGES.map((stage) => {
      const predicate = stage.predicate ? ` AND ${stage.predicate}` : "";
      return `
        SELECT
          '${stage.key}' AS stage,
          count(DISTINCT distinct_id) AS visitors
        FROM events
        WHERE ${eventInClause(stage)}
          AND timestamp >= now() - INTERVAL ${FUNNEL_WINDOW_DAYS} DAY
          ${predicate}
      `.trim();
    }).join(" UNION ALL ");

    const stageQuery = stageQueries;

    const returningQuery = `
      SELECT
        '${"return_visit" satisfies FunnelStageKey}' AS stage,
        count(DISTINCT distinct_id) AS visitors
      FROM (
        SELECT distinct_id, count(DISTINCT toDate(timestamp)) AS days
        FROM events
        WHERE event = 'page_view'
          AND timestamp >= now() - INTERVAL ${FUNNEL_WINDOW_DAYS} DAY
        GROUP BY distinct_id
        HAVING days >= 2
      )
    `;

    const capturePathQuery = `
      SELECT
        toString(properties['surface']) AS surface,
        count() AS captures
      FROM events
      WHERE event = 'email_capture_success'
        AND timestamp >= now() - INTERVAL ${FUNNEL_WINDOW_DAYS} DAY
      GROUP BY properties['surface']
      ORDER BY captures DESC
      LIMIT 5
    `;

    const [stageResult, returningResult, capturePathsResult] = await Promise.all([
      queryPosthog<StageHogQlRow>(config, stageQuery),
      queryPosthog<StageHogQlRow>(config, returningQuery),
      queryPosthog<CapturePathHogQlRow>(config, capturePathQuery),
    ]);

    const rawCounts: Record<FunnelStageKey, number> = {
      landing: 0,
      article_open: 0,
      read_depth_50: 0,
      cta_click: 0,
      subscribe: 0,
      return_visit: 0,
    };

    for (const row of stageResult.results ?? []) {
      const [stage, visitors] = row;
      if (stage in rawCounts) {
        rawCounts[stage as FunnelStageKey] = visitors;
      }
    }

    const returningRow = returningResult.results?.[0];
    if (returningRow) {
      rawCounts.return_visit = returningRow[1];
    }

    // Surface the subscribers table count as the floor for "Subscribe"
    // — PostHog counts events but the durable Supabase row count is the
    // truth source for total subscribers.
    if (totalSubscribers > rawCounts.subscribe) {
      rawCounts.subscribe = totalSubscribers;
    }

    const stages = decorateFunnelStages(rawCounts);
    const topCapturePaths = (capturePathsResult.results ?? [])
      .map(([surface, count]) => ({
        path: surface?.trim() || "(unknown)",
        count: Number(count) || 0,
      }))
      .filter((row) => row.count > 0);

    return Response.json({
      ok: true,
      snapshot: {
        mode: "posthog" as const,
        windowDays: FUNNEL_WINDOW_DAYS,
        stages,
        totalSubscribers,
        totalReturningReaders: rawCounts.return_visit,
        topCapturePaths,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    log.warn("[ixai.analytics.funnel] aggregation failed", error);
    const snapshot = emptyFunnelSnapshot("posthog");
    snapshot.totalSubscribers = totalSubscribers;
    return Response.json(
      {
        ok: true,
        snapshot,
        note: "PostHog query temporarily unavailable; aggregated counts will refresh on the next call.",
      },
      { status: 200 },
    );
  }
}
