import type { NextRequest } from "next/server";
import { isAdminRequestAuthorized } from "@/src/lib/admin/auth";
import { log } from "@/src/lib/log";
import {
  getLineIdentitySnapshot,
} from "@/src/lib/subscribers/line-identity";
import {
  getAudienceSnapshot,
  isProfilePersistenceConfigured,
} from "@/src/lib/subscribers/profiles";

export const dynamic = "force-dynamic";

// v1.36.2 — Aggregated audience snapshot endpoint. Admin-only. Returns
// engagement / segment / surface aggregates derived from the subscriber
// profile graph. Never returns email addresses or per-user rows.

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

  try {
    const [snapshot, lineSnapshot] = await Promise.all([
      getAudienceSnapshot(),
      getLineIdentitySnapshot(),
    ]);

    // v1.36.4 — fold the LINE identity bridge totals into the audience
    // snapshot response so the admin UI can render LINE connection rate
    // alongside engagement metrics.
    const lineConnectedCount = Math.max(snapshot.lineConnectedCount, lineSnapshot.linkedCount);
    const lineConnectionRate =
      snapshot.totalProfiles > 0
        ? Math.round((lineConnectedCount / snapshot.totalProfiles) * 1000) / 10
        : 0;

    return Response.json({
      ok: true,
      snapshot: {
        ...snapshot,
        lineConnectedCount,
      },
      line: {
        mode: lineSnapshot.mode,
        configured: lineSnapshot.configured,
        linkedCount: lineSnapshot.linkedCount,
        recentlyActiveCount: lineSnapshot.recentlyActiveCount,
        uniqueEmailsLinked: lineSnapshot.uniqueEmailsLinked,
        connectionRate: lineConnectionRate,
      },
      note: isProfilePersistenceConfigured()
        ? "Audience profiles are aggregated server-side; emails never leave the database."
        : "Supabase service-role env is unavailable; running in memory-mode (counts will be zero on cold start).",
    });
  } catch (error) {
    log.warn("[ixai.audience.admin] snapshot failed", error);
    return Response.json(
      {
        ok: false,
        message: "Unable to load audience snapshot.",
      },
      { status: 502 },
    );
  }
}
