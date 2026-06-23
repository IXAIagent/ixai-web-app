import { checkAlertTablesReadiness } from "@/src/lib/alerts/persistence/alert-database-adapter";

export async function getAlertDatabaseActivationReadiness() {
  const readiness = await checkAlertTablesReadiness();

  return {
    ...readiness,
    migrationStatus: "draft_only" as const,
    runtimeRequired: false,
    summary:
      "Alert history database activation is optional. Deterministic Alert Engine output remains active when alert_events is missing.",
  };
}
