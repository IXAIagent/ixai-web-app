import type { FcnPersistenceReadback } from "@/src/lib/persistence/fcn/fcn-persistence-types";
import { readFcnPositionsFromDatabase } from "@/src/lib/persistence/fcn/fcn-database-adapter";
import type { FCNPosition } from "@/src/types/fcn-position";

export async function listPersistentFcnPositions(): Promise<{
  positions: FCNPosition[];
  warnings: string[];
}> {
  try {
    const databasePositions = await readFcnPositionsFromDatabase();

    if (databasePositions.length > 0) {
      return {
        positions: databasePositions,
        warnings: [],
      };
    }

    const response = await fetch("/api/fcn", { cache: "no-store" });

    if (!response.ok) {
      return {
        positions: [],
        warnings: [`/api/fcn returned ${response.status}; local FCN fallback remains available.`],
      };
    }

    const payload = await response.json();
    const positions = Array.isArray(payload?.positions)
      ? payload.positions
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : [];

    return {
      positions: positions as FCNPosition[],
      warnings: [],
    };
  } catch {
    return {
      positions: [],
      warnings: ["/api/fcn readback unavailable; local FCN drafts remain available."],
    };
  }
}

export function buildUnavailableFcnReadback(): FcnPersistenceReadback {
  return {
    drafts: [],
    generatedAt: new Date().toISOString(),
    persistedPositions: [],
    sourceStatus: "unavailable",
    warnings: ["FCN persistence readback is unavailable."],
  };
}
