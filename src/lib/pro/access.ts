import type { IdentitySession } from "@/src/lib/auth/session";
import {
  getMembershipByEmail,
  type MembershipRecord,
} from "@/src/lib/membership/memberships";
import { getSupabaseServerConfig } from "@/src/lib/supabase/server";

export type ProAccessStatus =
  | "not_connected"
  | "connected"
  | "preview"
  | "active"
  | "expired"
  | "revoked";

export type ProAccessSource = "supabase" | "manual" | "fallback";

export type ProAccessState = {
  status: ProAccessStatus;
  canOpenPro: boolean;
  canUsePortfolio: boolean;
  canUseFCN: boolean;
  billingRequired: boolean;
  source: ProAccessSource;
  reason: string;
};

export type ProAccessIdentity = {
  authenticated: boolean;
  email?: string | null;
  source: ProAccessSource;
  proCandidate?: boolean;
};

type SupabaseUserResponse = {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

const NOT_CONNECTED_ACCESS: ProAccessState = {
  billingRequired: false,
  canOpenPro: false,
  canUseFCN: false,
  canUsePortfolio: false,
  reason: "Sign in to connect your App identity before Pro access can be evaluated.",
  source: "fallback",
  status: "not_connected",
};

function hasExpired(membership: MembershipRecord) {
  if (membership.status === "expired") {
    return true;
  }

  if (!membership.expires_at) {
    return false;
  }

  const expiresAt = new Date(membership.expires_at).getTime();

  return Number.isFinite(expiresAt) && expiresAt <= Date.now();
}

function isProCandidate(membership: MembershipRecord | null, identity?: ProAccessIdentity) {
  if (identity?.proCandidate) {
    return true;
  }

  if (!membership) {
    return false;
  }

  return (
    membership.status === "trial" ||
    membership.metadata?.intent === "pro_waitlist" ||
    membership.metadata?.pro_candidate === true ||
    membership.metadata?.manual_access === true ||
    membership.metadata?.preview_access === true
  );
}

function buildAccessFromMembership(
  membership: MembershipRecord | null,
  identity: ProAccessIdentity,
): ProAccessState {
  if (!identity.authenticated) {
    return NOT_CONNECTED_ACCESS;
  }

  if (!membership) {
    return {
      billingRequired: true,
      canOpenPro: false,
      canUseFCN: false,
      canUsePortfolio: false,
      reason:
        "Your App identity is connected. Pro backend account linking is in progress. Full Pro access will require preview approval or paid entitlement.",
      source: identity.source,
      status: "connected",
    };
  }

  if (membership.status === "cancelled") {
    return {
      billingRequired: true,
      canOpenPro: false,
      canUseFCN: false,
      canUsePortfolio: false,
      reason: "Pro access was revoked or cancelled.",
      source: identity.source,
      status: "revoked",
    };
  }

  if (hasExpired(membership)) {
    return {
      billingRequired: true,
      canOpenPro: false,
      canUseFCN: false,
      canUsePortfolio: false,
      reason: "Pro access has expired. Billing or manual renewal will be required.",
      source: identity.source,
      status: "expired",
    };
  }

  if (membership.plan === "pro" || membership.plan === "enterprise") {
    return {
      billingRequired: false,
      canOpenPro: true,
      canUseFCN: true,
      canUsePortfolio: true,
      reason: "You have active Pro access. Backend portfolio integration is being staged.",
      source: identity.source,
      status: "active",
    };
  }

  if (isProCandidate(membership, identity)) {
    return {
      billingRequired: true,
      canOpenPro: true,
      canUseFCN: false,
      canUsePortfolio: false,
      reason:
        "You have preview access. Portfolio / FCN backend integration is still being connected.",
      source: identity.source,
      status: "preview",
    };
  }

  return {
    billingRequired: true,
    canOpenPro: false,
    canUseFCN: false,
    canUsePortfolio: false,
    reason:
      "Your App identity is connected. Pro backend account linking is in progress. Full Pro access will require preview approval or paid entitlement.",
    source: identity.source,
    status: "connected",
  };
}

export async function resolveProAccess(identity: ProAccessIdentity): Promise<ProAccessState> {
  if (!identity.authenticated || !identity.email) {
    return NOT_CONNECTED_ACCESS;
  }

  try {
    const membership = await getMembershipByEmail(identity.email);
    return buildAccessFromMembership(membership, identity);
  } catch {
    return {
      billingRequired: true,
      canOpenPro: false,
      canUseFCN: false,
      canUsePortfolio: false,
      reason: "Unable to verify Pro access. Safe fallback keeps paid features closed.",
      source: "fallback",
      status: "connected",
    };
  }
}

export async function resolveSupabaseIdentityFromBearer(
  authorizationHeader: string | null,
): Promise<ProAccessIdentity | null> {
  const token = authorizationHeader?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  const config = getSupabaseServerConfig();

  if (!token || !config) {
    return null;
  }

  try {
    const response = await fetch(`${config.url.replace(/\/$/, "")}/auth/v1/user`, {
      cache: "no-store",
      headers: {
        authorization: `Bearer ${token}`,
        apikey: config.anonKey,
      },
    });

    if (!response.ok) {
      return null;
    }

    const user = (await response.json()) as SupabaseUserResponse;
    const email = typeof user.email === "string" ? user.email : null;

    if (!email) {
      return null;
    }

    return {
      authenticated: true,
      email,
      proCandidate: user.user_metadata?.pro_candidate === true,
      source: "supabase",
    };
  } catch {
    return null;
  }
}

export function identityFromLightweightSession(
  session: IdentitySession | null,
): ProAccessIdentity {
  if (!session) {
    return {
      authenticated: false,
      email: null,
      source: "fallback",
    };
  }

  return {
    authenticated: true,
    email: session.normalized_email,
    proCandidate: session.pro_candidate,
    source: "manual",
  };
}
