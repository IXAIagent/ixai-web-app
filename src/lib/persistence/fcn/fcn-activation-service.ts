import { checkFcnTablesReadiness } from "@/src/lib/persistence/fcn/fcn-database-adapter";

export async function getFcnDatabaseActivationReadiness() {
  const readiness = await checkFcnTablesReadiness();

  return {
    ...readiness,
    migrationStatus: "draft_only" as const,
    runtimeRequired: false,
    summary:
      "FCN database activation preserves /api/fcn and draft fallback; coupon schedule storage is optional until explicitly migrated.",
  };
}
