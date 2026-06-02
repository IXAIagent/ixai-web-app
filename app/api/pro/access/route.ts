import { readIdentitySession } from "@/src/lib/auth/session";
import {
  identityFromLightweightSession,
  resolveProAccess,
  resolveSupabaseIdentityFromBearer,
} from "@/src/lib/pro/access";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const supabaseIdentity = await resolveSupabaseIdentityFromBearer(
    request.headers.get("authorization"),
  );
  const identity =
    supabaseIdentity ?? identityFromLightweightSession(await readIdentitySession());
  const proAccess = await resolveProAccess(identity);

  return Response.json({
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
