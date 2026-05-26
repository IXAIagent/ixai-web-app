import { readIdentitySession } from "@/src/lib/auth/session";
import { getLineConfigState } from "@/src/lib/line/config";
import { resolveUnifiedIdentity } from "@/src/lib/line/identity-merge";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await readIdentitySession();

  if (!session) {
    const lineConfig = getLineConfigState();
    return Response.json({
      authenticated: false,
      identity: null,
      intelligence_sync_ready: false,
      line_display_name: null,
      line_connected: false,
      line_login_ready: lineConfig.loginReady,
      line_user_id: null,
      liff_ready: lineConfig.liffReady,
      membership: null,
      pro_candidate: false,
      unified_identity: null,
    });
  }

  const unified = await resolveUnifiedIdentity(session);
  const lineConnected = Boolean(unified.line_identity || session.line_connected);
  const lineConfig = getLineConfigState();

  return Response.json({
    authenticated: true,
    identity: {
      normalized_email: session.normalized_email,
    },
    intelligence_sync_ready: lineConnected,
    line_display_name: unified.line_identity?.display_name ?? null,
    line_connected: lineConnected,
    line_login_ready: lineConfig.loginReady,
    line_user_id: unified.line_identity?.line_user_id ?? null,
    liff_ready: lineConfig.liffReady,
    membership: {
      plan: unified.membership?.plan ?? session.membership_plan,
      status: unified.membership?.status ?? session.membership_status,
    },
    pro_candidate: session.pro_candidate,
    unified_identity: {
      tags: unified.unified_tags,
    },
  });
}
