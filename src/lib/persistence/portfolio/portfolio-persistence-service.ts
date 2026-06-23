"use client";

import { getWorkspacePortfolioPersistenceSummary } from "@/src/lib/portfolio/persistence";
import {
  listCryptoPositions,
  listFcnPositions,
  listPortfolioPositions,
  listStockPositions,
} from "@/src/lib/persistence/portfolio/portfolio-persistence-repository";
import type {
  PortfolioPersistenceReadiness,
  PortfolioPersistenceReadResult,
  PersistentPortfolioPosition,
} from "@/src/lib/persistence/portfolio/portfolio-persistence-types";

export async function getPersistentPortfolioReadback(): Promise<
  PortfolioPersistenceReadResult<PersistentPortfolioPosition>
> {
  try {
    const [portfolio, stock, crypto, fcn] = await Promise.all([
      listPortfolioPositions(),
      listStockPositions(),
      listCryptoPositions(),
      listFcnPositions(),
    ]);
    const positions = [
      ...portfolio.positions,
      ...stock.positions,
      ...crypto.positions,
      ...fcn.positions,
    ];
    const warnings = [
      ...portfolio.warnings,
      ...stock.warnings,
      ...crypto.warnings,
      ...fcn.warnings,
    ];

    return {
      generatedAt: new Date().toISOString(),
      positions,
      sourceStatus: positions.length > 0 ? "persisted" : "unavailable",
      warnings: Array.from(new Set(warnings)),
    };
  } catch {
    return {
      generatedAt: new Date().toISOString(),
      positions: [],
      sourceStatus: "error",
      warnings: ["Persistent portfolio repository readback failed safely."],
    };
  }
}

export async function getPortfolioPersistenceReadiness(): Promise<PortfolioPersistenceReadiness> {
  try {
    const [persistent, fallback] = await Promise.all([
      getPersistentPortfolioReadback(),
      getWorkspacePortfolioPersistenceSummary(),
    ]);
    const localCount = fallback.summary.localPositions + fallback.summary.fallbackPositions;

    return {
      generatedAt: new Date().toISOString(),
      hasLocalFallback: localCount > 0 || fallback.sourceStatus !== "unavailable",
      persistedPositionCount: persistent.positions.length,
      sourceStatus:
        persistent.positions.length > 0
          ? "persisted"
          : fallback.sourceStatus === "unavailable"
            ? persistent.sourceStatus
            : "fallback",
      summary:
        "Portfolio persistence foundation is ready as an abstraction. Runtime continues using existing local/fallback readback until durable tables are explicitly migrated.",
      warnings: [...persistent.warnings, ...fallback.summary.warnings.map((item) => item.message)],
    };
  } catch {
    return {
      generatedAt: new Date().toISOString(),
      hasLocalFallback: false,
      persistedPositionCount: 0,
      sourceStatus: "error",
      summary: "Portfolio persistence readiness failed safely.",
      warnings: ["Portfolio persistence readiness is unavailable."],
    };
  }
}
