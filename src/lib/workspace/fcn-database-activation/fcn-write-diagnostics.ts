"use client";

import type { V14FcnWriteDiagnostics } from "@/src/lib/workspace/fcn-database-activation/fcn-database-activation-types";
import { loadLastV14FcnWriteResult } from "@/src/lib/workspace/fcn-database-activation/fcn-position-write-service";
import { getV14FcnWriteReadiness } from "@/src/lib/workspace/fcn-database-activation/fcn-write-readiness";

export async function getV14FcnWriteDiagnostics(): Promise<V14FcnWriteDiagnostics> {
  const readiness = await getV14FcnWriteReadiness();

  return {
    checkedAt: new Date().toISOString(),
    lastWriteResult: loadLastV14FcnWriteResult(),
    phase: "v14.00_fcn_database_activation",
    readPriority: readiness.readPriority,
    readiness,
    summary:
      "FCN database writes are explicit-submit only, guarded by V12 global plus V14 FCN module guards, and preserve Draft Store / Truth Layer fallback.",
  };
}
