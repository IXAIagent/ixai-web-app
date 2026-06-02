import { resolveSupabaseIdentityFromBearer } from "@/src/lib/pro/access";
import { getConfiguredBackendUrl } from "@/src/lib/pro/account-link";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type BackendMembershipResponse = {
  account_id?: string;
  plan_code?: string;
  status?: string;
  entitlements?: Record<string, boolean>;
};

const EMPTY_ENTITLEMENTS = {
  ai_copilot: false,
  daily_brief: false,
  fcn_monitoring: false,
  portfolio: false,
  pro_preview: false,
  risk_engine: false,
  watchlist: false,
  weekly_brief: false,
};

function sanitizeEntitlements(value: unknown) {
  const source = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return Object.fromEntries(
    Object.entries(EMPTY_ENTITLEMENTS).map(([key, fallback]) => [
      key,
      typeof source[key] === "boolean" ? source[key] : fallback,
    ]),
  );
}

export async function GET(request: Request) {
  const identity = await resolveSupabaseIdentityFromBearer(
    request.headers.get("authorization"),
  );

  if (!identity?.authenticated || identity.source !== "supabase" || !identity.externalUserId) {
    return Response.json(
      {
        membership: null,
        message: "Sign in with IXAI App before membership can be evaluated.",
        ok: false,
        status: "not_authenticated",
      },
      { status: 401 },
    );
  }

  const backendUrl = getConfiguredBackendUrl();

  if (!backendUrl) {
    return Response.json(
      {
        membership: null,
        message: "IXAI backend is not configured for membership lookup.",
        ok: false,
        status: "backend_not_configured",
      },
      { status: 503 },
    );
  }

  const url = new URL(`${backendUrl}/api/v1/membership/me`);
  url.searchParams.set("provider", "supabase");
  url.searchParams.set("external_user_id", identity.externalUserId);

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        "content-type": "application/json",
      },
    });

    if (response.status === 404) {
      return Response.json(
        {
          membership: null,
          message: "Backend account is not linked yet.",
          ok: false,
          status: "not_linked",
        },
        { status: 404 },
      );
    }

    if (!response.ok) {
      return Response.json(
        {
          membership: null,
          message: `Backend membership lookup failed with status ${response.status}.`,
          ok: false,
          status: "error",
        },
        { status: 502 },
      );
    }

    const payload = (await response.json().catch(() => ({}))) as BackendMembershipResponse;

    return Response.json({
      membership: {
        accountId: typeof payload.account_id === "string" ? payload.account_id : null,
        entitlements: sanitizeEntitlements(payload.entitlements),
        planCode: typeof payload.plan_code === "string" ? payload.plan_code : "free",
        status: typeof payload.status === "string" ? payload.status : "active",
      },
      ok: true,
      status: "ok",
    });
  } catch {
    return Response.json(
      {
        membership: null,
        message: "Backend membership lookup could not reach IXAI backend.",
        ok: false,
        status: "error",
      },
      { status: 503 },
    );
  }
}
