"use client";

import { loadPortfolioTruthReadback } from "@/src/lib/portfolio/truth/portfolio-truth-client";
import {
  normalizePersistedPosition,
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
import {
  readLiveCryptoPositions,
  readLivePortfolioPositions,
  readLiveStockPositions,
} from "@/src/lib/persistence/portfolio";
import {
  getDatabaseReadPriorityMetadata,
  hasArrayData,
  resolveDatabaseReadPriority,
} from "@/src/lib/workspace/database-read-priority";

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
    const priority = await resolveDatabaseReadPriority<PortfolioPersistedPosition[]>({
      database: {
        emptyData: [],
        hasData: hasArrayData,
        isDatabaseReady: (positions) => positions.length > 0,
        read: async () => {
          const [portfolio, stock, crypto] = await Promise.all([
            readLivePortfolioPositions(),
            readLiveStockPositions(),
            readLiveCryptoPositions(),
          ]);

          return [
            ...portfolio.positions,
            ...stock.positions,
            ...crypto.positions,
          ].map((position) =>
            normalizePersistedPosition({
              assetClass: position.assetClass,
              currency: position.currency,
              id: position.id,
              name: position.name,
              notionalAmount: position.notionalAmount,
              quantity: position.quantity,
              sourceName: "database-live-readback",
              sourceStatus: "persisted",
              symbol: position.symbol,
              updatedAt: position.updatedAt,
            }),
          );
        },
      },
      local: {
        emptyData: [],
        hasData: hasArrayData,
        read: () => [...readLocalDraftPositions(), ...readFallbackRecentInputs()],
      },
      truth: {
        emptyData: [],
        hasData: hasArrayData,
        read: async () => {
          const truth = await loadPortfolioTruthReadback();
          const [stockPositions, cryptoPositions, fcnPositions] = await Promise.all([
            readPersistedStockPositions(truth),
            readPersistedCryptoPositions(truth),
            readPersistedFcnPositions(truth),
          ]);

          return [...stockPositions, ...cryptoPositions, ...fcnPositions];
        },
      },
    });
    const positions = dedupePositions(priority.data);
    const positionWarnings = positions
      .map(warningFromPosition)
      .filter((warning): warning is PortfolioPersistenceWarning => Boolean(warning));
    const priorityWarnings: PortfolioPersistenceWarning[] = [
      {
        id: "v10-read-priority",
        message: `V10 read priority source: ${priority.source}; fallback active: ${priority.fallbackUsed ? "yes" : "no"}; database ready: ${priority.isDatabaseReady ? "yes" : "no"}.`,
        sourceName: "database-read-priority",
        sourceStatus: priority.fallbackUsed ? "partial" : positions.length > 0 ? "persisted" : "unavailable",
      },
      ...(priority.errorMessage
        ? [
            {
              id: "v10-read-priority-error",
              message: priority.errorMessage,
              sourceName: "database-read-priority",
              sourceStatus: "partial" as const,
            },
          ]
        : []),
    ];
    const summary = buildPortfolioPersistenceSummary({
      positions,
      warnings: [...positionWarnings, ...priorityWarnings],
    });

    return {
      generatedAt: new Date().toISOString(),
      informationalOnlyDisclaimer: DISCLAIMER,
      readPriority: getDatabaseReadPriorityMetadata(priority),
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
