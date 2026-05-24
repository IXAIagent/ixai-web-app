import type { NextRequest } from "next/server";
import {
  generateWeeklyIntelligenceDraft,
  isWeeklyPersistenceReadable,
  isWeeklyPersistenceWritable,
} from "@/src/lib/editorial/weekly";
import { getExpectedCronSecret, isSchedulerConfigured } from "@/src/lib/editorial/scheduler";

export const dynamic = "force-dynamic";

function getCronToken(request: NextRequest) {
  return (
    request.headers.get("x-cron-secret") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    new URL(request.url).searchParams.get("token") ??
    ""
  );
}

export async function POST(request: NextRequest) {
  if (!isSchedulerConfigured()) {
    return Response.json(
      {
        status: "not_configured",
        message: "CRON_SECRET or IXAI_CRON_SECRET is required for scheduled weekly generation.",
      },
      { status: 503 },
    );
  }

  const expected = getExpectedCronSecret();
  const token = getCronToken(request);

  if (!token || token !== expected) {
    return Response.json(
      {
        status: "unauthorized",
        message: "Missing or invalid cron secret.",
      },
      { status: 401 },
    );
  }

  const url = new URL(request.url);
  const force = url.searchParams.get("force") === "1";
  const { draft, summary } = await generateWeeklyIntelligenceDraft({ force });

  return Response.json({
    status: summary.status,
    draftSlug: draft.slug,
    generatedAt: summary.generatedAt,
    sourceMode: summary.sourceMode,
    itemCount: summary.itemCount,
    sourceStatus: summary.sourceStatus,
    persistence: {
      readable: isWeeklyPersistenceReadable(),
      writable: isWeeklyPersistenceWritable(),
    },
    note: "Weekly cron creates draft/review material only. It never publishes.",
  });
}

export async function GET(request: NextRequest) {
  return POST(request);
}
