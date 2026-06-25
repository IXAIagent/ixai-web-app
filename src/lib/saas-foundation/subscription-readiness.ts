import type { SaasReadinessItem } from "@/src/lib/saas-foundation/saas-types";

export function getSubscriptionReadiness(): SaasReadinessItem {
  return {
    label: "Subscription",
    note: "Billing provider and subscription enforcement are disabled in V20.",
    status: "disabled",
  };
}
