import { readIdentitySession } from "@/src/lib/auth/session";
import {
  identityFromLightweightSession,
  resolveProAccess,
  resolveSupabaseIdentityFromBearer,
} from "@/src/lib/pro/access";
import { getDefaultAccountLinkState } from "@/src/lib/pro/account-link";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const supabaseIdentity = await resolveSupabaseIdentityFromBearer(
    request.headers.get("authorization"),
  );
  const identity =
    supabaseIdentity ?? identityFromLightweightSession(await readIdentitySession());
  const proAccess = await resolveProAccess(identity);
  const accountLink = getDefaultAccountLinkState(identity);

  return Response.json({
    accountLink: {
      backendAccountId: accountLink.backendAccountId,
      requiresAction: accountLink.requiresAction,
      status: accountLink.status,
    },
    authenticated: identity.authenticated,
    ok: true,
    proAccess: {
      billingRequired: proAccess.billingRequired,
      canOpenPro: proAccess.canOpenPro,
      canUseFCN: proAccess.canUseFCN,
      canUsePortfolio: proAccess.canUsePortfolio,
      reason: proAccess.reason,
      source: proAccess.source,
      status: proAccess.status,
    },
  });
}
