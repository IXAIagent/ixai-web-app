import { checkOwnershipActivationReadiness } from "@/src/lib/persistence/ownership";
import type { WorkspaceOwner } from "@/src/lib/persistence/ownership";
import type {
  WorkspaceMembershipReadiness,
  WorkspaceMembershipRecord,
} from "@/src/lib/workspace/platform/platform-types";

export async function getWorkspaceMembershipReadiness(input?: {
  owner?: WorkspaceOwner | null;
}): Promise<WorkspaceMembershipReadiness> {
  try {
    const ownership = await checkOwnershipActivationReadiness();
    const members: WorkspaceMembershipRecord[] = input?.owner?.id
      ? [
          {
            id: `owner-${input.owner.id}`,
            role: "owner",
            source: "owner_fallback",
            userId: input.owner.id,
            workspaceId: "single-owner-workspace",
          },
        ]
      : [];

    return {
      checkedAt: new Date().toISOString(),
      fallbackUsed: ownership.sourceStatus !== "ready",
      members,
      sourceStatus: ownership.sourceStatus === "ready" ? "ready" : "guarded",
      summary:
        "V10.40 adds workspace membership readiness without requiring membership tables. Current single-owner workspace behavior remains usable.",
      warnings: [
        ...ownership.warnings,
        "Full membership management UI is not implemented in V10.40.",
      ],
    };
  } catch {
    return {
      checkedAt: new Date().toISOString(),
      fallbackUsed: true,
      members: [],
      sourceStatus: "unavailable",
      summary: "Workspace membership readiness failed safely.",
      warnings: ["Membership tables are optional; single-owner fallback remains active."],
    };
  }
}
