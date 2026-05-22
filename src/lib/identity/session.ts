import {
  createDefaultMemory,
  readPersonalMemory,
  writePersonalMemory,
} from "@/src/lib/personalization/memory";
import { getSupabaseClientConfig } from "@/src/lib/supabase/client";
import type {
  IXAISession,
  IXAIUser,
  PersonalMemory,
  PersistedIdentityPayload,
} from "@/src/types/identity";

const IDENTITY_KEY = "ixai.identity.v1";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getGuestSession(): IXAISession {
  return {
    mode: "guest",
    user: null,
  };
}

export function readIdentityPayload(): PersistedIdentityPayload {
  if (!canUseStorage()) {
    return {
      session: getGuestSession(),
      memory: createDefaultMemory(),
    };
  }

  try {
    const raw = window.localStorage.getItem(IDENTITY_KEY);
    const parsed = raw ? JSON.parse(raw) : null;

    if (!parsed?.session || parsed.session.mode !== "authenticated") {
      return {
        session: getGuestSession(),
        memory: readPersonalMemory(),
      };
    }

    const session = parsed.session as IXAISession;

    return {
      session,
      memory: readPersonalMemory(session.user?.id),
    };
  } catch {
    return {
      session: getGuestSession(),
      memory: readPersonalMemory(),
    };
  }
}

export function writeIdentityPayload(session: IXAISession, memory: PersonalMemory) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(
    IDENTITY_KEY,
    JSON.stringify({
      session,
      memory,
    }),
  );
  writePersonalMemory(memory, session.user?.id);
  window.dispatchEvent(new Event("ixai-identity-change"));
}

export function clearIdentityPayload() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(IDENTITY_KEY);
  window.dispatchEvent(new Event("ixai-identity-change"));
}

export function getSupabaseAuthConfig() {
  return getSupabaseClientConfig();
}

export function isSupabaseAuthConfigured() {
  return getSupabaseAuthConfig() !== null;
}

export function buildGoogleOAuthUrl(redirectTo: string) {
  const config = getSupabaseAuthConfig();

  if (!config) {
    return null;
  }

  const params = new URLSearchParams({
    provider: "google",
    redirect_to: redirectTo,
  });

  return `${config.url}/auth/v1/authorize?${params.toString()}`;
}

type SupabaseAuthResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  expires_in?: number;
  user?: {
    id?: string;
    email?: string;
    user_metadata?: {
      name?: string;
      full_name?: string;
      avatar_url?: string;
    };
  };
  error?: string;
  error_description?: string;
  msg?: string;
};

export type PasswordAuthResult = {
  ok: boolean;
  message: string;
  session?: IXAISession;
  requiresEmailConfirmation?: boolean;
};

function buildUserFromAuthResponse(user: SupabaseAuthResponse["user"]): IXAIUser | null {
  if (!user?.id) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name ?? user.user_metadata?.full_name,
    avatarUrl: user.user_metadata?.avatar_url,
  };
}

function buildSessionFromAuthResponse(payload: SupabaseAuthResponse): IXAISession | null {
  if (!payload.access_token) {
    return null;
  }

  const user = buildUserFromAuthResponse(payload.user);

  if (!user) {
    return null;
  }

  return {
    mode: "authenticated",
    user,
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    expiresAt: payload.expires_at ?? (
      payload.expires_in ? Math.floor(Date.now() / 1000) + payload.expires_in : undefined
    ),
  };
}

