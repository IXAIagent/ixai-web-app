import { logWorkspaceRuntimeWarning } from "@/src/lib/workspace/runtime-safety/runtime-logger";

const OPTIONAL_TABLE_COOLDOWN_MS = 15 * 60 * 1000;

type DisabledOptionalTable = {
  disabledAt: number;
  reason: string;
};

const disabledOptionalTables = new Map<string, DisabledOptionalTable>();

export type OptionalSupabaseFallbackReason =
  | "disabled"
  | "missing_table"
  | "network_error"
  | "non_ok";

export type OptionalSupabaseResult<TData> =
  | {
      data: TData;
      ok: true;
      reason: null;
      status: number;
    }
  | {
      data: null;
      ok: false;
      reason: OptionalSupabaseFallbackReason;
      status: number | null;
    };

function normalizeErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "unknown_error";
}

function normalizeOptionalTableName(tableName: string) {
  return tableName.trim().toLowerCase();
}

function isCooldownActive(disabled: DisabledOptionalTable) {
  return Date.now() - disabled.disabledAt < OPTIONAL_TABLE_COOLDOWN_MS;
}

export function isOptionalTableDisabled(tableName: string) {
  const key = normalizeOptionalTableName(tableName);
  const disabled = disabledOptionalTables.get(key);

  if (!disabled) {
    return false;
  }

  if (isCooldownActive(disabled)) {
    return true;
  }

  disabledOptionalTables.delete(key);
  return false;
}

export function markOptionalTableUnavailable(tableName: string, reason: string) {
  const key = normalizeOptionalTableName(tableName);

  if (isOptionalTableDisabled(key)) {
    return;
  }

  disabledOptionalTables.set(key, {
    disabledAt: Date.now(),
    reason,
  });
  logWorkspaceRuntimeWarning("optional-supabase-table-unavailable", reason, {
    cooldownMs: OPTIONAL_TABLE_COOLDOWN_MS,
    tableName: key,
  });
}

export function isSupabaseMissingTableError(error: unknown) {
  const message = normalizeErrorMessage(error).toLowerCase();

  return (
    message.includes("pgrst205") ||
    message.includes("relation does not exist") ||
    message.includes("could not find the table") ||
    message.includes("schema cache") ||
    message.includes("missing table")
  );
}

export function isOptionalSupabase404(status: number | null, bodyText?: string | null) {
  if (status !== 404) {
    return false;
  }

  if (!bodyText) {
    return true;
  }

  return isSupabaseMissingTableError(bodyText);
}

export function shouldDisableOptionalTable(
  tableName: string,
  input: { bodyText?: string | null; error?: unknown; status?: number | null },
) {
  return (
    isOptionalTableDisabled(tableName) ||
    isOptionalSupabase404(input.status ?? null, input.bodyText) ||
    isSupabaseMissingTableError(input.error)
  );
}

async function safeResponseText(response: Response) {
  try {
    return await response.clone().text();
  } catch {
    return null;
  }
}

export async function safeOptionalSupabaseRead<TData>(
  tableName: string,
  task: () => Promise<Response>,
): Promise<OptionalSupabaseResult<TData>> {
  if (isOptionalTableDisabled(tableName)) {
    return {
      data: null,
      ok: false,
      reason: "disabled",
      status: null,
    };
  }

  try {
    const response = await task();

    if (!response.ok) {
      const bodyText = await safeResponseText(response);

      if (shouldDisableOptionalTable(tableName, { bodyText, status: response.status })) {
        markOptionalTableUnavailable(tableName, bodyText ?? `http_${response.status}`);
        return {
          data: null,
          ok: false,
          reason: "missing_table",
          status: response.status,
        };
      }

      logWorkspaceRuntimeWarning("optional-supabase-read-fallback", `http_${response.status}`, {
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
    if (shouldDisableOptionalTable(tableName, { error })) {
      markOptionalTableUnavailable(tableName, normalizeErrorMessage(error));
      return {
        data: null,
        ok: false,
        reason: "missing_table",
        status: null,
      };
    }

    logWorkspaceRuntimeWarning("optional-supabase-read-network-fallback", error, { tableName });
    return {
      data: null,
      ok: false,
      reason: "network_error",
      status: null,
    };
  }
}

export async function safeOptionalSupabaseWrite(
  tableName: string,
  task: () => Promise<Response>,
): Promise<OptionalSupabaseResult<null>> {
  if (isOptionalTableDisabled(tableName)) {
    return {
      data: null,
      ok: false,
      reason: "disabled",
      status: null,
    };
  }

  try {
    const response = await task();

    if (!response.ok) {
      const bodyText = await safeResponseText(response);

      if (shouldDisableOptionalTable(tableName, { bodyText, status: response.status })) {
        markOptionalTableUnavailable(tableName, bodyText ?? `http_${response.status}`);
        return {
          data: null,
          ok: false,
          reason: "missing_table",
          status: response.status,
        };
      }

      logWorkspaceRuntimeWarning("optional-supabase-write-fallback", `http_${response.status}`, {
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
    if (shouldDisableOptionalTable(tableName, { error })) {
      markOptionalTableUnavailable(tableName, normalizeErrorMessage(error));
      return {
        data: null,
        ok: false,
        reason: "missing_table",
        status: null,
      };
    }

    logWorkspaceRuntimeWarning("optional-supabase-write-network-fallback", error, { tableName });
    return {
      data: null,
      ok: false,
      reason: "network_error",
      status: null,
    };
  }
}
