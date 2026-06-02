import { resolveSupabaseIdentityFromBearer } from "@/src/lib/pro/access";
import { getConfiguredBackendUrl } from "@/src/lib/pro/account-link";
import { normalizeEntitlements } from "@/src/lib/pro/feature-gates";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type BackendEntitlementsResponse = {
  entitlements?: Record<string, boolean>;
  plan?: string;
};

export async function GET(request: Request) {
  const identity = await resolveSupabaseIdentityFromBearer(
    request.headers.get("authorization"),
  );

  if (!identity?.authenticated || identity.source !== "supabase" || !identity.externalUserId) {
    return Response.json(
      {
        entitlements: normalizeEntitlements(null),
        message: "Sign in with IXAI App before entitlements can be evaluated.",
        ok: false,
        plan: "free",
        status: "not_authenticated",
      },
      { status: 401 },
    );
  }

  const backendUrl = getConfiguredBackendUrl();

  if (!backendUrl) {
    return Response.json(
      {
        entitlements: normalizeEntitlements(null),
        message: "IXAI backend is not configured for entitlement lookup.",
        ok: false,
        plan: "free",
        status: "backend_not_configured",
      },
      { status: 503 },
    );
  }

  const url = new URL(`${backendUrl}/api/v1/entitlements/me`);
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
          entitlements: normalizeEntitlements(null),
          message: "Backend account is not linked yet.",
          ok: false,
          plan: "free",
          status: "not_linked",
        },
        { status: 404 },
      );
    }

    if (!response.ok) {
      return Response.json(
        {
          entitlements: normalizeEntitlements(null),
          message: `Backend entitlement lookup failed with status ${response.status}.`,
          ok: false,
          plan: "free",
          status: "error",
        },
        { status: 502 },
      );
    }

    const payload = (await response.json().catch(() => ({}))) as BackendEntitlementsResponse;

    return Response.json({
      entitlements: normalizeEntitlements(payload.entitlements),
      ok: true,
      plan: typeof payload.plan === "string" ? payload.plan : "free",
      status: "ok",
    });
  } catch {
    return Response.json(
      {
        entitlements: normalizeEntitlements(null),
        message: "Backend entitlement lookup could not reach IXAI backend.",
        ok: false,
        plan: "free",
        status: "error",
      },
      { status: 503 },
    );
  }
}
