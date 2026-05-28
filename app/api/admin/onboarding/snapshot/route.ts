import type { NextRequest } from "next/server";
import { isAdminRequestAuthorized } from "@/src/lib/admin/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isAdminRequestAuthorized(request)) {
    return Response.json(
      {
        message: "Missing or invalid admin session.",
        status: "unauthorized",
      },
      { status: 401 },
    );
  }

  return Response.json({
    ok: true,
    snapshot: {
      completionRate: 0,
      completed: 0,
      mode: "analytics-ready",
      started: 0,
      topInterests: [],
      topMarkets: [],
      updatedAt: new Date().toISOString(),
    },
    note:
      "Onboarding profile state is local/session-first in v1.40. Durable aggregation will come from analytics or future profile persistence.",
  });
}
