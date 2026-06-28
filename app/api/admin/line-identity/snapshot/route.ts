import type { NextRequest } from "next/server";
import { isAdminRequestAuthorized } from "@/src/lib/admin/auth";
import { getLineConfigState } from "@/src/lib/line/config";
import { getPendingLineLinkCount } from "@/src/lib/line/identity-merge";
import { log } from "@/src/lib/log";
import { getMembershipSnapshot } from "@/src/lib/membership/memberships";
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
    log.warn(`[ixai.line.admin] ${label} fallback`, error);
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

  const [line, audience, membership] = await Promise.all([
    settledAdminValue("lineIdentity", getLineIdentitySnapshot, {
      linkedCount: 0,
      mode: "memory",
      uniqueEmailsLinked: 0,
    } as unknown as Awaited<ReturnType<typeof getLineIdentitySnapshot>>),
    settledAdminValue("audience", getAudienceSnapshot, {
      lineConnectedCount: 0,
      returningReaderCount: 0,
    } as unknown as Awaited<ReturnType<typeof getAudienceSnapshot>>),
    settledAdminValue("membership", getMembershipSnapshot, {
      proCandidates: 0,
    } as unknown as Awaited<ReturnType<typeof getMembershipSnapshot>>),
  ]);
    const lineConnectedUsers = Math.max(line.linkedCount, audience.lineConnectedCount);
    const unifiedIdentities = Math.max(line.uniqueEmailsLinked, audience.lineConnectedCount);

    return Response.json({
      ok: true,
      snapshot: {
        config: getLineConfigState(),
        lineConnectedProCandidates: Math.min(unifiedIdentities, membership.proCandidates),
        lineConnectedReturningUsers: Math.min(unifiedIdentities, audience.returningReaderCount),
        lineConnectedUsers,
        mode: line.mode,
        pendingLineLinks: getPendingLineLinkCount(),
        unifiedIdentities,
      },
    });
}
