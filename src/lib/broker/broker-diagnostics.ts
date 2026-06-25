import { programBSafetyFlags } from "@/src/lib/market-data/live-provider-readiness";
import type {
  BrokerAccountSnapshot,
  BrokerHealthDiagnostics,
  BrokerProvider,
} from "@/src/lib/broker/broker-types";

export const manualBrokerProvider: BrokerProvider = {
  config: {
    id: "manual_placeholder",
    label: "Manual Broker Placeholder",
    liveApiEnabled: false,
    status: "placeholder",
  },
  getAccountSnapshot(): BrokerAccountSnapshot {
    return {
      accountCount: 0,
      asOf: null,
      sourceStatus: "placeholder",
    };
  },
};

export function buildBrokerHealthDiagnostics(): BrokerHealthDiagnostics {
  return {
    accountSnapshot: manualBrokerProvider.getAccountSnapshot(),
    generatedAt: new Date().toISOString(),
    phase: "V23_BROKER_INTEGRATION_FOUNDATION",
    providers: [
      manualBrokerProvider.config,
      {
        id: "futu",
        label: "Futu",
        liveApiEnabled: false,
        status: "disabled",
      },
      {
        id: "ibkr",
        label: "Interactive Brokers",
        liveApiEnabled: false,
        status: "disabled",
      },
    ],
    safetyFlags: programBSafetyFlags,
    syncReadiness: {
      fallbackAvailable: true,
      positionSyncEnabled: false,
      sourceStatus: "readiness_only",
    },
  };
}
