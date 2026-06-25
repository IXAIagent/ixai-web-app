import type { SaasReadinessItem } from "@/src/lib/saas-foundation/saas-types";

export function getUsageReadiness(): SaasReadinessItem {
  return {
    label: "Usage Metering",
    note: "Usage metering contracts are planned; no counters or billing writes are active.",
    status: "planned",
  };
}