function normalizeAuthError(payload: SupabaseAuthResponse, fallback: string) {
  const raw = payload.error_description ?? payload.msg ?? payload.error ?? "";
  const lower = raw.toLowerCase();

  if (lower.includes("invalid login") || lower.includes("invalid credentials")) {
    return "Email 或密碼不正確，請確認後再試一次。";
  }

  if (lower.includes("already registered") || lower.includes("already exists")) {
    return "此 Email 已建立 IXAI Account，請直接登入。";
  }

  if (lower.includes("email not confirmed")) {
    return "此帳戶尚未完成 Email 驗證，請先確認信箱。";
  }

  if (lower.includes("password")) {
    return "密碼格式不符合要求，請使用較長且不易猜測的密碼。";
  }

  return fallback;
}

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<PasswordAuthResult> {
  const config = getSupabaseAuthConfig();

  if (!config) {
    return {
      ok: false,
      message: "登入同步尚未啟用。你仍可使用 Guest 模式閱讀內容與建立自選觀察。",
    };
  }

  try {
    const response = await fetch(`${config.url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: config.anonKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const payload = await response.json() as SupabaseAuthResponse;

    if (!response.ok) {
      return {
        ok: false,
        message: normalizeAuthError(payload, "登入暫時無法完成，請稍後再試。"),
      };
    }

    const session = buildSessionFromAuthResponse(payload);

    if (!session) {
      return {
        ok: false,
        message: "登入已回應，但無法建立 IXAI session。請稍後再試。",
      };
    }

    return {
      ok: true,
      message: "已登入 IXAI Account。",
      session,
    };
  } catch {
    return {
      ok: false,
      message: "登入服務暫時無法連線，請稍後再試。",
    };
  }
}

export async function registerWithPassword(
  email: string,
  password: string,
): Promise<PasswordAuthResult> {
  const config = getSupabaseAuthConfig();

  if (!config) {
    return {
      ok: false,
      message: "帳號建立尚未啟用。你仍可使用 Guest 模式閱讀內容與建立自選觀察。",
    };
  }

  try {
    const response = await fetch(`${config.url}/auth/v1/signup`, {
      method: "POST",
      headers: {
        apikey: config.anonKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const payload = await response.json() as SupabaseAuthResponse;

    if (!response.ok) {
      return {
        ok: false,
        message: normalizeAuthError(payload, "帳號暫時無法建立，請稍後再試。"),
      };
    }

    const session = buildSessionFromAuthResponse(payload);

    if (!session) {
      return {
        ok: true,
        message: "IXAI Account 已建立。若 Supabase 啟用 Email 驗證，請先確認信箱後再登入。",
        requiresEmailConfirmation: true,
      };
    }

    return {
      ok: true,
      message: "IXAI Account 已建立並登入。",
      session,
    };
  } catch {
    return {
      ok: false,
      message: "帳號服務暫時無法連線，請稍後再試。",
    };
  }
}

export async function signOutSupabase(accessToken?: string) {
  const config = getSupabaseAuthConfig();

  if (!config || !accessToken) {
    return;
  }

  try {
    await fetch(`${config.url}/auth/v1/logout`, {
      method: "POST",
      headers: {
        apikey: config.anonKey,
        authorization: `Bearer ${accessToken}`,
      },
    });
  } catch {
    // Local sign-out still clears the IXAI session.
  }
}

export async function sendMagicLink(email: string, redirectTo: string) {
  const config = getSupabaseAuthConfig();

  if (!config) {
    return {
      ok: false,
      message: "登入同步尚未啟用。你仍可使用 Guest 模式閱讀內容與建立自選觀察。",
    };
  }

  const response = await fetch(`${config.url}/auth/v1/otp`, {
    method: "POST",
    headers: {
      apikey: config.anonKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      email,
      create_user: true,
      email_redirect_to: redirectTo,
    }),
  });

  if (!response.ok) {
    return {
      ok: false,
      message: "Email 登入連結暫時無法送出，請稍後再試。",
    };
  }

  return {
    ok: true,
    message: "登入連結已送出，請檢查你的信箱。",
  };
}

export function readHashSession() {
  if (typeof window === "undefined" || !window.location.hash) {
    return null;
  }

  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const accessToken = params.get("access_token");

  if (!accessToken) {
    return null;
  }

  return {
    accessToken,
    refreshToken: params.get("refresh_token") ?? undefined,
    expiresAt: params.get("expires_at")
      ? Number(params.get("expires_at"))
      : undefined,
  };
}

export async function fetchSupabaseUser(accessToken: string): Promise<IXAIUser | null> {
  const config = getSupabaseAuthConfig();

  if (!config) {
    return null;
  }

  const response = await fetch(`${config.url}/auth/v1/user`, {
    headers: {
      apikey: config.anonKey,
      authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  const user = await response.json() as {
    id?: string;
    email?: string;
    user_metadata?: {
      name?: string;
      full_name?: string;
      avatar_url?: string;
    };
  };

  if (!user.id) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name ?? user.user_metadata?.full_name,
    avatarUrl: user.user_metadata?.avatar_url,
  };
}
