import type { NextRequest } from "next/server";
import { isAdminRequestAuthorized } from "@/src/lib/admin/auth";
import { log } from "@/src/lib/log";
import { listSubscriberStats } from "@/src/lib/distribution/subscribers";
import { getMembershipSnapshot } from "@/src/lib/membership/memberships";
import { getAudienceSnapshot } from "@/src/lib/subscribers/profiles";
import { getLineIdentitySnapshot } from "@/src/lib/subscribers/line-identity";

export const dynamic = "force-dynamic";

async function settledAdminValue<TData>(
  label: string,
  task: () => Promise<TData>,
  fallback: TData,
) {
  try {
    return await task();
  } catch (error) {
    log.warn(`[ixai.identity.admin] ${label} fallback`, error);
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

  const [subscriberStats, membership, audience, line] = await Promise.all([
    settledAdminValue("subscriberStats", listSubscriberStats, {
      activeSubscribers: 0,
      persistence: "fallback",
      totalSubscribers: 0,
    } as unknown as Awaited<ReturnType<typeof listSubscriberStats>>),
    settledAdminValue("membership", getMembershipSnapshot, {
      activePro: 0,
      totalMembers: 0,
    } as unknown as Awaited<ReturnType<typeof getMembershipSnapshot>>),
    settledAdminValue("audience", getAudienceSnapshot, {
      lineConnectedCount: 0,
      returningReaderCount: 0,
      totalProfiles: 0,
    } as unknown as Awaited<ReturnType<typeof getAudienceSnapshot>>),
    settledAdminValue("lineIdentity", getLineIdentitySnapshot, {
      linkedCount: 0,
    } as unknown as Awaited<ReturnType<typeof getLineIdentitySnapshot>>),
  ]);
    const identifiedUsers = Math.max(subscriberStats.activeSubscribers, membership.totalMembers);
    const anonymousVisitors = Math.max(audience.totalProfiles - identifiedUsers, 0);
    const denominator = identifiedUsers + anonymousVisitors;

    return Response.json({
      ok: true,
      snapshot: {
        activeIdentitySessions: subscriberStats.activeSubscribers,
        anonymousVisitors,
        avgSessionAgeDays: 0,
        identifiedRatio: denominator
          ? Number(((identifiedUsers / denominator) * 100).toFixed(1))
          : 0,
        lineConnectedIdentities: Math.max(audience.lineConnectedCount, line.linkedCount),
        mode: subscriberStats.persistence,
        proIdentifiedUsers: membership.activePro,
        returningIdentifiedUsers: audience.returningReaderCount,
      },
      note:
        "Identity sessions are signed httpOnly cookies. Active session count is estimated from active subscribers until server-side session storage is added.",
    });
}
