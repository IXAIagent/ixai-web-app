import type { NextRequest } from "next/server";
import { isAdminRequestAuthorized } from "@/src/lib/admin/auth";
import { getLineConfigState } from "@/src/lib/line/config";
import { getPendingLineLinkCount } from "@/src/lib/line/identity-merge";
import { log } from "@/src/lib/log";
import { getLineIdentitySnapshot } from "@/src/lib/subscribers/line-identity";
import { getAudienceSnapshot } from "@/src/lib/subscribers/profiles";

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

  try {
    const [line, audience] = await Promise.all([
      getLineIdentitySnapshot(),
      getAudienceSnapshot(),
    ]);
    const config = getLineConfigState();

    return Response.json({
      ok: true,
      snapshot: {
        connectedLineIdentities: Math.max(line.linkedCount, audience.lineConnectedCount),
        liffReady: config.liffReady,
        liffSessionRestores: 0,
        lineLoginReady: config.loginReady,
        pendingLineLinks: getPendingLineLinkCount(),
        unifiedIdentities: Math.max(line.uniqueEmailsLinked, audience.lineConnectedCount),
      },
    });
  } catch (error) {
    log.warn("[ixai.lineLogin.admin] snapshot failed", error);

    return Response.json(
      {
        message: "Unable to load LINE Login snapshot.",
        ok: false,
      },
      { status: 502 },
    );
  }
}
