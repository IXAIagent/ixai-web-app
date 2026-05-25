import type { NextRequest } from "next/server";
import { log } from "@/src/lib/log";
import { upsertLineIdentity } from "@/src/lib/subscribers/line-identity";
import {
  setProfileTag,
  upsertSubscriberProfile,
  validateEmail,
} from "@/src/lib/subscribers/profiles";

export const dynamic = "force-dynamic";

// v1.36.4 — LINE Identity Bridge link API.
//
// Foundation only — does NOT perform LINE OAuth. The endpoint accepts a
// LINE user id + optional email + display name from a future LIFF
// callback / Messaging API webhook, upserts the bridge row, and tags
// the subscriber profile with `line_connected` when an email is
// supplied.
//
// Security: requires an `x-ixai-line-secret` header that matches the
// IXAI_LINE_LINK_SECRET env. Until the secret is provisioned the
// endpoint refuses requests so the LINE → subscriber linkage cannot be
// forged from the public internet.

type LinkPayload = {
  lineUserId?: unknown;
  email?: unknown;
  displayName?: unknown;
  source?: unknown;
  metadata?: unknown;
};

function isAuthorized(request: NextRequest): boolean {
  const expected = process.env.IXAI_LINE_LINK_SECRET?.trim();
  if (!expected) {
    return false;
  }
  const provided = request.headers.get("x-ixai-line-secret")?.trim();
  return Boolean(provided) && provided === expected;
}

function sanitize(value: unknown, maxLength = 220): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim().slice(0, maxLength);
  return trimmed || undefined;
}

function sanitizeMetadata(value: unknown): Record<string, string> | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, item]) => typeof item === "string")
    .map(([key, item]) => [key.slice(0, 48), String(item).slice(0, 240)]);
  return entries.length ? Object.fromEntries(entries) : undefined;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return Response.json(
      {
        ok: false,
        message: "Missing or invalid IXAI LINE link secret.",
      },
      { status: 401 },
    );
  }

  let payload: LinkPayload = {};
  try {
    payload = await request.json();
  } catch {
    return Response.json(
      { ok: false, message: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const lineUserId = sanitize(payload.lineUserId, 200);
  if (!lineUserId) {
    return Response.json(
      { ok: false, message: "lineUserId is required." },
      { status: 400 },
    );
  }

  const emailInput = sanitize(payload.email, 240);
  const displayName = sanitize(payload.displayName, 160);
  const source = sanitize(payload.source, 80) ?? "line_oa";
  const metadata = sanitizeMetadata(payload.metadata);
  const validEmail = emailInput && validateEmail(emailInput) ? emailInput : undefined;

  try {
    const identity = await upsertLineIdentity({
      lineUserId,
      email: validEmail,
      displayName,
      source,
      metadata,
    });

    if (!identity) {
      throw new Error("line_identity_upsert_failed");
    }

    // When the LINE bridge knows an email, ensure the subscriber
    // profile exists and carries the `line_connected` tag. Both calls
    // are fire-and-forget: a failure to mutate the profile must not
    // block the LINE linkage write.
    if (validEmail) {
      try {
        await upsertSubscriberProfile({ email: validEmail });
        await setProfileTag({ email: validEmail, tag: "line_connected", enabled: true });
      } catch (error) {
        log.warn("[ixai.line.link] profile tag sync failed", error);
      }
    }

    return Response.json({
      ok: true,
      lineUserId,
      linkedEmail: validEmail ?? null,
    });
  } catch (error) {
    log.warn("[ixai.line.link] linkage failed", error);
    return Response.json(
      {
        ok: false,
        message: "Unable to link LINE identity.",
      },
      { status: 502 },
    );
  }
}
