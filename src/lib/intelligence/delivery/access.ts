import type { MembershipPlan } from "@/src/lib/membership/memberships";
import type {
  DeliveryAccessResult,
  IntelligenceDeliveryCategory,
  IntelligenceDeliveryTier,
} from "@/src/lib/intelligence/delivery/types";

export function getDeliveryTierForMembership(plan: MembershipPlan | "anonymous"): IntelligenceDeliveryTier {
  if (plan === "pro" || plan === "enterprise") {
    return "pro";
  }

  return plan === "anonymous" ? "public" : "preview";
}

export function canAccessDeliveryTier(
  requestedTier: IntelligenceDeliveryTier,
  membership: MembershipPlan | "anonymous",
): DeliveryAccessResult {
  const currentTier = getDeliveryTierForMembership(membership);

  if (requestedTier === "public") {
    return {
      allowed: true,
      reason: "Public intelligence delivery is available to all IXAI users.",
      tier: currentTier,
    };
  }

  if (requestedTier === "preview") {
    return {
      allowed: true,
      reason: "Preview intelligence delivery is sample-only and available before paid Pro access.",
      tier: currentTier,
    };
  }

  const allowed = currentTier === "pro";

  return {
    allowed,
    reason: allowed
      ? "Pro intelligence delivery is available for this membership tier."
      : "Personalized delivery belongs to future IXAI Pro Intelligence.",
    requiredTier: allowed ? undefined : "pro",
    tier: currentTier,
  };
}

export function getDeliveryUpgradePrompt(category: IntelligenceDeliveryCategory) {
  const prompts: Record<IntelligenceDeliveryCategory, string> = {
    fcn_intelligence_preview:
      "FCN KI proximity, coupon window and worst-of monitoring will live in IXAI Pro.",
    macro_intelligence:
      "Macro delivery is public today; personalized macro memory will live in IXAI Pro.",
    market_volatility_alert:
      "Event-driven volatility alerts can become personalized in IXAI Pro.",
    morning_intelligence:
      "Morning Intelligence starts public and becomes personalized through IXAI Pro.",
    watchlist_alert:
      "Watchlist alerts are preview-only until IXAI Pro personalized delivery is enabled.",
  };

  return prompts[category];
}
