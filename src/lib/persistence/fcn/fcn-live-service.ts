import {
  checkFcnTablesReadiness,
  readFcnCouponSchedulesFromDatabase,
  readFcnPositionsFromDatabase,
  readFcnUnderlyingsFromDatabase,
  upsertFcnCouponScheduleDraft,
  upsertFcnPositionDraft,
  upsertFcnUnderlyingDraft,
} from "@/src/lib/persistence/fcn/fcn-database-adapter";
import type { FcnCouponScheduleDatabaseRow } from "@/src/lib/persistence/fcn/fcn-database-types";
import type { FCNPosition, FCNUnderlying } from "@/src/types/fcn-position";

export interface FcnLivePersistenceReadback {
  couponSchedules: FcnCouponScheduleDatabaseRow[];
  generatedAt: string;
  positions: FCNPosition[];
  sourceStatus: "partial" | "persisted" | "unavailable";
  underlyings: FCNUnderlying[];
  warnings: string[];
}

export interface FcnLiveWriteResult {
  generatedAt: string;
  ok: boolean;
  sourceStatus: "partial" | "persisted" | "unavailable";
  warning: string;
}

async function guardedWrite(
  write: () => Promise<{ ok: boolean; warning: string }>,
  unavailableWarning: string,
): Promise<FcnLiveWriteResult> {
  try {
    const readiness = await checkFcnTablesReadiness();

    if (readiness.sourceStatus !== "ready") {
      return {
        generatedAt: new Date().toISOString(),
        ok: false,
        sourceStatus: readiness.sourceStatus === "partial" ? "partial" : "unavailable",
        warning: `${unavailableWarning} FCN tables are not fully ready; draft/API fallback remains primary.`,
      };
    }

    const result = await write();

    return {
      generatedAt: new Date().toISOString(),
      ok: result.ok,
      sourceStatus: result.ok ? "persisted" : "partial",
      warning: result.warning,
    };
  } catch {
    return {
      generatedAt: new Date().toISOString(),
      ok: false,
      sourceStatus: "unavailable",
      warning: `${unavailableWarning} Database write guard failed safely; FCN draft fallback remains active.`,
    };
  }
}

export async function readLiveFcnPositions(): Promise<FCNPosition[]> {
  try {
    return readFcnPositionsFromDatabase();
  } catch {
    return [];
  }
}

export async function readLiveFcnUnderlyings(): Promise<FCNUnderlying[]> {
  try {
    return readFcnUnderlyingsFromDatabase();
  } catch {
    return [];
  }
}

export async function readLiveFcnCouponSchedules(): Promise<FcnCouponScheduleDatabaseRow[]> {
  try {
    return readFcnCouponSchedulesFromDatabase();
  } catch {
    return [];
  }
}

export async function getLiveFcnPersistenceReadback(): Promise<FcnLivePersistenceReadback> {
  try {
    const [positions, underlyings, couponSchedules, readiness] = await Promise.all([
      readLiveFcnPositions(),
      readLiveFcnUnderlyings(),
      readLiveFcnCouponSchedules(),
      checkFcnTablesReadiness(),
    ]);
    const liveCount = positions.length + underlyings.length + couponSchedules.length;

    return {
      couponSchedules,
      generatedAt: new Date().toISOString(),
      positions,
      sourceStatus:
        liveCount > 0
          ? "persisted"
          : readiness.sourceStatus === "partial"
            ? "partial"
            : "unavailable",
      underlyings,
      warnings:
        liveCount > 0
          ? readiness.warnings
          : [
              "FCN live tables are empty or unavailable; /api/fcn and local draft fallback remain active.",
              ...readiness.warnings,
            ],
    };
  } catch {
    return {
      couponSchedules: [],
      generatedAt: new Date().toISOString(),
      positions: [],
      sourceStatus: "unavailable",
      underlyings: [],
      warnings: ["FCN live persistence readback failed safely; fallback remains active."],
    };
  }
}

export async function saveFcnPositionToDatabase(): Promise<FcnLiveWriteResult> {
  return guardedWrite(upsertFcnPositionDraft, "FCN position was not written to database.");
}

export async function saveFcnUnderlyingToDatabase(): Promise<FcnLiveWriteResult> {
  return guardedWrite(upsertFcnUnderlyingDraft, "FCN underlying was not written to database.");
}

export async function saveFcnCouponScheduleToDatabase(): Promise<FcnLiveWriteResult> {
  return guardedWrite(
    upsertFcnCouponScheduleDraft,
    "FCN coupon schedule was not written to database.",
  );
}

export async function getLiveFcnPersistenceReadiness() {
  const readback = await getLiveFcnPersistenceReadback();

  return {
    generatedAt: readback.generatedAt,
    liveCouponSchedules: readback.couponSchedules.length,
    livePositions: readback.positions.length,
    liveUnderlyings: readback.underlyings.length,
    sourceStatus: readback.sourceStatus,
    summary:
      "V9.20 FCN live persistence reads database FCN tables when available while preserving /api/fcn and local FCN draft fallback.",
    warnings: readback.warnings,
  };
}
