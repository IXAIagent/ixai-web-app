import { checkOwnershipTablesReadiness } from "@/src/lib/persistence/ownership/ownership-database-adapter";
import { getWorkspaceOwnershipStatus } from "@/src/lib/persistence/ownership/ownership-service";

export async function checkOwnershipActivationReadiness() {
  const [tables, ownership] = await Promise.all([
    checkOwnershipTablesReadiness(),
    Promise.resolve(getWorkspaceOwnershipStatus()),
  ]);

  return {
    ...tables,
    migrationStatus: "draft_only" as const,
    ownershipStatus: ownership.status,
    runtimeRequired: false,
    summary:
      "Ownership activation is readiness-only. Existing auth behavior and route protection are unchanged.",
  };
}
