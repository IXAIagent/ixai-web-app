"use client";

import { getPortfolioDatabaseActivationReadiness } from "@/src/lib/persistence/portfolio";
import type { V13PortfolioWriteReadiness } from "@/src/lib/workspace/portfolio-database-write-activation/portfolio-write-activation-types";
import { getV13PortfolioWriteGuardSet } from "@/src/lib/workspace/portfolio-database-write-activation/portfolio-write-activation-guards";

function isReady(status?: string) {
  return status === "ready" || status === "partial" || status === "persisted";
}

export async function getV13PortfolioWriteReadiness(): Promise<V13PortfolioWriteReadiness> {
  const guardSet = getV13PortfolioWriteGuardSet();
  const portfolioReadiness = await getPortfolioDatabaseActivationReadiness().catch(() => null);
  const databaseReady = isReady(portfolioReadiness?.sourceStatus);

  return {
    checkedAt: new Date().toISOString(),
    databaseReady,
    fallbackEnabled: guardSet.portfolioFallbackEnabled,
    guardSet,
    phase: "v13.00_portfolio_database_write_activation",
    readPriority: ["database", "truth", "local", "empty"],
    safeNextAction:
      "Keep V13 guards disabled until staging validates portfolio, stock, and crypto writes; FCN remains disabled for V14.",
    summary:
      "V13.00 adds guarded Portfolio / Stock / Crypto database write readiness while preserving Input Truth Bridge and local fallback.",
    tableStatus: {
      cryptoPositions: portfolioReadiness?.sourceStatus ?? "unknown",
      portfolios: portfolioReadiness?.sourceStatus ?? "unknown",
      stockPositions: portfolioReadiness?.sourceStatus ?? "unknown",
    },
  };
}
