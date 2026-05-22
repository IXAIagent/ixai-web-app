import {
  createDefaultMemory,
  readPersonalMemory,
  writePersonalMemory,
} from "@/src/lib/personalization/memory";
import { getAuthRedirectUrl } from "@/src/lib/auth/get-auth-redirect-url";
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

export function buildGoogleOAuthUrl() {
  const config = getSupabaseAuthConfig();

  if (!config) {
    return null;
  }

  const params = new URLSearchParams({
    provider: "google",
    redirect_to: getAuthRedirectUrl(),
  });

  return `${config.url}/auth/v1/authorize?${params.toString()}`;
}

type SupabaseAuthResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  expires_in?: number;
  code?: string;
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
  message?: string;
  msg?: string;
  name?: string;
  status?: number;
};

export type PasswordAuthResult = {
  ok: boolean;
  message: string;
  debugMessage?: string;
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

type AuthErrorContext = "login" | "register" | "magic_link";

type IXAIAuthDebugError = Error & {
  code?: string;
  status?: number;
  responseBody?: unknown;
};

function logAuthDebug(
  context: AuthErrorContext,
  details: {
    status?: number;
    error?: string;
    errorDescription?: string;
    message?: string;
  },
) {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  console.error("[IXAI AUTH]", {
    context,
    status: details.status,
    error: details.error,
    errorDescription: details.errorDescription,
    message: details.message,
  });
}

function logRegisterRawError(error: IXAIAuthDebugError) {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  console.error("[IXAI REGISTER RAW ERROR]", error);
  console.error("[IXAI REGISTER RAW ERROR DETAILS]", {
    message: error.message,
    status: error.status,
    code: error.code,
    name: error.name,
    responseBody: error.responseBody,
  });
}

function getSupabaseAuthConfigOrThrow() {
  const config = getSupabaseAuthConfig();

  if (!config) {
    throw new Error("IXAI Account production auth 尚未設定。");
  }

  return config;
}

async function parseSupabaseAuthResponse(response: Response): Promise<SupabaseAuthResponse> {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text) as SupabaseAuthResponse;
  } catch {
    return {
      error: "invalid_auth_response",
      message: text,
    };
  }
}

function buildSupabaseAuthError(
  payload: SupabaseAuthResponse,
  status?: number,
): IXAIAuthDebugError {
  const message =
    payload.message ??
    payload.error_description ??
    payload.msg ??
    payload.error ??
    `Supabase auth request failed${status ? ` with status ${status}` : ""}.`;
  const error = new Error(message) as IXAIAuthDebugError;
  error.name = payload.name ?? "SupabaseAuthError";
  error.status = payload.status ?? status;
  error.code = payload.code ?? payload.error;
  error.responseBody = payload;
  return error;
}

function createSupabaseAuthClient() {
  const config = getSupabaseAuthConfigOrThrow();

  return {
    auth: {
      async signUp({
        email,
        password,
        options,
      }: {
        email: string;
        password: string;
        options: {
          emailRedirectTo: string;
        };
      }) {
        const signUpUrl = new URL(`${config.url}/auth/v1/signup`);
        signUpUrl.searchParams.set("redirect_to", options.emailRedirectTo);

        const response = await fetch(signUpUrl.toString(), {
          method: "POST",
          headers: {
            apikey: config.anonKey,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            email_redirect_to: options.emailRedirectTo,
            options: {
              emailRedirectTo: options.emailRedirectTo,
              email_redirect_to: options.emailRedirectTo,
            },
          }),
        });
        const payload = await parseSupabaseAuthResponse(response);

        if (!response.ok) {
          return {
            data: null,
            error: buildSupabaseAuthError(payload, response.status),
            payload,
            status: response.status,
          };
        }

        return {
          data: payload,
          error: null,
          payload,
          status: response.status,
        };
      },
    },
  };
}

