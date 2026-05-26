import type { NextRequest } from "next/server";
import { createIdentitySession } from "@/src/lib/auth/session";
import {
  getSubscriberByEmail,
  normalizeEmail as normalizeSubscriberEmail,
  saveSubscriber,
  validateEmail,
} from "@/src/lib/distribution/subscribers";
import { log } from "@/src/lib/log";
import {
  getMembershipByEmail,
  upsertMembership,
  type MembershipRecord,
} from "@/src/lib/membership/memberships";

export const dynamic = "force-dynamic";

type SessionRequestBody = {
  email?: unknown;
  path?: unknown;
  source?: unknown;
};

function cleanString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim().slice(0, 220) : fallback;
}

function isProCandidate(membership: MembershipRecord, subscriberMetadata?: Record<string, string>) {
  return (
    membership.plan === "pro" ||
    membership.plan === "enterprise" ||
    membership.metadata?.intent === "pro_waitlist" ||
    membership.metadata?.pro_candidate === true ||
    subscriberMetadata?.intent === "pro_waitlist" ||
    subscriberMetadata?.pro_candidate === "true"
  );
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as SessionRequestBody;
  const email = cleanString(body.email);

  if (!validateEmail(email)) {
    return Response.json(
      {
        ok: false,
        message: "Invalid email.",
      },
      { status: 400 },
    );
  }

  const normalizedEmail = normalizeSubscriberEmail(email);
  const source = cleanString(body.source, "identity_session") || "identity_session";
  const path = cleanString(body.path, request.headers.get("referer") ?? "/");

  const subscriber = await getSubscriberByEmail(email).catch((error) => {
    log.warn("[ixai.identity] subscriber lookup failed", error);
    return null;
  });

  if (!subscriber) {
    await saveSubscriber({
      email,
      metadata: {
        intent: "identity_session",
      },
      path,
      referrer: request.headers.get("referer") ?? undefined,
      surface: source,
      userAgent: request.headers.get("user-agent") ?? undefined,
    }).catch((error) => {
      log.warn("[ixai.identity] subscriber capture skipped", error);
    });
  }

  let membership = await getMembershipByEmail(email).catch((error) => {
    log.warn("[ixai.identity] membership lookup failed", error);
    return null;
  });

  if (!membership) {
    const saved = await upsertMembership({
      email,
      metadata: {
        source: "lightweight_identity",
      },
      plan: "free",
      status: "active",
    });

    membership = saved.membership;
  }

  const session = await createIdentitySession({
    lineConnected: false,
    membershipPlan: membership.plan,
    membershipStatus: membership.status,
    normalizedEmail,
    proCandidate: isProCandidate(membership, subscriber?.metadata),
  });

  return Response.json({
    authenticated: true,
    identity: {
      normalized_email: session.normalized_email,
    },
    line_connected: session.line_connected,
    membership: {
      plan: session.membership_plan,
      status: session.membership_status,
    },
    ok: true,
    pro_candidate: session.pro_candidate,
  });
}
