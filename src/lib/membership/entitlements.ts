import type { MembershipRecord } from "@/src/lib/membership/memberships";

export type ProFeature =
  | "portfolio_intelligence"
  | "fcn_risk_intelligence"
  | "premium_weekly"
  | "premium_daily"
  | "ai_alerts";

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

export function getPlanLabel(plan?: MembershipRecord["plan"] | null) {
  if (plan === "pro") return "IXAI Pro";
  if (plan === "enterprise") return "IXAI Enterprise";
  return "IXAI Public";
}

export function getEntitlementSummary({ membership }: EntitlementContext) {
  const plan = membership?.plan ?? "free";

  return {
    plan,
    label: getPlanLabel(plan),
    canAccessPro: canAccessPro({ membership }),
    canAccessFCN: canAccessFCN({ membership }),
    canAccessDailyPremium: canAccessDailyPremium({ membership }),
    canAccessWeeklyPremium: canAccessWeeklyPremium({ membership }),
  };
}

export function getUpgradeReason(
  feature: ProFeature,
  context: EntitlementContext = {},
) {
  const allowed = (() => {
    if (feature === "portfolio_intelligence") return canAccessPro(context);
    if (feature === "fcn_risk_intelligence") return canAccessFCN(context);
    if (feature === "premium_weekly") return canAccessWeeklyPremium(context);
    if (feature === "premium_daily") return canAccessDailyPremium(context);
    if (feature === "ai_alerts") return canAccessPro(context);
    return false;
  })();

  const reasons: Record<ProFeature, string> = {
    ai_alerts: "AI market memory and risk alerts are available in IXAI Pro.",
    fcn_risk_intelligence: "Personalized FCN risk intelligence is available in IXAI Pro.",
    portfolio_intelligence: "Personalized portfolio intelligence is available in IXAI Pro.",
    premium_daily: "Premium daily intelligence workflows are available in IXAI Pro.",
    premium_weekly: "Premium weekly intelligence workflows are available in IXAI Pro.",
  };

  return {
    allowed,
    requiredPlan: "pro" as const,
    reason: allowed ? "This Pro capability is available." : reasons[feature],
  };
}
