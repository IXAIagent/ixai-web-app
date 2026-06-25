export type WorkspacePlanTier = "free" | "pro" | "team" | "enterprise";

export interface WorkspacePlanReadiness {
  currentTier: WorkspacePlanTier;
  enforcementEnabled: false;
  note: string;
  sourceStatus: "placeholder";
}

export function getWorkspacePlanReadiness(): WorkspacePlanReadiness {
  return {
    currentTier: "free",
    enforcementEnabled: false,
    note: "Workspace plan metadata is readiness-only in V20; no billing provider or entitlement enforcement is connected.",
    sourceStatus: "placeholder",
  };
}
