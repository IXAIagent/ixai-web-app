import type { NextRequest } from "next/server";
import { isAdminRequestAuthorized } from "@/src/lib/admin/auth";
import { log } from "@/src/lib/log";
import { getMembershipSnapshot } from "@/src/lib/membership/memberships";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isAdminRequestAuthorized(request)) {
    return Response.json(
      {
        status: "unauthorized",
        message: "Missing or invalid admin session.",
      },
      { status: 401 },
    );
  }

  try {
    const snapshot = await getMembershipSnapshot();

    return Response.json({
      ok: true,
      snapshot,
    });
  } catch (error) {
    log.warn("[ixai.membership.admin] snapshot failed", error);

    return Response.json(
      {
        ok: false,
        message: "Unable to load membership snapshot.",
      },
      { status: 502 },
    );
  }
}
