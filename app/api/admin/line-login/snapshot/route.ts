import type { NextRequest } from "next/server";
import { isAdminRequestAuthorized } from "@/src/lib/admin/auth";
import { getLineConfigState } from "@/src/lib/line/config";
import { getPendingLineLinkCount } from "@/src/lib/line/identity-merge";
import { log } from "@/src/lib/log";
import { getLineIdentitySnapshot } from "@/src/lib/subscribers/line-identity";
import { getAudienceSnapshot } from "@/src/lib/subscribers/profiles";

export const dynamic = "force-dynamic";

async function settledAdminValue<TData>(
  label: string,
  task: () => Promise<TData>,
  fallback: TData,
) {
  try {
    return await task();
  } catch (error) {
    log.warn(`[ixai.lineLogin.admin] ${label} fallback`, error);
    return fallback;
  }
}

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

  const [line, audience] = await Promise.all([
    settledAdminValue("lineIdentity", getLineIdentitySnapshot, {
      linkedCount: 0,
      uniqueEmailsLinked: 0,
    } as unknown as Awaited<ReturnType<typeof getLineIdentitySnapshot>>),
    settledAdminValue("audience", getAudienceSnapshot, {
      lineConnectedCount: 0,
    } as unknown as Awaited<ReturnType<typeof getAudienceSnapshot>>),
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
}
