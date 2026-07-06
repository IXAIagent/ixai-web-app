import {
  getAssetGraph,
  getAssetIntelligence,
} from "@/src/lib/intelligence/assets";
import { buildMonitoringEventContext, buildMonitoringEvents } from "@/src/lib/intelligence/monitoring/monitoring-event-engine";
import { buildMonitoringDiagnostics } from "@/src/lib/intelligence/monitoring/monitoring-diagnostics";
import { buildMonitoringTimeline } from "@/src/lib/intelligence/monitoring/monitoring-timeline";
import { buildTodayFocus } from "@/src/lib/intelligence/monitoring/today-focus-engine";
import type {
  MonitoringDiagnostics,
  MonitoringEvent,
  MonitoringServiceInput,
  MonitoringServiceResult,
  MonitoringTimeline,
  TodayFocusItem,
} from "@/src/lib/intelligence/monitoring/monitoring-types";

function resolveAssets(input: MonitoringServiceInput) {
  return input.assets ?? getAssetIntelligence(input);
}

export function getMonitoringEvents(input: MonitoringServiceInput = {}): MonitoringEvent[] {
  const assets = resolveAssets(input);
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const context = buildMonitoringEventContext({
    ...input,
    assets,
    generatedAt,
  });

  return buildMonitoringEvents({
    ...context,
    assetGraph: getAssetGraph(assets),
  });
}

export function getTodayFocus(input: MonitoringServiceInput = {}): TodayFocusItem[] {
  return buildTodayFocus(getMonitoringEvents(input));
}

export function getMonitoringTimeline(input: MonitoringServiceInput = {}): MonitoringTimeline {
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  return buildMonitoringTimeline(getMonitoringEvents({ ...input, generatedAt }), generatedAt);
}

export function getMonitoringDiagnostics(input: MonitoringServiceInput = {}): MonitoringDiagnostics {
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const assets = resolveAssets(input);
  const events = getMonitoringEvents({ ...input, assets, generatedAt });

  return buildMonitoringDiagnostics(events, assets, generatedAt);
}

export function getMonitoringService(input: MonitoringServiceInput = {}): MonitoringServiceResult {
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const assets = resolveAssets(input);
  const events = getMonitoringEvents({ ...input, assets, generatedAt });

  return {
    diagnostics: buildMonitoringDiagnostics(events, assets, generatedAt),
    events,
    timeline: buildMonitoringTimeline(events, generatedAt),
    todayFocus: buildTodayFocus(events),
  };
}
