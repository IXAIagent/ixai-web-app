"use client";

import type { V13PortfolioWriteDiagnostics } from "@/src/lib/workspace/portfolio-database-write-activation/portfolio-write-activation-types";
import { getV13PortfolioWriteReadiness } from "@/src/lib/workspace/portfolio-database-write-activation/portfolio-write-readiness";
import { loadLastV13PortfolioWriteResult } from "@/src/lib/workspace/portfolio-database-write-activation/portfolio-write-service";

export async function getV13PortfolioWriteDiagnostics(): Promise<V13PortfolioWriteDiagnostics> {
  const readiness = await getV13PortfolioWriteReadiness();

  return {
    checkedAt: new Date().toISOString(),
    fcnDisabledReason: readiness.guardSet.fcnDatabaseWriteEnabled.reason,
    lastWriteResult: loadLastV13PortfolioWriteResult(),
    phase: "v13.00_portfolio_database_write_activation",
    readPriority: readiness.readPriority,
    readiness,
    summary:
      "Portfolio, Stock, and Crypto writes are guarded explicit actions. Diagnostics are read-only and never create workspace, portfolio, or position records.",
  };
}
