import type { NextRequest } from "next/server";
import { isAdminRequestAuthorized } from "@/src/lib/admin/auth";
import { listSubscriberStats } from "@/src/lib/distribution/subscribers";
import { log } from "@/src/lib/log";

export const dynamic = "force-dynamic";

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
    const stats = await listSubscriberStats();

    return Response.json({
      ok: true,
      stats,
    });
  } catch (error) {
    log.warn("[ixai.distribution.admin] subscriber stats failed", error);

    return Response.json(
      {
        ok: false,
        message: "Unable to load subscriber stats.",
      },
      { status: 502 },
    );
  }
}
