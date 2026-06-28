import { createSupabaseBrowserClient } from "@/src/lib/supabase/client";
import { isSupabaseMissingTableError } from "@/src/lib/workspace/runtime-safety/optional-supabase";
import { logWorkspaceRuntimeWarning } from "@/src/lib/workspace/runtime-safety/runtime-logger";

const PRIVATE_TABLE_DISABLE_KEY = "ixai.runtime.private-table-disabled.v1";
const PRIVATE_TABLE_COOLDOWN_MS = 15 * 60 * 1000;
const AUTH_STATE_CACHE_MS = 1500;

type DisabledPrivateTable = {
  disabledAt: number;
  reason: string;
  sessionKey: string;
};

export type AuthenticatedSupabaseReadState = {
  accessToken: string | null;
  sessionKey: string;
  sessionStatus: "authenticated" | "unauthenticated" | "unavailable";
  userId: string | null;
};

export type AuthenticatedSupabaseFallbackReason =
  | "disabled"
  | "missing_auth"
  | "missing_table"
  | "network_error"
  | "non_ok"
  | "unauthorized";

export type AuthenticatedSupabaseResult<TData> =
  | {
      data: TData;
      ok: true;
      reason: null;
      status: number;
    }
  | {
      data: null;
      ok: false;
      reason: AuthenticatedSupabaseFallbackReason;
      status: number | null;
    };

const disabledPrivateTables = new Map<string, DisabledPrivateTable>();

let authStateCache:
  | {
      expiresAt: number;
      state: AuthenticatedSupabaseReadState;
    }
  | null = null;

function canUseSessionStorage() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

function normalizeTableName(tableName: string) {
  return tableName.trim().toLowerCase();
}

function normalizeErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "unknown_error";
}

function sessionStorageKey(tableName: string, sessionKey: string) {
  return `${PRIVATE_TABLE_DISABLE_KEY}:${sessionKey}:${normalizeTableName(tableName)}`;
}

function readStoredDisable(tableName: string, sessionKey: string): DisabledPrivateTable | null {
  if (!canUseSessionStorage()) {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(sessionStorageKey(tableName, sessionKey));
    const parsed = raw ? (JSON.parse(raw) as DisabledPrivateTable) : null;

    return parsed &&
      typeof parsed.disabledAt === "number" &&
      typeof parsed.reason === "string" &&
      typeof parsed.sessionKey === "string"
      ? parsed
      : null;
  } catch {
    return null;
  }
}

function writeStoredDisable(tableName: string, disabled: DisabledPrivateTable) {
  if (!canUseSessionStorage()) {
    return;
  }

  try {
    window.sessionStorage.setItem(
      sessionStorageKey(tableName, disabled.sessionKey),
      JSON.stringify(disabled),
    );
  } catch {
    // Runtime safety storage is best-effort only.
  }
}

function isCooldownActive(disabled: DisabledPrivateTable) {
  return Date.now() - disabled.disabledAt < PRIVATE_TABLE_COOLDOWN_MS;
}

function privateTableKey(tableName: string, sessionKey: string) {
  return `${sessionKey}:${normalizeTableName(tableName)}`;
}

function getDisabledPrivateTable(tableName: string, sessionKey: string) {
  const key = privateTableKey(tableName, sessionKey);
  const stored = readStoredDisable(tableName, sessionKey);
  const disabled = disabledPrivateTables.get(key) ?? stored;

  if (!disabled) {
    return null;
  }

  if (isCooldownActive(disabled)) {
    disabledPrivateTables.set(key, disabled);
    return disabled;
  }

  disabledPrivateTables.delete(key);
  return null;
}

export function isSupabaseUnauthorizedError(error: unknown) {
  const message = normalizeErrorMessage(error).toLowerCase();

  return (
    message.includes("401") ||
    message.includes("unauthorized") ||
    message.includes("jwt") ||
    message.includes("invalid token") ||
    message.includes("auth session missing")
  );
}

export { isSupabaseMissingTableError };

export async function createAuthenticatedReadGate(): Promise<AuthenticatedSupabaseReadState> {
  if (authStateCache && Date.now() < authStateCache.expiresAt) {
    return authStateCache.state;
  }

  const supabase = createSupabaseBrowserClient();

  if (!supabase) {
    return {
      accessToken: null,
      sessionKey: "supabase_unconfigured",
      sessionStatus: "unavailable",
      userId: null,
    };
  }

  try {
    const { data, error } = await supabase.auth.getSession();
    const session = error ? null : data.session;
    const state: AuthenticatedSupabaseReadState = session?.access_token
      ? {
          accessToken: session.access_token,
          sessionKey: session.user?.id ?? "authenticated_unknown_user",
          sessionStatus: "authenticated",
          userId: session.user?.id ?? null,
        }
      : {
          accessToken: null,
          sessionKey: "anonymous",
          sessionStatus: "unauthenticated",
          userId: null,
        };

    authStateCache = {
      expiresAt: Date.now() + AUTH_STATE_CACHE_MS,
      state,
    };

    return state;
  } catch (error) {
    logWorkspaceRuntimeWarning("private-supabase-auth-state-fallback", error);
    return {
      accessToken: null,
      sessionKey: "auth_state_unavailable",
      sessionStatus: "unavailable",
      userId: null,
    };
  }
}

export function isPrivateTableTemporarilyDisabled(
  tableName: string,
  authState: Pick<AuthenticatedSupabaseReadState, "sessionKey">,
) {
  return getDisabledPrivateTable(tableName, authState.sessionKey) !== null;
}

