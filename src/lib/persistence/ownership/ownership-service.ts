import type {
  WorkspaceOwnershipCheck,
  WorkspaceOwner,
} from "@/src/lib/persistence/ownership/ownership-types";

export function getWorkspaceOwnershipStatus(owner?: WorkspaceOwner | null): WorkspaceOwnershipCheck {
  const resolvedOwner = owner ?? null;

  return {
    generatedAt: new Date().toISOString(),
    owner: resolvedOwner,
    status: resolvedOwner?.id ? "allowed" : "limited",
    summary: resolvedOwner?.id
      ? "Workspace ownership context is available."
      : "Workspace ownership is limited because no server-safe authenticated owner context was provided.",
    warnings: resolvedOwner?.id
      ? []
      : [
          "V7.20 does not change auth behavior. Ownership checks remain conservative until existing session context is explicitly passed in.",
        ],
  };
}

export function canAccessWorkspaceResource(input?: {
  owner?: WorkspaceOwner | null;
  resourceOwnerId?: string | null;
}): WorkspaceOwnershipCheck {
  const owner = input?.owner ?? null;
  const resourceOwnerId = input?.resourceOwnerId ?? null;

  if (!owner?.id || !resourceOwnerId) {
    return getWorkspaceOwnershipStatus(owner);
  }

  return {
    generatedAt: new Date().toISOString(),
    owner,
    status: owner.id === resourceOwnerId ? "allowed" : "unknown",
    summary:
      owner.id === resourceOwnerId
        ? "Workspace resource owner matches current owner context."
        : "Workspace resource owner does not match current owner context.",
    warnings:
      owner.id === resourceOwnerId
        ? []
        : ["Access should remain denied unless a future authenticated service verifies ownership."],
  };
}
