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

export async function sendMagicLink(email: string, redirectTo: string) {
  const config = getSupabaseAuthConfig();

  if (!config) {
    return {
      ok: false,
      message: "Supabase Auth 尚未設定。請先設定 NEXT_PUBLIC_SUPABASE_URL 與 NEXT_PUBLIC_SUPABASE_ANON_KEY。",
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
      message: "Magic link 無法送出，請確認 Supabase Auth 設定。",
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
