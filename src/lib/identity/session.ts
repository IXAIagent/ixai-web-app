import {
  createDefaultMemory,
  readPersonalMemory,
  writePersonalMemory,
} from "@/src/lib/personalization/memory";
import { getAuthRedirectUrl } from "@/src/lib/auth/get-auth-redirect-url";
import { log } from "@/src/lib/log";
import {
  createSupabaseBrowserClient,
  getSupabaseClientConfig,
} from "@/src/lib/supabase/client";
import type {
  IXAISession,
  IXAIUser,
  PersonalMemory,
  PersistedIdentityPayload,
} from "@/src/types/identity";
import type { AuthError, Session, User } from "@supabase/supabase-js";

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
    const parsed = raw ? JSON.parse(raw) as { user?: IXAIUser } : null;
    const userId = parsed?.user?.id;

    return {
      session: getGuestSession(),
      memory: readPersonalMemory(userId),
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
      lastSeenAt: new Date().toISOString(),
      user: session.user
        ? {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            avatarUrl: session.user.avatarUrl,
          }
        : null,
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

type SupabaseAuthResponse = {
  code?: string;
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

export type AuthActionResult = {
  ok: boolean;
  message: string;
  debugMessage?: string;
  session?: IXAISession;
  requiresEmailConfirmation?: boolean;
};

export function buildUserFromSupabaseUser(user: User | null | undefined): IXAIUser | null {
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

export function buildIXAISessionFromSupabaseSession(session: Session | null): IXAISession | null {
  const user = buildUserFromSupabaseUser(session?.user);

  if (!user) {
    return null;
  }

  return {
    mode: "authenticated",
    user,
  };
}

type AuthErrorContext = "login" | "register" | "magic_link";

type IXAIAuthDebugError = Error & {
  code?: string;
  status?: number;
  responseBody?: unknown;
};

function authErrorToPayload(error: AuthError | Error | null): SupabaseAuthResponse {
  if (!error) {
    return {};
  }

  const authError = error as AuthError & { code?: string; status?: number };

  return {
    code: authError.code,
    message: authError.message,
    name: authError.name,
    status: authError.status,
  };
}

function logAuthDebug(
  context: AuthErrorContext,
  details: {
    status?: number;
    error?: string;
    errorDescription?: string;
    message?: string;
  },
) {
  log.error("[IXAI AUTH]", {
    context,
    status: details.status,
    error: details.error,
    errorDescription: details.errorDescription,
    message: details.message,
  });
}

function logRegisterRawError(error: IXAIAuthDebugError) {
  log.error("[IXAI REGISTER RAW ERROR]", error);
  log.error("[IXAI REGISTER RAW ERROR DETAILS]", {
    message: error.message,
    status: error.status,
    code: error.code,
    name: error.name,
    responseBody: error.responseBody,
  });
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
  const supabase = createSupabaseBrowserClient();

  if (!supabase) {
    return {
      ok: false,
      message: "IXAI Account production auth 尚未設定。",
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const payload = authErrorToPayload(error);
      return {
        ok: false,
        message: normalizeAuthError(payload, "login", payload.status),
      };
    }

    const session = buildIXAISessionFromSupabaseSession(data.session);

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

export async function signInWithGoogleOAuth() {
  const supabase = createSupabaseBrowserClient();

  if (!supabase) {
    return {
      ok: false,
      message: "IXAI Account production auth 尚未設定。",
    };
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: getAuthRedirectUrl(),
    },
  });

  if (error) {
    const payload = authErrorToPayload(error);
    return {
      ok: false,
      message: normalizeAuthError(payload, "login", payload.status),
    };
  }

  return {
    ok: true,
    message: "正在前往 Google 登入。",
  };
}

export async function registerWithPassword(
  email: string,
  password: string,
): Promise<PasswordAuthResult> {
  try {
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      throw new Error("IXAI Account production auth 尚未設定。");
    }

    const callbackUrl = getAuthRedirectUrl();

    log.debug({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: callbackUrl,
      },
    });

    if (error) {
      const payload = authErrorToPayload(error);
      logRegisterRawError({
        ...error,
        code: payload.code,
        responseBody: payload,
        status: payload.status,
      } as IXAIAuthDebugError);
      return {
        ok: false,
        message: normalizeAuthError(payload, "register", payload.status),
        debugMessage: process.env.NODE_ENV !== "production" ? error.message : undefined,
      };
    }

    const session = buildIXAISessionFromSupabaseSession(data.session);

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

export async function signOutSupabase() {
  const supabase = createSupabaseBrowserClient();

  if (!supabase) {
    return;
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    log.warn("[IXAI AUTH] signOut failed", {
      message: error.message,
      name: error.name,
    });
  }
}

export async function sendMagicLink(email: string) {
  const supabase = createSupabaseBrowserClient();

  if (!supabase) {
    return {
      ok: false,
      message: "IXAI Account production auth 尚未設定。",
    };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: getAuthRedirectUrl(),
      shouldCreateUser: true,
    },
  });

  if (error) {
    const payload = authErrorToPayload(error);
    return {
      ok: false,
      message: normalizeAuthError(payload, "magic_link", payload.status),
    };
  }

  return {
    ok: true,
    message: "登入連結已送出，請檢查你的信箱。",
  };
}

export async function getCurrentSupabaseIXAISession(): Promise<IXAISession | null> {
  const supabase = createSupabaseBrowserClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.auth.getSession();

  if (error) {
    log.warn("[IXAI AUTH] getSession failed", {
      message: error.message,
      name: error.name,
    });
    return null;
  }

  return buildIXAISessionFromSupabaseSession(data.session);
}