function normalizeAuthError(
  payload: SupabaseAuthResponse,
  context: AuthErrorContext,
  status?: number,
) {
  const raw =
    payload.message ?? payload.error_description ?? payload.msg ?? payload.error ?? "";
  const lower = raw.toLowerCase();

  logAuthDebug(context, {
    status,
    error: payload.error,
    errorDescription: payload.error_description,
    message: payload.msg,
  });

  if (
    status === 429 ||
    lower.includes("rate limit") ||
    lower.includes("rate_limit") ||
    lower.includes("too many") ||
    lower.includes("over_email_send_rate_limit")
  ) {
    return "操作過於頻繁，請稍後再試。";
  }

  if (
    lower.includes("invalid email") ||
    lower.includes("invalid_email") ||
    lower.includes("email address is invalid") ||
    lower.includes("unable to validate email") ||
    lower.includes("valid email")
  ) {
    return "Email 格式不正確。";
  }

  if (lower.includes("invalid login") || lower.includes("invalid credentials")) {
    return "Email 或密碼不正確。";
  }

  if (
    lower.includes("already registered") ||
    lower.includes("already exists") ||
    lower.includes("user already registered") ||
    lower.includes("user already exists")
  ) {
    return "此 Email 已註冊 IXAI Account，請直接登入。";
  }

  if (
    lower.includes("email not confirmed") ||
    lower.includes("email_not_confirmed") ||
    lower.includes("email not verified")
  ) {
    return "此帳戶尚未完成 Email 驗證，請先確認信箱。";
  }

  if (
    lower.includes("weak password") ||
    lower.includes("password should be at least") ||
    lower.includes("password must be at least") ||
    lower.includes("at least 6") ||
    lower.includes("minimum password")
  ) {
    return "密碼至少需要 6 個字元。";
  }

  if (lower.includes("password") && context === "register") {
    return "密碼至少需要 6 個字元。";
  }

  return context === "register" ? "IXAI Account 暫時無法建立。" : "目前無法登入 IXAI。";
}

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<PasswordAuthResult> {
  const config = getSupabaseAuthConfig();

  if (!config) {
    return {
      ok: false,
      message: "IXAI Account production auth 尚未設定。",
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
        message: normalizeAuthError(payload, "login", response.status),
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
    logAuthDebug("login", {
      message: "network_error",
    });
    return {
      ok: false,
      message: "目前無法登入 IXAI。",
    };
  }
}

export async function registerWithPassword(
  email: string,
  password: string,
): Promise<PasswordAuthResult> {
  try {
    const supabase = createSupabaseAuthClient();
    const callbackUrl = getAuthRedirectUrl();

    if (process.env.NODE_ENV === "development") {
      console.log({
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
      });
    }

    const { data: payload, error, status } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: callbackUrl,
      },
    });

    if (error) {
      logRegisterRawError(error);
      const errorPayload =
        error.responseBody && typeof error.responseBody === "object"
          ? error.responseBody as SupabaseAuthResponse
          : { message: error.message, code: error.code, status: error.status };
      return {
        ok: false,
        message: normalizeAuthError(errorPayload, "register", status),
        debugMessage: process.env.NODE_ENV !== "production" ? error.message : undefined,
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
  } catch (error) {
    const authError = error instanceof Error
      ? error as IXAIAuthDebugError
      : new Error("Unknown register error") as IXAIAuthDebugError;

    logRegisterRawError(authError);
    return {
      ok: false,
      message:
        authError.message === "IXAI Account production auth 尚未設定。"
          ? authError.message
          : "IXAI Account 暫時無法建立。",
      debugMessage: process.env.NODE_ENV !== "production" ? authError.message : undefined,
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

export async function sendMagicLink(email: string) {
  const config = getSupabaseAuthConfig();

  if (!config) {
    return {
      ok: false,
      message: "IXAI Account production auth 尚未設定。",
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
      email_redirect_to: getAuthRedirectUrl(),
    }),
  });

  if (!response.ok) {
    let payload: SupabaseAuthResponse = {};

    try {
      payload = await response.json() as SupabaseAuthResponse;
    } catch {
      payload = {
        error: "magic_link_error",
      };
    }

    return {
      ok: false,
      message: normalizeAuthError(payload, "magic_link", response.status),
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
