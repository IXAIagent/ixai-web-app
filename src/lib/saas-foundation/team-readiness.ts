import type { SaasReadinessItem } from "@/src/lib/saas-foundation/saas-types";

export function getTeamReadiness(): SaasReadinessItem {
  return {
    label: "Team Workspace",
    note: "Team management is readiness-only; no membership behavior changes are enabled.",
    status: "planned",
  };
}
