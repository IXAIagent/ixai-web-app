import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export type AdminGateMode = "password" | "development";

export const ADMIN_SESSION_COOKIE = "ixai_admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

export type AdminAccessState =
  | {
      mode: "locked";
      reason: "missing-production-password";
    }
  | {
      mode: AdminGateMode;
      isPasswordConfigured: boolean;
    };

export function getAdminPassword() {
  return process.env.IXAI_ADMIN_PASSWORD?.trim() || "";
}

export function hashAdminPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

export function getAdminAccessState(): AdminAccessState {
  const password = getAdminPassword();
  const isProduction = process.env.NODE_ENV === "production";

  if (!password && isProduction) {
    return {
      mode: "locked",
      reason: "missing-production-password",
    };
  }

  if (!password) {
    return {
      mode: "development",
      isPasswordConfigured: false,
    };
  }

  return {
    mode: "password",
    isPasswordConfigured: true,
  };
}

function signAdminSession(issuedAt: string, password: string) {
  return createHmac("sha256", hashAdminPassword(password))
    .update(issuedAt)
    .digest("hex");
}

export function createAdminSessionToken() {
  const password = getAdminPassword();

  if (!password) {
    return "";
  }

  const issuedAt = String(Date.now());
  const signature = signAdminSession(issuedAt, password);

  return `${issuedAt}.${signature}`;
}

export function verifyAdminPassword(password: string) {
  const configuredPassword = getAdminPassword();

  if (!configuredPassword) {
    return process.env.NODE_ENV !== "production";
  }

  const expected = Buffer.from(hashAdminPassword(configuredPassword), "hex");
  const received = Buffer.from(hashAdminPassword(password), "hex");

  return expected.length === received.length && timingSafeEqual(expected, received);
}

export function verifyAdminSessionToken(token: string | undefined | null) {
  const password = getAdminPassword();

  if (!password) {
    return process.env.NODE_ENV !== "production";
  }

  if (!token) {
    return false;
  }

  const [issuedAt, signature] = token.split(".");
  const issuedAtMs = Number(issuedAt);

  if (!issuedAt || !signature || !Number.isFinite(issuedAtMs)) {
    return false;
  }

  if (Date.now() - issuedAtMs > ADMIN_SESSION_MAX_AGE_SECONDS * 1000) {
    return false;
  }

  const expected = Buffer.from(signAdminSession(issuedAt, password), "hex");
  const received = Buffer.from(signature, "hex");

  return expected.length === received.length && timingSafeEqual(expected, received);
}

export function isAdminRequestAuthorized(request: NextRequest) {
  const accessState = getAdminAccessState();

  if (accessState.mode === "locked") {
    return false;
  }

  if (accessState.mode === "development") {
    return true;
  }

  return verifyAdminSessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}
