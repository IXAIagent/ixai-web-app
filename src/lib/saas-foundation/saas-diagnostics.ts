import { getSubscriptionReadiness } from "@/src/lib/saas-foundation/subscription-readiness";
import { getTeamReadiness } from "@/src/lib/saas-foundation/team-readiness";
import { getUsageReadiness } from "@/src/lib/saas-foundation/usage-readiness";
import type {
  SaasFoundationDiagnostics,
  SaasFoundationReadiness,
} from "@/src/lib/saas-foundation/saas-types";

export function buildSaasFoundationDiagnostics(): SaasFoundationDiagnostics {
  return {
    authChangesEnabled: false,
    billingProviderEnabled: false,
    generatedAt: new Date().toISOString(),
    phase: "V20_SAAS_FOUNDATION_READINESS",
    readOnly: true,
    schemaChangesEnabled: false,
    subscriptionEnforcementEnabled: false,
    teamManagementEnabled: false,
    usageMeteringEnabled: false,
  };
}

export function getSaasFoundationReadiness(): SaasFoundationReadiness {
  return {
    diagnostics: buildSaasFoundationDiagnostics(),
    items: [
      getSubscriptionReadiness(),
      getUsageReadiness(),
      getTeamReadiness(),
    ],
    limitations: [
      "No Stripe, billing provider, payment flow, entitlement enforcement, or team management is enabled.",
      "No auth, schema, RLS, migration, or membership behavior changes are included.",
    ],
    sourceStatus: "readiness_only",
  };
}
