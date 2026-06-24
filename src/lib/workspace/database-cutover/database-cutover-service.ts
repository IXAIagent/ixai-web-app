import { getV11ControlledWriteStatus } from "@/src/lib/workspace/database-cutover/controlled-write-service";
import { getV11RemoteMigrationReadiness } from "@/src/lib/workspace/database-cutover/migration-readiness-service";
import type { V11DatabaseCutoverStatus } from "@/src/lib/workspace/database-cutover/database-cutover-types";

export async function getV11DatabaseCutoverStatus(): Promise<V11DatabaseCutoverStatus> {
  const [controlledWrite, migrationReadiness] = await Promise.all([
    getV11ControlledWriteStatus(),
    Promise.resolve(getV11RemoteMigrationReadiness()),
  ]);

  return {
    checkedAt: new Date().toISOString(),
    controlledWrite,
    migrationReadiness,
    phase: "v11_database_cutover_program",
    summary:
      "V11 Database Cutover adds controlled write activation readiness and remote migration review without executing migrations or disabling fallbacks.",
  };
}
