import {
  getEntitlements,
  getMembershipTier,
} from "@/src/lib/membership/entitlements";
import { getMembershipByEmail } from "@/src/lib/membership/memberships";
import { resolveSupabaseIdentityFromBearer } from "@/src/lib/pro/access";
import { normalizeEntitlements } from "@/src/lib/pro/feature-gates";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function toLegacyFeatureEntitlements(entitlements: ReturnType<typeof getEntitlements>) {
  return normalizeEntitlements({
    ai_copilot: entitlements.canViewPro,
    daily_brief: true,
    fcn_monitoring: entitlements.canViewFcn,
    portfolio: entitlements.canViewPortfolio,
    pro_preview: entitlements.canViewPro,
    risk_engine: entitlements.canViewRisk,
    watchlist: true,
    weekly_brief: true,
  });
}

export async function GET(request: Request) {
  const identity = await resolveSupabaseIdentityFromBearer(
    request.headers.get("authorization"),
  );

  if (!identity?.authenticated || identity.source !== "supabase" || !identity.email) {
    const freeEntitlements = getEntitlements("free");

    return Response.json(
      {
        appEntitlements: freeEntitlements,
        entitlements: toLegacyFeatureEntitlements(freeEntitlements),
        message: "Sign in with IXAI App before entitlements can be evaluated.",
        ok: false,
        plan: "free",
        status: "not_authenticated",
      },
      { status: 401 },
    );
  }

  try {
    const membership = await getMembershipByEmail(identity.email);
    const tier = getMembershipTier(membership);
    const appEntitlements = getEntitlements(tier);

    return Response.json({
      appEntitlements,
      entitlements: toLegacyFeatureEntitlements(appEntitlements),
      ok: true,
      plan: tier,
      status: "ok",
    });
  } catch {
    const freeEntitlements = getEntitlements("free");

    return Response.json({
      appEntitlements: freeEntitlements,
      entitlements: toLegacyFeatureEntitlements(freeEntitlements),
      message: "Membership entitlement lookup failed. Safe fallback keeps Pro closed.",
      ok: false,
      plan: "free",
      status: "error",
    });
  }
}
