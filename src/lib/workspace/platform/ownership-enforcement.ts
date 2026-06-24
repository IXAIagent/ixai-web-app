import {
  buildUserScopedQuery,
  getCurrentWorkspaceOwner,
} from "@/src/lib/persistence/ownership";
import type { WorkspaceOwner } from "@/src/lib/persistence/ownership";
import type {
  WorkspaceAccessEvaluation,
  WorkspacePermissionMetadata,
  WorkspacePlatformRole,
  WorkspaceScopedQueryMetadata,
} from "@/src/lib/workspace/platform/platform-types";

const ROLE_PERMISSIONS: Record<
  WorkspacePlatformRole,
  Pick<WorkspaceAccessEvaluation, "canManage" | "canRead" | "canWrite">
> = {
  admin: { canManage: true, canRead: true, canWrite: true },
  editor: { canManage: false, canRead: true, canWrite: true },
  owner: { canManage: true, canRead: true, canWrite: true },
  viewer: { canManage: false, canRead: true, canWrite: false },
};

function normalizeRole(role?: string | null): WorkspacePlatformRole | "unknown" {
  if (role === "owner" || role === "admin" || role === "editor" || role === "viewer") {
    return role;
  }

  return "unknown";
}

export function evaluateWorkspaceAccess(input?: {
  owner?: WorkspaceOwner | null;
  requestedRole?: string | null;
}): WorkspaceAccessEvaluation {
  const owner = getCurrentWorkspaceOwner(input?.owner ?? null);
  const normalizedRole = normalizeRole(input?.requestedRole);
  const role = normalizedRole === "unknown" && owner?.id ? "owner" : normalizedRole;
  const permissions = role === "unknown" ? null : ROLE_PERMISSIONS[role];

  if (!owner?.id) {
    return {
      canManage: false,
      canRead: true,
      canWrite: false,
      checkedAt: new Date().toISOString(),
      fallbackUsed: true,
      reason:
        "No authenticated workspace owner context was provided. Existing single-user fallback remains readable, while writes stay guarded.",
      role,
      source: "owner_fallback",
    };
  }

  return {
    canManage: permissions?.canManage ?? false,
    canRead: permissions?.canRead ?? true,
    canWrite: permissions?.canWrite ?? false,
    checkedAt: new Date().toISOString(),
    fallbackUsed: normalizedRole === "unknown",
    reason:
      normalizedRole === "unknown"
        ? "Membership table is not required yet; owner fallback grants conservative current-user access."
        : "Workspace access was evaluated from role metadata.",
    role,
    source: normalizedRole === "unknown" ? "owner_fallback" : "membership",
  };
}

export function buildWorkspaceScopedQueryMetadata(input?: {
  owner?: WorkspaceOwner | null;
  userColumn?: "owner_id" | "user_id";
}): WorkspaceScopedQueryMetadata {
  const scoped = buildUserScopedQuery(input);

  return {
    canScope: scoped.canScope,
    checkedAt: new Date().toISOString(),
    ownerId: scoped.owner?.id,
    reason: scoped.canScope
      ? `Future database query can be scoped by ${input?.userColumn ?? "user_id"}.`
      : "No owner context is available; database query scoping remains unavailable and fallback-safe.",
    userColumn: input?.userColumn ?? "user_id",
  };
}

export function getWorkspacePermissionMetadata(): WorkspacePermissionMetadata {
  return {
    checkedAt: new Date().toISOString(),
    supportedRoles: ["owner", "admin", "editor", "viewer"],
    summary:
      "V10.20 defines conservative role metadata for future workspace membership enforcement without changing auth, redirects, or RLS.",
    warnings: [
      "Membership-backed enforcement remains diagnostic until tables and auth context are explicitly connected.",
    ],
  };
}
