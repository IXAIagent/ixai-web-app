import type { NextRequest } from "next/server";
import { log } from "@/src/lib/log";

// v1.34 — Mock subscribe API.
//
// Foundation only — accepts an email + optional surface / attribution
// payload, validates the email shape, stores a row in an in-memory
// array, and returns `{ ok: true }`. No database, no email provider, no
// CRM SaaS, no production email send.
//
// The in-memory buffer survives only for the lifetime of a single
// Vercel function instance; the goal is to expose the call site
// contract that a real provider (Resend / Mailchimp / Postmark / etc.)
// will land against later.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_BUFFER = 200;

type SubscribeRecord = {
  email: string;
  surface?: string;
  attribution?: Record<string, string>;
  capturedAt: string;
};

const buffer: SubscribeRecord[] = [];

export async function POST(request: NextRequest) {
  let payload: { email?: unknown; surface?: unknown; attribution?: unknown } = {};

  try {
    payload = await request.json();
  } catch {
    return Response.json(
      { ok: false, message: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  if (!email) {
    return Response.json(
      { ok: false, message: "Email is required." },
      { status: 400 },
    );
  }

  if (!EMAIL_PATTERN.test(email)) {
    return Response.json(
      { ok: false, message: "Email format is not valid." },
      { status: 400 },
    );
  }

  const surface =
    typeof payload.surface === "string" ? payload.surface.slice(0, 32) : undefined;
  const attribution =
    payload.attribution && typeof payload.attribution === "object"
      ? (Object.fromEntries(
          Object.entries(payload.attribution as Record<string, unknown>)
            .filter(([, value]) => typeof value === "string")
            .map(([key, value]) => [key.slice(0, 32), String(value).slice(0, 200)]),
        ) as Record<string, string>)
      : undefined;

  // Dedupe: if the same email is already buffered, return ok without
  // appending so the mock never blows up its in-memory ring buffer.
  const existing = buffer.find((record) => record.email === email);
  if (!existing) {
    if (buffer.length >= MAX_BUFFER) {
      buffer.shift();
    }
    buffer.push({
      email,
      surface,
      attribution,
      capturedAt: new Date().toISOString(),
    });
  }

  log.info("[ixai.subscribe.mock]", {
    email,
    surface,
    attribution,
    bufferSize: buffer.length,
  });

  return Response.json({ ok: true });
}

export async function GET() {
  // Internal mock — exposes only counts, not raw rows, so a future
  // admin snapshot can render numbers without leaking email addresses.
  return Response.json({
    ok: true,
    bufferSize: buffer.length,
    note: "In-memory mock buffer; resets on every server restart.",
  });
}
