import type { MembershipRecord } from "@/src/lib/membership/memberships";

type EntitlementContext = {
  membership?: MembershipRecord | null;
};

function hasActiveAccess(membership?: MembershipRecord | null) {
  if (!membership || membership.status === "cancelled" || membership.status === "expired") {
    return false;
  }

  if (!membership.expires_at) {
    return true;
  }

  const expiresAt = new Date(membership.expires_at).getTime();
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

function isPaidPlan(membership?: MembershipRecord | null) {
  return membership?.plan === "pro" || membership?.plan === "enterprise";
}

export function canAccessPro({ membership }: EntitlementContext) {
  return hasActiveAccess(membership) && isPaidPlan(membership);
}

export function canAccessFCN({ membership }: EntitlementContext) {
  return canAccessPro({ membership });
}

export function canAccessDailyPremium({ membership }: EntitlementContext) {
  return canAccessPro({ membership });
}

export function canAccessWeeklyPremium({ membership }: EntitlementContext) {
  return canAccessPro({ membership });
}
