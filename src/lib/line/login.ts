import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { createIdentitySession } from "@/src/lib/auth/session";
import { getLineConfigState, getLineLoginSecrets } from "@/src/lib/line/config";
import { linkLineIdentity, resolveUnifiedIdentity } from "@/src/lib/line/identity-merge";
import { log } from "@/src/lib/log";
import { getMembershipByEmail, upsertMembership } from "@/src/lib/membership/memberships";

const LINE_STATE_COOKIE = "ixai_line_login_state";
const LINE_STATE_TTL_SECONDS = 10 * 60;
const LINE_AUTH_URL = "https://access.line.me/oauth2/v2.1/authorize";
const LINE_TOKEN_URL = "https://api.line.me/oauth2/v2.1/token";

type LineIdTokenClaims = {
  email?: string;
  name?: string;
  picture?: string;
  sub?: string;
};

export function getLineConfig() {
  return getLineConfigState();
}

export function isLineConfigured() {
  return getLineConfigState().loginReady;
}

export async function createLineLoginState() {
  const state = randomBytes(24).toString("base64url");
  const nonce = randomBytes(16).toString("base64url");
  const cookieStore = await cookies();

  cookieStore.set(
    LINE_STATE_COOKIE,
    JSON.stringify({
      nonce,
      state,
    }),
    {
      httpOnly: true,
      maxAge: LINE_STATE_TTL_SECONDS,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  );

  return { nonce, state };
}

export async function validateLineState(state: string | null | undefined) {
  if (!state) {
    return null;
  }

  const cookieStore = await cookies();
  const stored = cookieStore.get(LINE_STATE_COOKIE)?.value;

  if (!stored) {
    return null;
  }

  try {
    const parsed = JSON.parse(stored) as { nonce?: unknown; state?: unknown };
    const expected = typeof parsed.state === "string" ? parsed.state : "";
    const nonce = typeof parsed.nonce === "string" ? parsed.nonce : "";
    const left = Buffer.from(state);
    const right = Buffer.from(expected);
    const valid = left.length === right.length && timingSafeEqual(left, right);

    if (!valid || !nonce) {
      return null;
    }

    cookieStore.set(LINE_STATE_COOKIE, "", {
      httpOnly: true,
      maxAge: 0,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return { nonce, state: expected };
  } catch {
    return null;
  }
}

export function buildLineLoginUrl({ nonce, state }: { nonce: string; state: string }) {
  const { channelId, redirectUri } = getLineLoginSecrets();
  if (!channelId || !redirectUri) {
    return null;
  }

  const params = new URLSearchParams({
    bot_prompt: "normal",
    client_id: channelId,
    nonce,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid profile email",
    state,
  });

  return `${LINE_AUTH_URL}?${params.toString()}`;
}

function decodeJwtPayload(token: string): LineIdTokenClaims | null {
  const [, payload] = token.split(".");
  if (!payload) {
    return null;
  }

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(Buffer.from(padded, "base64").toString("utf8")) as LineIdTokenClaims;
  } catch {
    return null;
  }
}

function fallbackLineEmail(lineUserId: string) {
  const digest = createHash("sha256").update(lineUserId).digest("hex").slice(0, 24);
  return `line-${digest}@line.ixai.local`;
}

async function exchangeLineCode(code: string) {
  const { channelId, channelSecret, redirectUri } = getLineLoginSecrets();
  if (!channelId || !channelSecret || !redirectUri) {
    throw new Error("line_login_not_configured");
  }

  const body = new URLSearchParams({
    client_id: channelId,
    client_secret: channelSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  });

  const response = await fetch(LINE_TOKEN_URL, {
    body,
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`line_token_exchange_failed:${response.status}`);
  }

  return (await response.json()) as {
    access_token?: string;
    id_token?: string;
  };
}

async function fetchLineProfile(accessToken: string | undefined) {
  if (!accessToken) {
    return null;
  }

  try {
    const response = await fetch("https://api.line.me/v2/profile", {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as { displayName?: string; userId?: string };
  } catch {
    return null;
  }
}

export async function restoreUnifiedIdentity({
  code,
}: {
  code: string;
}) {
  const token = await exchangeLineCode(code);
  const claims = token.id_token ? decodeJwtPayload(token.id_token) : null;
  const profile = await fetchLineProfile(token.access_token);
  const lineUserId = claims?.sub ?? profile?.userId;

  if (!lineUserId) {
    throw new Error("line_identity_missing_user_id");
  }

  const email = claims?.email?.trim() || fallbackLineEmail(lineUserId);
  const displayName = claims?.name ?? profile?.displayName;
  const result = await linkLineIdentity({
    displayName,
    email,
    lineUserId,
    source: "line_login",
  });
  let membership = await getMembershipByEmail(email).catch(() => null);
  if (!membership) {
    membership = (
      await upsertMembership({
        email,
        metadata: {
          source: "line_login",
        },
        plan: "free",
        status: "active",
      })
    ).membership;
  }

  const session = await createIdentitySession({
    lineConnected: true,
    membershipPlan: membership.plan,
    membershipStatus: membership.status,
    normalizedEmail: email.toLowerCase(),
    proCandidate:
      membership.plan === "pro" ||
      membership.plan === "enterprise" ||
      membership.metadata?.intent === "pro_waitlist",
  });
  const unified = await resolveUnifiedIdentity(session);

  log.info("[ixai.line.login] identity restored", {
    hasEmail: Boolean(claims?.email),
    lineConnected: Boolean(result.identity),
  });

  return {
    displayName: displayName ?? null,
    lineUserId,
    session,
    unified,
  };
}
