import { getAssetDiagnostics, getAssetGraph } from "@/src/lib/intelligence/assets";
import { runMonitoringRuleEngine } from "@/src/lib/intelligence/monitoring/monitoring-rule-engine";
import type {
  MonitoringEvent,
  MonitoringRuleContext,
  MonitoringServiceInput,
} from "@/src/lib/intelligence/monitoring/monitoring-types";

export function buildMonitoringEvents(input: MonitoringRuleContext): MonitoringEvent[] {
  return runMonitoringRuleEngine(input);
}

export function buildMonitoringEventContext(input: MonitoringServiceInput): MonitoringRuleContext {
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const assets = input.assets ?? [];

  return {
    assetDiagnostics: getAssetDiagnostics(assets),
    assetGraph: getAssetGraph(assets),
    assets,
    generatedAt,
    providerDiagnostics: input.providerDiagnostics ?? null,
  };
}
