import { readIdentitySession } from "@/src/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await readIdentitySession();

  if (!session) {
    return Response.json({
      authenticated: false,
      identity: null,
      line_connected: false,
      membership: null,
      pro_candidate: false,
    });
  }

  return Response.json({
    authenticated: true,
    identity: {
      normalized_email: session.normalized_email,
    },
    line_connected: session.line_connected,
    membership: {
      plan: session.membership_plan,
      status: session.membership_status,
    },
    pro_candidate: session.pro_candidate,
  });
}
