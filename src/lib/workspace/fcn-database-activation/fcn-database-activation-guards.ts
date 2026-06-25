import type {
  V14FcnWriteGuard,
  V14FcnWriteGuardSet,
  V14FcnWriteModule,
} from "@/src/lib/workspace/fcn-database-activation/fcn-database-activation-types";

function envEnabled(name: string) {
  return process.env[name]?.toLowerCase() === "enabled";
}

function v12GlobalGuardEnabled() {
  return (
    envEnabled("NEXT_PUBLIC_IXAI_V12_DATABASE_WRITES") ||
    envEnabled("NEXT_PUBLIC_IXAI_DATABASE_WRITE_CUTOVER")
  );
}

function moduleEnvNames(module: V14FcnWriteModule) {
  if (module === "fcn") {
    return ["NEXT_PUBLIC_IXAI_V14_WRITE_FCN", "NEXT_PUBLIC_IXAI_DATABASE_WRITE_FCN"];
  }

  if (module === "fcn_position") {
    return [
      "NEXT_PUBLIC_IXAI_V14_WRITE_FCN_POSITIONS",
      "NEXT_PUBLIC_IXAI_DATABASE_WRITE_FCN_POSITIONS",
    ];
  }

  if (module === "fcn_underlying") {
    return [
      "NEXT_PUBLIC_IXAI_V14_WRITE_FCN_UNDERLYINGS",
      "NEXT_PUBLIC_IXAI_DATABASE_WRITE_FCN_UNDERLYINGS",
    ];
  }

  return [
    "NEXT_PUBLIC_IXAI_V14_WRITE_FCN_SCHEDULE",
    "NEXT_PUBLIC_IXAI_DATABASE_WRITE_FCN_SCHEDULE",
  ];
}

export function getV14FcnWriteGuard(module: V14FcnWriteModule): V14FcnWriteGuard {
  const checkedAt = new Date().toISOString();
  const globalEnabled = v12GlobalGuardEnabled();
  const moduleEnabled = moduleEnvNames(module).some(envEnabled);

  if (globalEnabled && moduleEnabled) {
    return {
      checkedAt,
      enabled: true,
      module,
      reason:
        "FCN database writes are enabled by explicit V12 global guard plus V14 FCN module guard.",
      source: "environment",
    };
  }

  return {
    checkedAt,
    enabled: false,
    module,
    reason:
      "V14 FCN database writes are disabled by default; FCN Draft Store, Input Truth Bridge, /api/fcn readback, and local fallback remain active.",
    source: "default_disabled",
  };
}

export function getV14FcnWriteGuardSet(): V14FcnWriteGuardSet {
  return {
    checkedAt: new Date().toISOString(),
    diagnosticsReadOnly: true,
    fcnDatabaseWriteEnabled: getV14FcnWriteGuard("fcn"),
    fcnFallbackEnabled: true,
    fcnPositionDatabaseWriteEnabled: getV14FcnWriteGuard("fcn_position"),
    fcnScheduleDatabaseWriteEnabled: getV14FcnWriteGuard("fcn_schedule"),
    fcnUnderlyingDatabaseWriteEnabled: getV14FcnWriteGuard("fcn_underlying"),
    v12GlobalGuardEnabled: v12GlobalGuardEnabled(),
  };
}
