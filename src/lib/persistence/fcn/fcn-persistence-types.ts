import type { FCNDraftRecord } from "@/src/lib/portfolio/input/fcn-draft-store";
import type { FCNPosition } from "@/src/types/fcn-position";

export type FcnPersistenceSourceStatus =
  | "error"
  | "fallback"
  | "local"
  | "partial"
  | "persisted"
  | "unavailable";

export interface FcnPersistenceReadback {
  drafts: FCNDraftRecord[];
  generatedAt: string;
  persistedPositions: FCNPosition[];
  readPriority?: import("@/src/lib/workspace/database-read-priority").WorkspaceDatabaseReadPriorityMetadata;
  sourceStatus: FcnPersistenceSourceStatus;
  warnings: string[];
}

export interface FcnPersistenceReadiness {
  draftCount: number;
  generatedAt: string;
  persistedPositionCount: number;
  readPriority?: import("@/src/lib/workspace/database-read-priority").WorkspaceDatabaseReadPriorityMetadata;
  sourceStatus: FcnPersistenceSourceStatus;
  summary: string;
  warnings: string[];
}
