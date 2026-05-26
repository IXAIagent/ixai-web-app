import { clearIdentitySession } from "@/src/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST() {
  await clearIdentitySession();

  return Response.json({
    ok: true,
  });
}
