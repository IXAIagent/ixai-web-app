import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionToken,
  getAdminAccessState,
  verifyAdminPassword,
  verifyAdminSessionToken,
} from "@/src/lib/admin/auth";

export const dynamic = "force-dynamic";

function sessionResponse(authenticated: boolean, status = 200) {
  const accessState = getAdminAccessState();

  return NextResponse.json(
    {
      authenticated,
      mode: accessState.mode,
      passwordConfigured:
        accessState.mode !== "locked" && accessState.isPasswordConfigured,
    },
    { status },
  );
}

export function GET(request: NextRequest) {
  const accessState = getAdminAccessState();

  if (accessState.mode === "locked") {
    return sessionResponse(false, 403);
  }

  if (accessState.mode === "development") {
    return sessionResponse(true);
  }

  return sessionResponse(
    verifyAdminSessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value),
  );
}

export async function POST(request: NextRequest) {
  const accessState = getAdminAccessState();

  if (accessState.mode === "locked") {
    return sessionResponse(false, 403);
  }

  if (accessState.mode === "development") {
    return sessionResponse(true);
  }

  const payload = (await request.json().catch(() => ({}))) as { password?: string };

  if (!verifyAdminPassword(payload.password ?? "")) {
    return sessionResponse(false, 401);
  }

  const response = sessionResponse(true);
  response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(), {
    httpOnly: true,
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

