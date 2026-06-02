import { cookies } from "next/headers";
import { readIdentitySession } from "@/src/lib/auth/session";
import { resolveSupabaseIdentityFromBearer } from "@/src/lib/pro/access";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function summarizeCookieName(name: string) {
  if (name.startsWith("sb-")) {
    return "sb-...";
  }

  if (name.startsWith("ixai_")) {
    return name;
  }

  return "other";
}

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const cookieNames = cookieStore.getAll().map((cookie) => cookie.name);
  const cookieNamesPresent = Array.from(new Set(cookieNames.map(summarizeCookieName)));
  const supabaseIdentity = await resolveSupabaseIdentityFromBearer(
    request.headers.get("authorization"),
  );
  const lightweightSession = await readIdentitySession();
  const source = supabaseIdentity?.authenticated
    ? "bearer"
    : lightweightSession
      ? "server-cookie"
      : "none";

  return Response.json({
    checkedAt: new Date().toISOString(),
    cookieCount: cookieNames.length,
    cookieNamesPresent,
    emailPresent: Boolean(supabaseIdentity?.email || lightweightSession?.normalized_email),
    hasSupabaseCookieHint: cookieNames.some((name) => name.startsWith("sb-")),
    hasSupabaseSession: Boolean(supabaseIdentity?.authenticated),
    hasUser: Boolean(supabaseIdentity?.authenticated || lightweightSession),
    ok: true,
    source,
    userIdPresent: Boolean(supabaseIdentity?.externalUserId),
  });
}
