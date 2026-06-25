import type { V12WritableModule, V12WriteGuard } from "@/src/lib/workspace/database-write-activation/database-write-activation-types";

function envEnabled(name: string) {
  return process.env[name]?.toLowerCase() === "enabled";
}

function moduleEnvNames(module: V12WritableModule) {
  if (module === "alert_history") {
    return ["NEXT_PUBLIC_IXAI_V12_WRITE_ALERT_HISTORY", "NEXT_PUBLIC_IXAI_DATABASE_WRITE_ALERTS"];
  }

  if (module === "watchlist") {
    return ["NEXT_PUBLIC_IXAI_V12_WRITE_WATCHLIST", "NEXT_PUBLIC_IXAI_DATABASE_WRITE_WATCHLIST"];
  }

  if (module === "portfolio") {
    return ["NEXT_PUBLIC_IXAI_V12_WRITE_PORTFOLIO", "NEXT_PUBLIC_IXAI_DATABASE_WRITE_PORTFOLIO"];
  }

  return ["NEXT_PUBLIC_IXAI_V12_WRITE_FCN", "NEXT_PUBLIC_IXAI_DATABASE_WRITE_FCN"];
}

export function getV12WriteGuard(module: V12WritableModule): V12WriteGuard {
  const checkedAt = new Date().toISOString();

  if (module === "portfolio" || module === "fcn") {
    return {
      checkedAt,
      enabled: false,
      module,
      reason: "V12.00 keeps Portfolio and FCN database writes disabled; readiness metadata only.",
      source: "scope_disabled",
    };
  }

  const globalEnabled =
    envEnabled("NEXT_PUBLIC_IXAI_V12_DATABASE_WRITES") ||
    envEnabled("NEXT_PUBLIC_IXAI_DATABASE_WRITE_CUTOVER");
  const moduleEnabled = moduleEnvNames(module).some(envEnabled);

  if (globalEnabled && moduleEnabled) {
    return {
      checkedAt,
      enabled: true,
      module,
      reason: "Database write activation is enabled by explicit V12/module environment guards.",
      source: "environment",
    };
  }

  return {
    checkedAt,
    enabled: false,
    module,
    reason:
      "Database writes are disabled by default; local fallback remains active until guards are explicitly enabled.",
    source: "default_disabled",
  };
}
