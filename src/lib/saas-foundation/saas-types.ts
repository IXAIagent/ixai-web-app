export type SaasReadinessStatus = "ready" | "planned" | "disabled";

export interface SaasReadinessItem {
  label: string;
  note: string;
  status: SaasReadinessStatus;
}

export interface SaasFoundationDiagnostics {
  authChangesEnabled: false;
  billingProviderEnabled: false;
  generatedAt: string;
  phase: "V20_SAAS_FOUNDATION_READINESS";
  readOnly: true;
  schemaChangesEnabled: false;
  subscriptionEnforcementEnabled: false;
  teamManagementEnabled: false;
  usageMeteringEnabled: false;
}

export interface SaasFoundationReadiness {
  diagnostics: SaasFoundationDiagnostics;
  items: SaasReadinessItem[];
  limitations: string[];
  sourceStatus: "readiness_only";
}
