import type {
  V11ControlledWriteGuard,
  V11DatabaseCutoverModule,
  V11ModuleWriteGuard,
} from "@/src/lib/workspace/database-cutover/database-cutover-types";

const MODULE_ENV: Record<V11DatabaseCutoverModule, string> = {
  alerts: "NEXT_PUBLIC_IXAI_DATABASE_WRITE_ALERTS",
  fcn: "NEXT_PUBLIC_IXAI_DATABASE_WRITE_FCN",
  portfolio: "NEXT_PUBLIC_IXAI_DATABASE_WRITE_PORTFOLIO",
  watchlist: "NEXT_PUBLIC_IXAI_DATABASE_WRITE_WATCHLIST",
};

function isEnabled(value: string | undefined) {
  return value === "enabled";
}

function moduleGuard(module: V11DatabaseCutoverModule): V11ModuleWriteGuard {
  const globalEnabled = isEnabled(process.env.NEXT_PUBLIC_IXAI_DATABASE_WRITE_CUTOVER);
  const moduleEnabled = isEnabled(process.env[MODULE_ENV[module]]);
  const enabled = globalEnabled && moduleEnabled;

  return {
    checkedAt: new Date().toISOString(),
    enabled,
    module,
    reason: enabled
      ? `${module} database writes are explicitly enabled by global and module guards.`
      : `${module} database writes are disabled by default; local/draft fallback remains active.`,
  };
}

export function getV11ControlledWriteGuard(): V11ControlledWriteGuard {
  const modules = {
    alerts: moduleGuard("alerts"),
    fcn: moduleGuard("fcn"),
    portfolio: moduleGuard("portfolio"),
    watchlist: moduleGuard("watchlist"),
  };
  const enabled = Object.values(modules).some((item) => item.enabled);

  return {
    checkedAt: new Date().toISOString(),
    enabled,
    modules,
    reason: enabled
      ? "One or more module write guards are explicitly enabled. Database writes still require readiness, ownership, context, and payload validation."
      : "Controlled database writes are disabled by default. No production write cutover is active.",
  };
}
