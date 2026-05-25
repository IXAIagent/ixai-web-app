import type { NextRequest } from "next/server";
import {
  normalizeEmail,
  saveSubscriber,
  validateEmail,
} from "@/src/lib/distribution/subscribers";
import { log } from "@/src/lib/log";

export const dynamic = "force-dynamic";

type SubscribeBody = {
  email?: unknown;
  surface?: unknown;
  path?: unknown;
  attribution?: unknown;
};

function sanitizeAttribution(value: unknown): Record<string, string> | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, item]) => typeof item === "string")
    .map(([key, item]) => [key.slice(0, 48), String(item).slice(0, 240)]);

  return entries.length ? Object.fromEntries(entries) : undefined;
}

export async function POST(request: NextRequest) {
  let payload: SubscribeBody = {};

  try {
    payload = await request.json();
  } catch {
    return Response.json(
      { ok: false, message: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const email = typeof payload.email === "string" ? payload.email.trim() : "";

  if (!email) {
    return Response.json(
      { ok: false, message: "Email is required." },
      { status: 400 },
    );
  }

  if (!validateEmail(email)) {
    return Response.json(
      { ok: false, message: "Email format is not valid." },
      { status: 400 },
    );
  }

  try {
    const subscriber = await saveSubscriber({
      email,
      surface: typeof payload.surface === "string" ? payload.surface : undefined,
      path: typeof payload.path === "string" ? payload.path : undefined,
      attribution: sanitizeAttribution(payload.attribution),
      referrer: request.headers.get("referer") ?? undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });

    log.info("[ixai.subscribe]", {
      email: normalizeEmail(email),
      persistence: subscriber.persistence,
      surface: typeof payload.surface === "string" ? payload.surface : undefined,
    });

    return Response.json({
      ok: true,
      subscriber: {
        email: subscriber.email,
        status: subscriber.status,
      },
      persistence: subscriber.persistence,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "invalid_email") {
      return Response.json(
        { ok: false, message: "Email format is not valid." },
        { status: 400 },
      );
    }

    log.warn("[ixai.subscribe] durable write failed", error);

    return Response.json(
      {
        ok: false,
        message: "Unable to subscribe right now.",
      },
      { status: 502 },
    );
  }
}
