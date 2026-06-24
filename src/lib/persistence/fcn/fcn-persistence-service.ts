"use client";

import { listPersistentFcnPositions } from "@/src/lib/persistence/fcn/fcn-persistence-repository";
import { getLiveFcnPersistenceReadback } from "@/src/lib/persistence/fcn/fcn-live-service";
import type {
  FcnPersistenceReadback,
  FcnPersistenceReadiness,
} from "@/src/lib/persistence/fcn/fcn-persistence-types";
import { loadFcnDrafts } from "@/src/lib/portfolio/input/fcn-draft-store";
import {
  getDatabaseReadPriorityMetadata,
  hasArrayData,
  resolveDatabaseReadPriority,
} from "@/src/lib/workspace/database-read-priority";
import type { FCNPosition } from "@/src/types/fcn-position";

export async function getPersistentFcnReadback(): Promise<FcnPersistenceReadback> {
  try {
    const drafts = loadFcnDrafts();
    const priority = await resolveDatabaseReadPriority<FCNPosition[]>({
      database: {
        emptyData: [],
        hasData: hasArrayData,
        isDatabaseReady: (positions) => positions.length > 0,
        read: async () => {
          const readback = await getLiveFcnPersistenceReadback();
          return readback.positions;
        },
      },
      local: {
        emptyData: [],
        hasData: () => drafts.length > 0,
        read: () => [],
      },
      truth: {
        emptyData: [],
        hasData: hasArrayData,
        read: async () => {
          const { positions } = await listPersistentFcnPositions();
          return positions;
        },
      },
    });

    return {
      drafts,
      generatedAt: new Date().toISOString(),
      persistedPositions: priority.data,
      readPriority: getDatabaseReadPriorityMetadata(priority),
      sourceStatus:
        priority.source === "database"
          ? "persisted"
          : priority.source === "truth"
            ? "fallback"
            : drafts.length > 0
            ? "local"
            : priority.source === "error"
              ? "error"
              : "unavailable",
      warnings: [
        `V10 read priority source: ${priority.source}; fallback active: ${priority.fallbackUsed ? "yes" : "no"}; database ready: ${priority.isDatabaseReady ? "yes" : "no"}.`,
        ...(priority.errorMessage ? [priority.errorMessage] : []),
      ],
    };
  } catch {
    return {
      drafts: [],
      generatedAt: new Date().toISOString(),
      persistedPositions: [],
      sourceStatus: "error",
      warnings: ["FCN persistence foundation failed safely."],
    };
  }
}

export async function getFcnPersistenceReadiness(): Promise<FcnPersistenceReadiness> {
  const readback = await getPersistentFcnReadback();

  return {
    draftCount: readback.drafts.length,
    generatedAt: new Date().toISOString(),
    persistedPositionCount: readback.persistedPositions.length,
    readPriority: readback.readPriority,
    sourceStatus: readback.sourceStatus,
    summary:
      "FCN persistence foundation preserves existing /api/fcn readback and local FCN draft fallback. Coupon schedule tables remain schema drafts only.",
    warnings: readback.warnings,
  };
}
