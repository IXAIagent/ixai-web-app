export type OwnershipSourceStatus =
  | "authenticated"
  | "limited"
  | "unavailable";

export type WorkspaceOwnershipStatus =
  | "allowed"
  | "limited"
  | "unknown";

export interface WorkspaceOwner {
  email?: string;
  id?: string;
  sourceStatus: OwnershipSourceStatus;
}

export interface WorkspaceOwnershipCheck {
  generatedAt: string;
  owner: WorkspaceOwner | null;
  status: WorkspaceOwnershipStatus;
  summary: string;
  warnings: string[];
}

export interface WorkspaceReadAccessAssertion extends WorkspaceOwnershipCheck {
  canRead: boolean;
}

export interface UserScopedQuery {
  canScope: boolean;
  owner: WorkspaceOwner | null;
  query: Record<string, string>;
  warnings: string[];
}
