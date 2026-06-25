"use client";

import { getFcnDatabaseActivationReadiness } from "@/src/lib/persistence/fcn";
import type { V14FcnWriteReadiness } from "@/src/lib/workspace/fcn-database-activation/fcn-database-activation-types";
import { getV14FcnWriteGuardSet } from "@/src/lib/workspace/fcn-database-activation/fcn-database-activation-guards";

function isReady(status?: string) {
  return status === "ready" || status === "partial" || status === "persisted";
}

export async function getV14FcnWriteReadiness(): Promise<V14FcnWriteReadiness> {
  const guardSet = getV14FcnWriteGuardSet();
  const fcnReadiness = await getFcnDatabaseActivationReadiness().catch(() => null);
  const databaseReady = isReady(fcnReadiness?.sourceStatus);

  return {
    checkedAt: new Date().toISOString(),
    databaseReady,
    fallbackEnabled: guardSet.fcnFallbackEnabled,
    guardSet,
    phase: "v14.00_fcn_database_activation",
    readPriority: ["database", "truth", "draft_store", "legacy_recent", "empty"],
    safeNextAction:
      "Keep V14 FCN guards disabled until staging validates FCN position and underlying writes plus observation schedule payload safety; independent coupon schedule table writes remain readiness-only.",
    scheduleTableWriteMode: guardSet.fcnScheduleDatabaseWriteEnabled.enabled
      ? "guarded"
      : "readiness_only",
    summary:
      "V14.00 adds guarded FCN database write readiness after local Draft Store and Input Truth Bridge fallback complete. Drafts with schedules skip DB write unless the V14 schedule guard is enabled.",
    tableStatus: {
      fcnCouponSchedules: fcnReadiness?.sourceStatus ?? "unknown",
      fcnPositions: fcnReadiness?.sourceStatus ?? "unknown",
      fcnUnderlyings: fcnReadiness?.sourceStatus ?? "unknown",
    },
  };
}
