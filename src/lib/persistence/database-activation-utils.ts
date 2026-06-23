import { getSupabaseClientConfig } from "@/src/lib/supabase/client";

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

  try {
    const response = await fetch(
      `${config.url.replace(/\/$/, "")}/rest/v1/${table}?select=${encodeURIComponent(select)}&limit=50`,
      {
        cache: "no-store",
        headers: {
          apikey: config.anonKey,
          authorization: `Bearer ${config.anonKey}`,
        },
      },
    );

    if (!response.ok) {
      return {
        generatedAt: new Date().toISOString(),
        rows: [],
        status: isMissingTableStatus(response.status) ? "missing" : "error",
        table,
        warnings: [`${table} readback returned HTTP ${response.status}; fallback remains active.`],
      };
    }

    const payload = await response.json();

    return {
      generatedAt: new Date().toISOString(),
      rows: Array.isArray(payload) ? (payload as TRow[]) : [],
      status: "configured",
      table,
      warnings: [],
    };
  } catch {
    return {
      generatedAt: new Date().toISOString(),
      rows: [],
      status: "error",
      table,
      warnings: [`${table} database readback failed safely; fallback remains active.`],
    };
  }
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
