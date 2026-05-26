import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { restoreUnifiedIdentity, validateLineState } from "@/src/lib/line/login";
import { log } from "@/src/lib/log";

export const dynamic = "force-dynamic";

function redirectToPreview(request: NextRequest, status: string) {
  return NextResponse.redirect(new URL(`/pro-preview?line_login=${status}`, request.url));
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");

  if (error) {
    return redirectToPreview(request, "error");
  }

  const validatedState = await validateLineState(state);
  if (!code || !validatedState) {
    return redirectToPreview(request, "invalid_state");
  }

  try {
    await restoreUnifiedIdentity({ code });
    return redirectToPreview(request, "success");
  } catch (callbackError) {
    log.warn("[ixai.line.callback] restore failed", callbackError);
    return redirectToPreview(request, "error");
  }
}
