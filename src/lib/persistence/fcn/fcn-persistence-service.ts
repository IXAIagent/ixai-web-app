"use client";

import { listPersistentFcnPositions } from "@/src/lib/persistence/fcn/fcn-persistence-repository";
import type {
  FcnPersistenceReadback,
  FcnPersistenceReadiness,
} from "@/src/lib/persistence/fcn/fcn-persistence-types";
import { loadFcnDrafts } from "@/src/lib/portfolio/input/fcn-draft-store";

export async function getPersistentFcnReadback(): Promise<FcnPersistenceReadback> {
  try {
    const [{ positions, warnings }, drafts] = await Promise.all([
      listPersistentFcnPositions(),
      Promise.resolve(loadFcnDrafts()),
    ]);

    return {
      drafts,
      generatedAt: new Date().toISOString(),
      persistedPositions: positions,
      sourceStatus:
        positions.length > 0
          ? "persisted"
          : drafts.length > 0
            ? "local"
            : warnings.length > 0
              ? "fallback"
              : "unavailable",
      warnings,
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
    sourceStatus: readback.sourceStatus,
    summary:
      "FCN persistence foundation preserves existing /api/fcn readback and local FCN draft fallback. Coupon schedule tables remain schema drafts only.",
    warnings: readback.warnings,
  };
}
