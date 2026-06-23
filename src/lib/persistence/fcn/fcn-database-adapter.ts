import {
  readDatabaseTable,
  summarizeTableStatuses,
} from "@/src/lib/persistence/database-activation-utils";
import type {
  FcnCouponScheduleDatabaseRow,
  FcnDatabaseTableReadiness,
} from "@/src/lib/persistence/fcn/fcn-database-types";
import type { FCNPosition, FCNUnderlying } from "@/src/types/fcn-position";

export async function readFcnPositionsFromDatabase(): Promise<FCNPosition[]> {
  const result = await readDatabaseTable<FCNPosition>("fcn_positions");
  return result.rows;
}

export async function readFcnUnderlyingsFromDatabase(): Promise<FCNUnderlying[]> {
  const result = await readDatabaseTable<FCNUnderlying>("fcn_underlyings");
  return result.rows;
}

export async function readFcnCouponSchedulesFromDatabase(): Promise<FcnCouponScheduleDatabaseRow[]> {
  const result = await readDatabaseTable<FcnCouponScheduleDatabaseRow>("fcn_coupon_schedules");
  return result.rows;
}

export async function upsertFcnPositionDraft() {
  return { ok: false, warning: "FCN position database writes are disabled by default in V8.20." };
}

export async function upsertFcnUnderlyingDraft() {
  return { ok: false, warning: "FCN underlying database writes are disabled by default in V8.20." };
}

export async function upsertFcnCouponScheduleDraft() {
  return { ok: false, warning: "FCN coupon schedule database writes are disabled by default in V8.20." };
}

export async function checkFcnTablesReadiness(): Promise<FcnDatabaseTableReadiness> {
  const tables = await Promise.all([
    readDatabaseTable<unknown>("fcn_positions", "id"),
    readDatabaseTable<unknown>("fcn_underlyings", "id"),
    readDatabaseTable<unknown>("fcn_coupon_schedules", "id"),
  ]);
  const summary = summarizeTableStatuses(tables);

  return {
    generatedAt: new Date().toISOString(),
    sourceStatus: summary.sourceStatus,
    tables: tables.map((table) => ({
      name: table.table as "fcn_coupon_schedules" | "fcn_positions" | "fcn_underlyings",
      status: table.status,
      warnings: table.warnings,
    })),
    warnings: tables.flatMap((table) => table.warnings),
  };
}
