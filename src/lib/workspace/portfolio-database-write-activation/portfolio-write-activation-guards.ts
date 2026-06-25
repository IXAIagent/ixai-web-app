import type {
  V13PortfolioWriteGuard,
  V13PortfolioWriteGuardSet,
  V13PortfolioWriteModule,
} from "@/src/lib/workspace/portfolio-database-write-activation/portfolio-write-activation-types";

function envEnabled(name: string) {
  return process.env[name]?.toLowerCase() === "enabled";
}

function v12GlobalGuardEnabled() {
  return (
    envEnabled("NEXT_PUBLIC_IXAI_V12_DATABASE_WRITES") ||
    envEnabled("NEXT_PUBLIC_IXAI_DATABASE_WRITE_CUTOVER")
  );
}

function moduleEnvNames(module: V13PortfolioWriteModule) {
  if (module === "portfolio") {
    return ["NEXT_PUBLIC_IXAI_V13_WRITE_PORTFOLIO", "NEXT_PUBLIC_IXAI_DATABASE_WRITE_PORTFOLIO"];
  }

  if (module === "stock_position") {
    return [
      "NEXT_PUBLIC_IXAI_V13_WRITE_STOCK_POSITIONS",
      "NEXT_PUBLIC_IXAI_DATABASE_WRITE_STOCK_POSITIONS",
    ];
  }

  if (module === "crypto_position") {
    return [
      "NEXT_PUBLIC_IXAI_V13_WRITE_CRYPTO_POSITIONS",
      "NEXT_PUBLIC_IXAI_DATABASE_WRITE_CRYPTO_POSITIONS",
    ];
  }

  return ["NEXT_PUBLIC_IXAI_V13_WRITE_FCN", "NEXT_PUBLIC_IXAI_DATABASE_WRITE_FCN"];
}

export function getV13PortfolioWriteGuard(module: V13PortfolioWriteModule): V13PortfolioWriteGuard {
  const checkedAt = new Date().toISOString();

  if (module === "fcn") {
    return {
      checkedAt,
      enabled: false,
      module,
      reason:
        "V13.00 keeps FCN database writes disabled; FCN Wizard, Draft Store, /api/fcn readback, and FCN fallback remain unchanged.",
      source: "scope_disabled",
    };
  }

  const globalEnabled = v12GlobalGuardEnabled();
  const moduleEnabled = moduleEnvNames(module).some(envEnabled);

  if (globalEnabled && moduleEnabled) {
    return {
      checkedAt,
      enabled: true,
      module,
      reason:
        "Database writes are enabled by explicit V12 global guard plus V13 portfolio module guard.",
      source: "environment",
    };
  }

  return {
    checkedAt,
    enabled: false,
    module,
    reason:
      "Database writes are disabled by default; Input Truth Bridge and local fallback remain active.",
    source: "default_disabled",
  };
}

export function getV13PortfolioWriteGuardSet(): V13PortfolioWriteGuardSet {
  return {
    checkedAt: new Date().toISOString(),
    cryptoPositionDatabaseWriteEnabled: getV13PortfolioWriteGuard("crypto_position"),
    diagnosticsReadOnly: true,
    fcnDatabaseWriteEnabled: getV13PortfolioWriteGuard("fcn"),
    portfolioDatabaseWriteEnabled: getV13PortfolioWriteGuard("portfolio"),
    portfolioFallbackEnabled: true,
    stockPositionDatabaseWriteEnabled: getV13PortfolioWriteGuard("stock_position"),
    v12GlobalGuardEnabled: v12GlobalGuardEnabled(),
  };
}
