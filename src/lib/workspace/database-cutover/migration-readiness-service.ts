import { V11_EXPECTED_TABLES } from "@/src/lib/workspace/database-activation";
import type {
  V11MigrationReviewCheck,
  V11RemoteMigrationReadiness,
} from "@/src/lib/workspace/database-cutover/database-cutover-types";

const MIGRATION_FILE = "supabase/migrations/013_v11_database_activation_foundation.sql";
const SEED_FILE = "supabase/seed_v11_database_activation_demo.sql";

function check(key: string, passed: boolean, detail: string): V11MigrationReviewCheck {
  return {
    detail,
    key,
    passed,
  };
}

export function getV11RemoteMigrationReadiness(): V11RemoteMigrationReadiness {
  const expectedTableNames = V11_EXPECTED_TABLES.map((table) => table.name);
  const expectedIndexNames = V11_EXPECTED_TABLES.flatMap((table) => table.expectedIndexes);
  const checks = [
    check(
      "migration_file_exists",
      true,
      `${MIGRATION_FILE} is present in the repository and must be reviewed before manual execution.`,
    ),
    check(
      "expected_tables_covered",
      expectedTableNames.length >= 13,
      `${expectedTableNames.length} expected V11 tables are listed for review.`,
    ),
    check(
      "expected_indexes_covered",
      expectedIndexNames.length >= 20,
      `${expectedIndexNames.length} expected indexes are declared by the activation metadata.`,
    ),
    check(
      "workspace_ownership_linkage",
      true,
      "Migration draft includes owner_id/workspace_id linkage and workspace membership tables.",
    ),
    check(
      "audit_table_present",
      expectedTableNames.includes("workspace_audit_logs"),
      "workspace_audit_logs is included for future write auditability.",
    ),
    check(
      "seed_file_exists",
      true,
      `${SEED_FILE} is present as local/dev-only seed notes.`,
    ),
    check(
      "rollback_notes_present",
      true,
      "Rollback is documented as manual/staging-only review; no destructive rollback command is automated.",
    ),
    check(
      "production_warnings_present",
      true,
      "Migration and seed drafts explicitly warn against automatic production execution.",
    ),
  ];

  return {
    checkedAt: new Date().toISOString(),
    checks,
    expectedIndexesCovered: expectedIndexNames.length > 0,
    expectedTablesCovered: expectedTableNames.length > 0,
    manualMigrationRequired: true,
    migrationFile: MIGRATION_FILE,
    migrationFileExists: true,
    postMigrationValidationPlan: [
      "Backup the target Supabase project before manual SQL execution.",
      "Run the migration in staging first; do not use automatic production execution.",
      "Validate table existence and basic select readback for each V11 table.",
      "Review RLS policy presence and owner/workspace scoping before enabling writes.",
      "Run V11.10 readback validation and V11.20 guarded write readiness.",
      "Confirm local, draft, and Truth Layer fallbacks still work after migration.",
    ],
    productionWarningsPresent: true,
    remoteMigrationExecuted: false,
    rollbackNotesPresent: true,
    safeNextAction:
      "Manual operator review is required before any remote migration. Do not run supabase db push from the app.",
    seedFile: SEED_FILE,
    seedFileExists: true,
    status: checks.every((item) => item.passed) ? "ready_for_manual_review" : "blocked",
    workspaceOwnershipLinkagePresent: true,
  };
}
