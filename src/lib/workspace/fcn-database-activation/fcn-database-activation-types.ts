import type { FCNDraftRecord } from "@/src/lib/portfolio/input/fcn-draft-store";

export type V14FcnWriteModule =
  | "fcn"
  | "fcn_position"
  | "fcn_schedule"
  | "fcn_underlying";

export type V14FcnWriteGuardSource =
  | "default_disabled"
  | "environment"
  | "readiness_only";

export type V14FcnWriteStatus =
  | "disabled"
  | "failed"
  | "fallback"
  | "ready"
  | "skipped"
  | "succeeded";

export type V14FcnWriteTarget = "database" | "fallback" | "skipped";

export type V14FcnReadSource =
  | "database"
  | "draft_store"
  | "empty"
  | "legacy_recent"
  | "truth";

export interface V14FcnWriteGuard {
  checkedAt: string;
  enabled: boolean;
  module: V14FcnWriteModule;
  reason: string;
  source: V14FcnWriteGuardSource;
}

export interface V14FcnWriteGuardSet {
  checkedAt: string;
  diagnosticsReadOnly: boolean;
  fcnDatabaseWriteEnabled: V14FcnWriteGuard;
  fcnFallbackEnabled: boolean;
  fcnPositionDatabaseWriteEnabled: V14FcnWriteGuard;
  fcnScheduleDatabaseWriteEnabled: V14FcnWriteGuard;
  fcnUnderlyingDatabaseWriteEnabled: V14FcnWriteGuard;
  v12GlobalGuardEnabled: boolean;
}

export interface V14FcnWriteResult {
  checkedAt: string;
  databaseAttempted: boolean;
  errorMessage?: string;
  fallbackUsed: boolean;
  guard: V14FcnWriteGuard;
  module: V14FcnWriteModule;
  operation:
    | "create_fcn_position"
    | "create_fcn_underlyings"
    | "readiness_check"
    | "write_observation_schedule";
  portfolioId?: string;
  positionId?: string;
  scheduleCount?: number;
  sourceAction: string;
  status: V14FcnWriteStatus;
  target: V14FcnWriteTarget;
  underlyingCount?: number;
}

export interface V14FcnWriteReadiness {
  checkedAt: string;
  databaseReady: boolean;
  fallbackEnabled: boolean;
  guardSet: V14FcnWriteGuardSet;
  phase: "v14.00_fcn_database_activation";
  readPriority: V14FcnReadSource[];
  safeNextAction: string;
  scheduleTableWriteMode: "readiness_only" | "guarded";
  summary: string;
  tableStatus: {
    fcnCouponSchedules: string;
    fcnPositions: string;
    fcnUnderlyings: string;
  };
}

export interface V14FcnWriteDiagnostics {
  checkedAt: string;
  lastWriteResult: V14FcnWriteResult | null;
  phase: "v14.00_fcn_database_activation";
  readPriority: V14FcnReadSource[];
  readiness: V14FcnWriteReadiness;
  summary: string;
}

export interface V14FcnDraftWriteInput {
  draft: FCNDraftRecord;
  sourceAction?: string;
}
