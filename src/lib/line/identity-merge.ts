import { createHash, randomBytes } from "node:crypto";
import type { IdentitySession } from "@/src/lib/auth/session";
import { createIdentitySession } from "@/src/lib/auth/session";
import {
  getSubscriberByEmail,
  normalizeEmail as normalizeSubscriberEmail,
  saveSubscriber,
  validateEmail,
  type SubscriberLookup,
} from "@/src/lib/distribution/subscribers";
import { getLineConfigState } from "@/src/lib/line/config";
import { log } from "@/src/lib/log";
import {
  getMembershipByEmail,
  upsertMembership,
  type MembershipRecord,
} from "@/src/lib/membership/memberships";
import {
  getLineIdentityByEmail,
  upsertLineIdentity,
  type LineIdentityRecord,
} from "@/src/lib/subscribers/line-identity";
import { setProfileTag, upsertSubscriberProfile } from "@/src/lib/subscribers/profiles";

export type UnifiedIdentity = {
  intelligence_sync_ready: boolean;
  line_identity: LineIdentityRecord | null;
  membership: MembershipRecord | null;
  session_identity: IdentitySession | null;
  subscriber_profile: SubscriberLookup | null;
  unified_tags: string[];
};

export type PendingLineLink = {
  createdAt: string;
  expiresAt: string;
  normalizedEmail: string;
  tokenHash: string;
};

const PENDING_LINK_TTL_MS = 15 * 60 * 1000;
const MAX_PENDING_LINKS = 500;
let pendingLineLinks: PendingLineLink[] = [];

function isProCandidate(membership: MembershipRecord | null, subscriber?: SubscriberLookup | null) {
  return Boolean(
    membership?.plan === "pro" ||
      membership?.plan === "enterprise" ||
      membership?.metadata?.intent === "pro_waitlist" ||
      membership?.metadata?.pro_candidate === true ||
      subscriber?.metadata?.intent === "pro_waitlist" ||
      subscriber?.metadata?.pro_candidate === "true",
  );
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function prunePendingLinks() {
  const now = Date.now();
  pendingLineLinks = pendingLineLinks
    .filter((link) => Date.parse(link.expiresAt) > now)
    .slice(0, MAX_PENDING_LINKS);
}

function buildTags({
  lineIdentity,
  membership,
  session,
  subscriber,
}: {
  lineIdentity: LineIdentityRecord | null;
  membership: MembershipRecord | null;
  session: IdentitySession | null;
  subscriber: SubscriberLookup | null;
}) {
  const tags = new Set<string>();

  if (lineIdentity || session?.line_connected) tags.add("line_connected");
  if (membership?.plan) tags.add(`membership_${membership.plan}`);
  if (membership?.status) tags.add(`membership_${membership.status}`);
  if (isProCandidate(membership, subscriber)) tags.add("pro_candidate");
  if (subscriber?.source_surface) tags.add(`source_${subscriber.source_surface}`);

  return [...tags].sort();
}

export async function isLineConnected(identity: IdentitySession | string | null | undefined) {
  const email = typeof identity === "string" ? identity : identity?.normalized_email;
  if (!email || !validateEmail(email)) {
    return false;
  }

  return Boolean(await getLineIdentityByEmail(email));
}

export async function resolveUnifiedIdentity(
  identity: IdentitySession | string | null | undefined,
): Promise<UnifiedIdentity> {
  const email = typeof identity === "string" ? identity : identity?.normalized_email;
  const normalizedEmail = email ? normalizeSubscriberEmail(email) : "";

  if (!normalizedEmail || !validateEmail(normalizedEmail)) {
    return {
      intelligence_sync_ready: false,
      line_identity: null,
      membership: null,
      session_identity: typeof identity === "string" ? null : identity ?? null,
      subscriber_profile: null,
      unified_tags: [],
    };
  }

  const [subscriber, membership, lineIdentity] = await Promise.all([
    getSubscriberByEmail(normalizedEmail).catch((error) => {
      log.warn("[ixai.line.merge] subscriber resolve failed", error);
      return null;
    }),
    getMembershipByEmail(normalizedEmail).catch((error) => {
      log.warn("[ixai.line.merge] membership resolve failed", error);
      return null;
    }),
    getLineIdentityByEmail(normalizedEmail).catch((error) => {
      log.warn("[ixai.line.merge] line resolve failed", error);
      return null;
    }),
  ]);

  const session = typeof identity === "string" ? null : identity ?? null;
  const lineConnected = Boolean(lineIdentity || session?.line_connected);

  return {
    intelligence_sync_ready: lineConnected,
    line_identity: lineIdentity,
    membership,
    session_identity: session,
    subscriber_profile: subscriber,
    unified_tags: buildTags({ lineIdentity, membership, session, subscriber }),
  };
}

export async function mergeIdentitySession(session: IdentitySession) {
  const unified = await resolveUnifiedIdentity(session);
  const membership = unified.membership;
  const subscriber = unified.subscriber_profile;

  if (!membership) {
    return session;
  }

  return createIdentitySession({
    lineConnected: Boolean(unified.line_identity || session.line_connected),
    membershipPlan: membership.plan,
    membershipStatus: membership.status,
    normalizedEmail: session.normalized_email,
    proCandidate: isProCandidate(membership, subscriber),
  });
}

export async function linkLineIdentity({
  displayName,
  email,
  lineUserId,
  session,
  source = "line_connect",
}: {
  displayName?: string;
  email?: string;
  lineUserId?: string;
  session?: IdentitySession | null;
  source?: string;
}) {
  const normalizedEmail = normalizeSubscriberEmail(email || session?.normalized_email || "");
  if (!validateEmail(normalizedEmail)) {
    throw new Error("line_merge_invalid_email");
  }

  await saveSubscriber({
    email: normalizedEmail,
    metadata: {
      intent: "line_identity_merge",
    },
    surface: source,
  }).catch((error) => {
    log.warn("[ixai.line.merge] subscriber upsert skipped", error);
  });

  let membership = await getMembershipByEmail(normalizedEmail).catch(() => null);
  if (!membership) {
    membership = (
      await upsertMembership({
        email: normalizedEmail,
        metadata: {
          source: "line_identity_merge",
        },
        plan: "free",
        status: "active",
      })
    ).membership;
  }

  if (lineUserId?.trim()) {
    const identity = await upsertLineIdentity({
      displayName,
      email: normalizedEmail,
      lineUserId,
      metadata: {
        merge_source: source,
      },
      source,
    });

    if (identity) {
      await upsertSubscriberProfile({
        email: normalizedEmail,
        metadata: {
          line_merge_source: source,
        },
      }).catch(() => null);
      await setProfileTag({ email: normalizedEmail, enabled: true, tag: "line_connected" }).catch(
        () => null,
      );
    }

    return {
      identity,
      membership,
      pending: null,
      status: identity ? "connected" : "pending",
    };
  }

  prunePendingLinks();
  const token = randomBytes(24).toString("base64url");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + PENDING_LINK_TTL_MS).toISOString();
  pendingLineLinks = [
    {
      createdAt: now.toISOString(),
      expiresAt,
      normalizedEmail,
      tokenHash: hashToken(token),
    },
    ...pendingLineLinks.filter((link) => link.normalizedEmail !== normalizedEmail),
  ].slice(0, MAX_PENDING_LINKS);

  return {
    identity: null,
    membership,
    pending: {
      expiresAt,
      token,
    },
    status: "pending",
  };
}

export function getPendingLineLinkCount() {
  prunePendingLinks();
  return pendingLineLinks.length;
}

export function getUnifiedLineConfigState() {
  return getLineConfigState();
}
