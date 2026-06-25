import type { ProgramBSafetyFlags } from "@/src/lib/market-data/live-provider-readiness";

export type BrokerProviderId = "manual_placeholder" | "futu" | "ibkr";

export interface BrokerProviderConfig {
  id: BrokerProviderId;
  label: string;
  liveApiEnabled: false;
  status: "disabled" | "placeholder";
}

export interface BrokerAccountSnapshot {
  accountCount: number;
  asOf: string | null;
  sourceStatus: "placeholder";
}

export interface PositionSyncReadiness {
  fallbackAvailable: true;
  positionSyncEnabled: false;
  sourceStatus: "readiness_only";
}

export interface BrokerHealthDiagnostics {
  accountSnapshot: BrokerAccountSnapshot;
  generatedAt: string;
  phase: "V23_BROKER_INTEGRATION_FOUNDATION";
  providers: BrokerProviderConfig[];
  safetyFlags: ProgramBSafetyFlags;
  syncReadiness: PositionSyncReadiness;
}

export interface BrokerProvider {
  config: BrokerProviderConfig;
  getAccountSnapshot(): BrokerAccountSnapshot;
}
