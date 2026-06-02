import {
  resolveSupabaseIdentityFromBearer,
} from "@/src/lib/pro/access";
import { linkSupabaseAccountToBackend } from "@/src/lib/pro/account-link";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const identity = await resolveSupabaseIdentityFromBearer(
    request.headers.get("authorization"),
  );

  if (!identity?.authenticated) {
    return Response.json(
      {
        accountLink: {
          backendAccountId: null,
          requiresAction: true,
          status: "not_started",
        },
        message: "Sign in with IXAI App before linking a backend Pro account.",
        ok: false,
        status: "not_authenticated",
      },
      { status: 401 },
    );
  }

  const result = await linkSupabaseAccountToBackend(identity);

  return Response.json(
    {
      accountLink: {
        backendAccountId: result.state.backendAccountId,
        requiresAction: result.state.requiresAction,
        status: result.state.status,
      },
      message: result.state.message,
      ok: result.ok,
      status: result.state.status,
    },
    { status: result.ok ? 200 : result.httpStatus },
  );
}
