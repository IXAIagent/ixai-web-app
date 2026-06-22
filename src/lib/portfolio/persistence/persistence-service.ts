"use client";

import { loadPortfolioTruthReadback } from "@/src/lib/portfolio/truth/portfolio-truth-client";
import {
  readFallbackRecentInputs,
  readLocalDraftPositions,
  readPersistedCryptoPositions,
  readPersistedFcnPositions,
  readPersistedStockPositions,
} from "@/src/lib/portfolio/persistence/persistence-readback";
import { buildPortfolioPersistenceSummary } from "@/src/lib/portfolio/persistence/persistence-summary";
import type {
  PortfolioPersistedPosition,
  PortfolioPersistenceResult,
  PortfolioPersistenceWarning,
} from "@/src/lib/portfolio/persistence/persistence-types";

const DISCLAIMER =
  "Portfolio Persistence Layer is a canonical readback abstraction for monitoring and data organization only. It is not investment advice, broker sync, or trade execution.";

function dedupePositions(positions: PortfolioPersistedPosition[]) {
  const seen = new Set<string>();

  return positions.filter((position) => {
    const key = [
      position.assetClass,
      position.symbol ?? position.name ?? position.id,
      position.sourceName,
    ]
      .join(":")
      .toLowerCase();

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function warningFromPosition(
  position: PortfolioPersistedPosition,
): PortfolioPersistenceWarning | null {
  if (!position.warningMessage) {
    return null;
  }

  return {
    id: `${position.id}:warning`,
    message: position.warningMessage,
    sourceName: position.sourceName,
    sourceStatus: position.sourceStatus,
  };
}

export async function getPortfolioPersistenceSummary(): Promise<PortfolioPersistenceResult> {
  try {
    const truth = await loadPortfolioTruthReadback();
    const [stockPositions, cryptoPositions, fcnPositions] = await Promise.all([
      readPersistedStockPositions(truth),
      readPersistedCryptoPositions(truth),
      readPersistedFcnPositions(truth),
    ]);
    const positions = dedupePositions([
      ...stockPositions,
      ...cryptoPositions,
      ...fcnPositions,
      ...readLocalDraftPositions(),
      ...readFallbackRecentInputs(),
    ]);
    const positionWarnings = positions
      .map(warningFromPosition)
      .filter((warning): warning is PortfolioPersistenceWarning => Boolean(warning));
    const truthWarnings = truth.missingDataWarnings.map((message, index) => ({
      id: `truth-warning-${index}`,
      message,
      sourceName: "portfolio-truth-layer",
      sourceStatus: "partial" as const,
    }));
    const summary = buildPortfolioPersistenceSummary({
      positions,
      warnings: [...positionWarnings, ...truthWarnings],
    });

    return {
      generatedAt: new Date().toISOString(),
      informationalOnlyDisclaimer: DISCLAIMER,
      sourceStatus: summary.sourceStatus,
      summary,
    };
  } catch {
    const summary = buildPortfolioPersistenceSummary({
      positions: [],
      warnings: [
        {
          id: "persistence-unavailable",
          message:
            "Portfolio persistence readback is unavailable; existing Workspace fallbacks remain preserved.",
          sourceName: "portfolio-persistence-service",
          sourceStatus: "unavailable",
        },
      ],
    });

    return {
      generatedAt: new Date().toISOString(),
      informationalOnlyDisclaimer: DISCLAIMER,
      sourceStatus: summary.sourceStatus,
      summary,
    };
  }
}

export async function getWorkspacePortfolioPersistenceSummary() {
  return getPortfolioPersistenceSummary();
}
