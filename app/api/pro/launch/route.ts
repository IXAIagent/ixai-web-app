import { createHash, randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { resolveSupabaseIdentityFromBearer } from "@/src/lib/pro/access";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const LAUNCH_CODE_TTL_MS = 2 * 60 * 1000;
const LEGACY_PRO_FALLBACK_URL = "https://ixai-website-clean.vercel.app";

type LaunchRecord = {
  emailMasked: string | null;
  expiresAt: number;
  issuedAt: number;
  source: "supabase";
  userIdTail: string | null;
};

const globalForLaunch = globalThis as typeof globalThis & {
  __ixaiProLaunchStoreV167?: Map<string, LaunchRecord>;
};

const launchStore =
  globalForLaunch.__ixaiProLaunchStoreV167 ?? new Map<string, LaunchRecord>();

globalForLaunch.__ixaiProLaunchStoreV167 = launchStore;

function hashLaunchCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

function createLaunchCode() {
  return `${Date.now().toString(36)}.${randomBytes(24).toString("base64url")}`;
}

function maskEmail(email: string | null | undefined) {
  if (!email || !email.includes("@")) {
    return null;
  }

  const [local, domain] = email.split("@");
  const prefix = local.slice(0, 1) || "*";

  return `${prefix}***@${domain}`;
}

function userIdTail(userId: string | null | undefined) {
  if (!userId) {
    return null;
  }

  return userId.slice(-6);
}

function cleanupExpiredCodes() {
  const now = Date.now();

  for (const [key, record] of launchStore.entries()) {
    if (record.expiresAt <= now) {
      launchStore.delete(key);
    }
  }
}

function getLegacyProBaseUrl() {
  const configured =
    process.env.IXAI_PRO_SSO_URL ||
    process.env.NEXT_PUBLIC_IXAI_PRO_URL ||
    LEGACY_PRO_FALLBACK_URL;

  return configured.trim().replace(/\/$/, "") || LEGACY_PRO_FALLBACK_URL;
}

function getLegacyProOrigin() {
  try {
    return new URL(getLegacyProBaseUrl()).origin;
  } catch {
    return LEGACY_PRO_FALLBACK_URL;
  }
}

function withCors(payload: unknown, init?: ResponseInit) {
  const response = NextResponse.json(payload, init);

  response.headers.set("Access-Control-Allow-Origin", getLegacyProOrigin());
  response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Vary", "Origin");

  return response;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Origin": getLegacyProOrigin(),
      "Cache-Control": "no-store",
      Vary: "Origin",
    },
    status: 204,
  });
}

export async function POST(request: NextRequest) {
  cleanupExpiredCodes();

  const identity = await resolveSupabaseIdentityFromBearer(
    request.headers.get("authorization"),
  );

  if (!identity?.authenticated || !identity.email) {
    return NextResponse.json(
      {
        ok: false,
        status: "not_authenticated",
        message: "請先登入 App，再開啟 IXAI Pro。",
      },
      { status: 401 },
    );
  }

  const code = createLaunchCode();
  const issuedAt = Date.now();
  const expiresAt = issuedAt + LAUNCH_CODE_TTL_MS;

  launchStore.set(hashLaunchCode(code), {
    emailMasked: maskEmail(identity.email),
    expiresAt,
    issuedAt,
    source: "supabase",
    userIdTail: userIdTail(identity.externalUserId),
  });

  const redirectUrl = new URL("/sso/receive", getLegacyProBaseUrl());
  redirectUrl.searchParams.set("code", code);
  redirectUrl.searchParams.set("source", "ixai-app");

  return NextResponse.json(
    {
      expiresAt: new Date(expiresAt).toISOString(),
      expiresInSeconds: Math.floor(LAUNCH_CODE_TTL_MS / 1000),
      ok: true,
      redirectUrl: redirectUrl.toString(),
      status: "ready",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function GET(request: NextRequest) {
  cleanupExpiredCodes();

  const code = request.nextUrl.searchParams.get("code")?.trim();

  if (!code) {
    return withCors(
      {
        ok: false,
        status: "missing_code",
        message: "缺少 IXAI Pro 連線代碼。",
      },
      { status: 400 },
    );
  }

  const key = hashLaunchCode(code);
  const record = launchStore.get(key);

  if (!record) {
    return withCors(
      {
        ok: false,
        status: "invalid_or_replayed",
        message: "連線已逾時或已被使用。",
      },
      { status: 410 },
    );
  }

  launchStore.delete(key);

  if (record.expiresAt <= Date.now()) {
    return withCors(
      {
        ok: false,
        status: "expired",
        message: "連線已逾時，請重新從 App 開啟 IXAI Pro。",
      },
      { status: 410 },
    );
  }

  return withCors({
    expiresAt: new Date(record.expiresAt).toISOString(),
    identity: {
      emailMasked: record.emailMasked,
      source: record.source,
      userIdPresent: record.userIdTail !== null,
      userIdTail: record.userIdTail,
    },
    issuedAt: new Date(record.issuedAt).toISOString(),
    ok: true,
    status: "valid",
  });
}
