import { getSupabaseClientConfig } from "@/src/lib/supabase/client";
import {
  createAuthenticatedReadGate,
  safeAuthenticatedSupabaseRead,
} from "@/src/lib/workspace/runtime-safety/authenticated-supabase";

export type DatabaseActivationTableStatus =
  | "configured"
  | "error"
  | "missing"
  | "unavailable";

export interface DatabaseActivationTableReadback<TRow> {
  generatedAt: string;
  rows: TRow[];
  status: DatabaseActivationTableStatus;
  table: string;
  warnings: string[];
}

function isMissingTableStatus(status: number) {
  return status === 404 || status === 400;
}

export async function readDatabaseTable<TRow>(
  table: string,
  select = "*",
): Promise<DatabaseActivationTableReadback<TRow>> {
  const config = getSupabaseClientConfig();

  if (!config) {
    return {
      generatedAt: new Date().toISOString(),
      rows: [],
      status: "unavailable",
      table,
      warnings: ["Supabase public client config is unavailable."],
    };
  }

  const authState = await createAuthenticatedReadGate();
  const result = await safeAuthenticatedSupabaseRead<TRow[]>(table, authState, (state) =>
    fetch(
      `${config.url.replace(/\/$/, "")}/rest/v1/${table}?select=${encodeURIComponent(select)}&limit=50`,
      {
        cache: "no-store",
        headers: {
          apikey: config.anonKey,
          authorization: `Bearer ${state.accessToken}`,
        },
      },
    ),
  );

  if (!result.ok) {
    if (result.reason === "missing_table") {
      return {
        generatedAt: new Date().toISOString(),
        rows: [],
        status: "missing",
        table,
        warnings: [`${table} is missing or unreadable; fallback remains active.`],
      };
    }

    return {
      generatedAt: new Date().toISOString(),
      rows: [],
      status:
        result.status && isMissingTableStatus(result.status)
          ? "missing"
          : result.reason === "missing_auth" || result.reason === "disabled"
            ? "unavailable"
            : "error",
      table,
      warnings: [
        result.reason === "missing_auth"
          ? `${table} readback skipped until an authenticated Supabase session is available.`
          : result.reason === "disabled"
            ? `${table} readback is temporarily disabled after an authenticated fallback.`
            : `${table} readback returned ${result.status ? `HTTP ${result.status}` : result.reason}; fallback remains active.`,
      ],
    };
  }

  return {
    generatedAt: new Date().toISOString(),
    rows: Array.isArray(result.data) ? result.data : [],
    status: "configured",
    table,
    warnings: [],
  };
}

export function summarizeTableStatuses(
  statuses: DatabaseActivationTableReadback<unknown>[],
): {
  configured: number;
  error: number;
  missing: number;
  sourceStatus: "partial" | "ready" | "unavailable";
  unavailable: number;
} {
  const configured = statuses.filter((item) => item.status === "configured").length;
  const missing = statuses.filter((item) => item.status === "missing").length;
  const error = statuses.filter((item) => item.status === "error").length;
  const unavailable = statuses.filter((item) => item.status === "unavailable").length;

  return {
    configured,
    error,
    missing,
    sourceStatus:
      configured === statuses.length
        ? "ready"
        : configured > 0
          ? "partial"
          : "unavailable",
    unavailable,
  };
}
