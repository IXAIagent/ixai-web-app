import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  buildLineLoginUrl,
  createLineLoginState,
  isLineConfigured,
} from "@/src/lib/line/login";
import { getLineLoginSecrets } from "@/src/lib/line/config";

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

  const { channelId, redirectUri } = getLineLoginSecrets();
  console.log({
    app_url: process.env.NEXT_PUBLIC_APP_URL,
    line_channel_id: channelId,
    line_redirect_uri: redirectUri,
  });

  return NextResponse.redirect(loginUrl);
}
