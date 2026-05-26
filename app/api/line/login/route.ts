import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  buildLineLoginUrl,
  createLineLoginState,
  isLineConfigured,
} from "@/src/lib/line/login";

export const dynamic = "force-dynamic";

function fallbackRedirect(request: NextRequest) {
  return NextResponse.redirect(new URL("/pro-preview?line_login=not_configured", request.url));
}

export async function GET(request: NextRequest) {
  if (!isLineConfigured()) {
    return fallbackRedirect(request);
  }

  const state = await createLineLoginState();
  const loginUrl = buildLineLoginUrl(state);

  if (!loginUrl) {
    return fallbackRedirect(request);
  }

  return NextResponse.redirect(loginUrl);
}
