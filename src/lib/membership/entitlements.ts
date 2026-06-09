import type { MembershipPlan, MembershipRecord } from "@/src/lib/membership/memberships";

export type MembershipTier = "basic" | "free" | "pro";

export type IXAIAppEntitlements = {
  canViewFcn: boolean;
  canViewPortfolio: boolean;
  canViewPro: boolean;
  canViewRisk: boolean;
};

export type ProFeature =
  | "portfolio_intelligence"
  | "fcn_risk_intelligence"
  | "premium_weekly"
  | "premium_daily"
  | "ai_alerts";

type LegacyProSource = {
  legacy_pro?: unknown;
  legacyPro?: unknown;
  metadata?: Record<string, unknown> | null;
};

type EntitlementContext = {
  membership?: MembershipRecord | null;
  plan?: MembershipPlan | MembershipTier | "anonymous";
  profile?: LegacyProSource | null;
};

const ENTITLEMENT_MATRIX: Record<MembershipTier, IXAIAppEntitlements> = {
  basic: {
    canViewFcn: true,
    canViewPortfolio: true,
    canViewPro: false,
    canViewRisk: true,
  },
  free: {
    canViewFcn: true,
    canViewPortfolio: true,
    canViewPro: false,
    canViewRisk: true,
  },
  pro: {
    canViewFcn: true,
    canViewPortfolio: true,
    canViewPro: true,
    canViewRisk: true,
  },
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

function hasTruthyFlag(value: unknown) {
  return value === true || value === "true" || value === "1" || value === 1;
}

export function resolveLegacyProAccess(source?: LegacyProSource | MembershipRecord | null) {
  if (!source) {
    return false;
  }

  const row = source as LegacyProSource;

  return (
    hasTruthyFlag(row.legacy_pro) ||
    hasTruthyFlag(row.legacyPro) ||
    hasTruthyFlag(row.metadata?.legacy_pro) ||
    hasTruthyFlag(row.metadata?.legacyPro) ||
    hasTruthyFlag(row.metadata?.manual_access) ||
    hasTruthyFlag(row.metadata?.preview_access)
  );
}

export function getMembershipTier(
  membership?: MembershipRecord | null,
  profile?: LegacyProSource | null,
): MembershipTier {
  if (resolveLegacyProAccess(membership) || resolveLegacyProAccess(profile)) {
    return "pro";
  }

  if (!membership || !hasActiveAccess(membership)) {
    return "free";
  }

  if (membership.plan === "pro" || membership.plan === "enterprise") {
    return "pro";
  }

  if (membership.plan === "basic") {
    return "basic";
  }

  return "free";
}

export function getEntitlements(input?: EntitlementContext | MembershipTier): IXAIAppEntitlements {
  const tier =
    typeof input === "string"
      ? input === "pro" || input === "basic"
        ? input
        : "free"
      : getMembershipTier(input?.membership, input?.profile);

  return ENTITLEMENT_MATRIX[tier];
}

export function canAccessPro(context: EntitlementContext) {
  return getEntitlements(context).canViewPro;
}

export function canAccessPortfolio(context: EntitlementContext) {
  return getEntitlements(context).canViewPortfolio;
}

export function canAccessFCN(context: EntitlementContext) {
  return getEntitlements(context).canViewFcn;
}

export function canAccessRisk(context: EntitlementContext) {
  return getEntitlements(context).canViewRisk;
}

export function canAccessDailyPremium({ membership }: EntitlementContext) {
  return getMembershipTier(membership) === "pro";
}

export function canAccessWeeklyPremium({ membership }: EntitlementContext) {
  return getMembershipTier(membership) === "pro";
}

function readPlan(context: EntitlementContext) {
  return context.membership?.plan ?? context.plan ?? "anonymous";
}

export function getPlanLabel(plan?: MembershipPlan | MembershipTier | "anonymous" | null) {
  if (plan === "anonymous") return "Anonymous";
  if (plan === "basic") return "IXAI Basic";
  if (plan === "pro") return "IXAI Pro";
  if (plan === "enterprise") return "IXAI Pro";
  return "IXAI Free";
}

export function getEntitlementSummary(context: EntitlementContext) {
  const tier = getMembershipTier(context.membership, context.profile);
  const entitlements = getEntitlements(tier);
  const plan = readPlan(context);

  return {
    plan,
    tier,
    label: getPlanLabel(tier),
    canAccessPro: entitlements.canViewPro,
    canAccessFCN: entitlements.canViewFcn,
    canAccessDailyPremium: canAccessDailyPremium(context),
    canAccessWeeklyPremium: canAccessWeeklyPremium(context),
    entitlements,
  };
}

export function getUpgradeReason(
  feature: ProFeature,
  context: EntitlementContext = {},
) {
  const entitlements = getEntitlements(context);
  const allowed = (() => {
    if (feature === "portfolio_intelligence") return entitlements.canViewPortfolio;
    if (feature === "fcn_risk_intelligence") return entitlements.canViewFcn;
    if (feature === "premium_weekly") return canAccessWeeklyPremium(context);
    if (feature === "premium_daily") return canAccessDailyPremium(context);
    if (feature === "ai_alerts") return entitlements.canViewPro;
    return false;
  })();

  const reasons: Record<ProFeature, string> = {
    ai_alerts: "AI market memory and risk alerts require IXAI Pro.",
    fcn_risk_intelligence: "FCN risk intelligence is available in the current IXAI App plan.",
    portfolio_intelligence: "Portfolio intelligence is available in the current IXAI App plan.",
    premium_daily: "Premium daily intelligence workflows require IXAI Pro.",
    premium_weekly: "Premium weekly intelligence workflows require IXAI Pro.",
  };

  return {
    allowed,
    requiredPlan: "pro" as const,
    reason: allowed ? "This capability is available." : reasons[feature],
  };
}
