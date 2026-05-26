import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { MembershipPlan, MembershipStatus } from "@/src/lib/membership/memberships";

export const IDENTITY_COOKIE_NAME = "ixai_identity";

const SESSION_LIFETIME_SECONDS = 60 * 60 * 24 * 30;

export type SessionMembership = {
  plan: MembershipPlan;
  status: MembershipStatus;
};

export type SessionIdentity = {
  normalized_email: string;
  line_connected: boolean;
  pro_candidate: boolean;
};

export type IdentitySession = SessionIdentity & {
  membership_plan: MembershipPlan;
  membership_status: MembershipStatus;
  created_at: string;
  expires_at: string;
};

type CreateIdentitySessionInput = {
  normalizedEmail: string;
  membershipPlan: MembershipPlan;
  membershipStatus: MembershipStatus;
  lineConnected?: boolean;
  proCandidate?: boolean;
};

function base64UrlEncode(value: string | Buffer) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");

  return Buffer.from(padded, "base64").toString("utf8");
}

function getIdentitySecret() {
  return (
    process.env.IXAI_IDENTITY_SECRET?.trim() ||
    process.env.IXAI_ADMIN_PASSWORD?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    "ixai-local-identity-session-secret"
  );
}

function signPayload(payload: string) {
  return base64UrlEncode(createHmac("sha256", getIdentitySecret()).update(payload).digest());
}

function safeCompare(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  return left.length === right.length && timingSafeEqual(left, right);
}

function isMembershipPlan(value: unknown): value is MembershipPlan {
  return value === "free" || value === "pro" || value === "enterprise";
}

function isMembershipStatus(value: unknown): value is MembershipStatus {
  return value === "active" || value === "expired" || value === "cancelled" || value === "trial";
}

function isSessionPayload(value: unknown): value is IdentitySession {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<IdentitySession>;

  return (
    typeof candidate.normalized_email === "string" &&
    candidate.normalized_email.includes("@") &&
    isMembershipPlan(candidate.membership_plan) &&
    isMembershipStatus(candidate.membership_status) &&
    typeof candidate.line_connected === "boolean" &&
    typeof candidate.pro_candidate === "boolean" &&
    typeof candidate.created_at === "string" &&
    typeof candidate.expires_at === "string"
  );
}

function encodeSession(session: IdentitySession) {
  const payload = base64UrlEncode(JSON.stringify(session));
  const signature = signPayload(payload);

  return `${payload}.${signature}`;
}

function decodeSession(token: string): IdentitySession | null {
  const [payload, signature] = token.split(".");

  if (!payload || !signature || !safeCompare(signature, signPayload(payload))) {
    return null;
  }

  try {
    const parsed = JSON.parse(base64UrlDecode(payload)) as unknown;

    if (!isSessionPayload(parsed) || !isIdentitySessionValid(parsed)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function isIdentitySessionValid(session: IdentitySession | null | undefined) {
  if (!session) {
    return false;
  }

  const expiresAt = new Date(session.expires_at).getTime();

  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

export async function createIdentitySession(input: CreateIdentitySessionInput) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_LIFETIME_SECONDS * 1000);
  const session: IdentitySession = {
    created_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    line_connected: input.lineConnected ?? false,
    membership_plan: input.membershipPlan,
    membership_status: input.membershipStatus,
    normalized_email: input.normalizedEmail,
    pro_candidate: input.proCandidate ?? false,
  };
  const cookieStore = await cookies();

  cookieStore.set(IDENTITY_COOKIE_NAME, encodeSession(session), {
    httpOnly: true,
    maxAge: SESSION_LIFETIME_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return session;
}

export async function readIdentitySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(IDENTITY_COOKIE_NAME)?.value;

  return token ? decodeSession(token) : null;
}

export async function clearIdentitySession() {
  const cookieStore = await cookies();

  cookieStore.set(IDENTITY_COOKIE_NAME, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