export function shouldSkipPrivateTableRead(
  tableName: string,
  authState: AuthenticatedSupabaseReadState,
) {
  return (
    !authState.accessToken ||
    authState.sessionStatus !== "authenticated" ||
    isPrivateTableTemporarilyDisabled(tableName, authState)
  );
}

export function markPrivateTableUnauthorized(
  tableName: string,
  reason: string,
  authState: Pick<AuthenticatedSupabaseReadState, "sessionKey"> = { sessionKey: "unknown" },
) {
  const disabled: DisabledPrivateTable = {
    disabledAt: Date.now(),
    reason,
    sessionKey: authState.sessionKey,
  };
  const key = privateTableKey(tableName, authState.sessionKey);

  if (getDisabledPrivateTable(tableName, authState.sessionKey)) {
    return;
  }

  disabledPrivateTables.set(key, disabled);
  writeStoredDisable(tableName, disabled);
  logWorkspaceRuntimeWarning("private-supabase-table-unauthorized", reason, {
    cooldownMs: PRIVATE_TABLE_COOLDOWN_MS,
    sessionKey: authState.sessionKey,
    tableName: normalizeTableName(tableName),
  });
}

async function safeResponseText(response: Response) {
  try {
    return await response.clone().text();
  } catch {
    return null;
  }
}

export async function safeAuthenticatedSupabaseRead<TData>(
  tableName: string,
  authState: AuthenticatedSupabaseReadState,
  task: (authState: AuthenticatedSupabaseReadState) => Promise<Response>,
): Promise<AuthenticatedSupabaseResult<TData>> {
  if (!authState.accessToken || authState.sessionStatus !== "authenticated") {
    return {
      data: null,
      ok: false,
      reason: "missing_auth",
      status: null,
    };
  }

  if (isPrivateTableTemporarilyDisabled(tableName, authState)) {
    return {
      data: null,
      ok: false,
      reason: "disabled",
      status: null,
    };
  }

  try {
    const response = await task(authState);

    if (!response.ok) {
      const bodyText = await safeResponseText(response);

      if (response.status === 401 || isSupabaseUnauthorizedError(bodyText)) {
        markPrivateTableUnauthorized(
          tableName,
          bodyText ?? `http_${response.status}`,
          authState,
        );
        return {
          data: null,
          ok: false,
          reason: "unauthorized",
          status: response.status,
        };
      }

      if (response.status === 404 || isSupabaseMissingTableError(bodyText)) {
        markPrivateTableUnauthorized(
          tableName,
          bodyText ?? `http_${response.status}`,
          authState,
        );
        return {
          data: null,
          ok: false,
          reason: "missing_table",
          status: response.status,
        };
      }

      logWorkspaceRuntimeWarning("private-supabase-read-fallback", `http_${response.status}`, {
        tableName,
      });
      return {
        data: null,
        ok: false,
        reason: "non_ok",
        status: response.status,
      };
    }

    return {
      data: (await response.json()) as TData,
      ok: true,
      reason: null,
      status: response.status,
    };
  } catch (error) {
    if (isSupabaseUnauthorizedError(error)) {
      markPrivateTableUnauthorized(tableName, normalizeErrorMessage(error), authState);
      return {
        data: null,
        ok: false,
        reason: "unauthorized",
        status: null,
      };
    }

    logWorkspaceRuntimeWarning("private-supabase-read-network-fallback", error, { tableName });
    return {
      data: null,
      ok: false,
      reason: "network_error",
      status: null,
    };
  }
}

export async function safeAuthenticatedSupabaseWrite(
  tableName: string,
  authState: AuthenticatedSupabaseReadState,
  task: (authState: AuthenticatedSupabaseReadState) => Promise<Response>,
): Promise<AuthenticatedSupabaseResult<null>> {
  if (!authState.accessToken || authState.sessionStatus !== "authenticated") {
    return {
      data: null,
      ok: false,
      reason: "missing_auth",
      status: null,
    };
  }

  if (isPrivateTableTemporarilyDisabled(tableName, authState)) {
    return {
      data: null,
      ok: false,
      reason: "disabled",
      status: null,
    };
  }

  try {
    const response = await task(authState);

    if (!response.ok) {
      const bodyText = await safeResponseText(response);

      if (response.status === 401 || isSupabaseUnauthorizedError(bodyText)) {
        markPrivateTableUnauthorized(
          tableName,
          bodyText ?? `http_${response.status}`,
          authState,
        );
        return {
          data: null,
          ok: false,
          reason: "unauthorized",
          status: response.status,
        };
      }

      logWorkspaceRuntimeWarning("private-supabase-write-fallback", `http_${response.status}`, {
        tableName,
      });
      return {
        data: null,
        ok: false,
        reason: "non_ok",
        status: response.status,
      };
    }

    return {
      data: null,
      ok: true,
      reason: null,
      status: response.status,
    };
  } catch (error) {
    if (isSupabaseUnauthorizedError(error)) {
      markPrivateTableUnauthorized(tableName, normalizeErrorMessage(error), authState);
      return {
        data: null,
        ok: false,
        reason: "unauthorized",
        status: null,
      };
    }

    logWorkspaceRuntimeWarning("private-supabase-write-network-fallback", error, { tableName });
    return {
      data: null,
      ok: false,
      reason: "network_error",
      status: null,
    };
  }
}
