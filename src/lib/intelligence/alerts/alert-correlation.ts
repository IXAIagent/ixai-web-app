import {
  compareAlerts,
  notificationPriorityFromAlert,
  severityFromAlertCandidate,
} from "@/src/lib/intelligence/alerts/alert-priority";
import type {
  IntelligenceAlert,
  IntelligenceAlertCandidate,
} from "@/src/lib/intelligence/alerts/alert-types";

function stableSegment(values: string[]) {
  return values
    .filter(Boolean)
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
    .toSorted()
    .join("-");
}

export function buildAlertCorrelationKey(candidate: IntelligenceAlertCandidate) {
  const symbolKey = stableSegment(candidate.affectedSymbols);
  const fcnKey = stableSegment(candidate.affectedFcnIds);
  const assetKey = stableSegment(candidate.affectedAssetIds);
  const subject = symbolKey || fcnKey || assetKey || candidate.type;
  return `${candidate.ruleFamily}:${subject}`;
}

export function buildAlertDedupeKey(candidate: IntelligenceAlertCandidate) {
  return `${candidate.ruleFamily}:${candidate.type}:${buildAlertCorrelationKey(candidate)}`;
}

export function buildAlertCooldownKey(candidate: IntelligenceAlertCandidate) {
  return `alert:${candidate.ruleFamily}:${buildAlertCorrelationKey(candidate)}`;
}

function mergeCandidates(current: IntelligenceAlertCandidate, next: IntelligenceAlertCandidate): IntelligenceAlertCandidate {
  const preferred = next.confidence > current.confidence ? next : current;
  const titles = [current.title, next.title].filter(Boolean);
  const summaries = [current.summary, next.summary].filter(Boolean);
  const why = [current.whyItMatters, next.whyItMatters].filter(Boolean);
  const monitor = [current.whatToMonitor, next.whatToMonitor].filter(Boolean);

  return {
    ...preferred,
    affectedAssetIds: Array.from(new Set([...current.affectedAssetIds, ...next.affectedAssetIds])).toSorted(),
    affectedFcnIds: Array.from(new Set([...current.affectedFcnIds, ...next.affectedFcnIds])).toSorted(),
    affectedSymbols: Array.from(new Set([...current.affectedSymbols, ...next.affectedSymbols])).toSorted(),
    confidence: Math.max(current.confidence, next.confidence),
    id: stableAlertId(preferred),
    itemIds: Array.from(new Set([...current.itemIds, ...next.itemIds])).toSorted(),
    sourceDomains: Array.from(new Set([...current.sourceDomains, ...next.sourceDomains])).toSorted(),
    summary: summaries[0] ?? preferred.summary,
    title: titles[0] ?? preferred.title,
    whatToMonitor: monitor[0] ?? preferred.whatToMonitor,
    whyItMatters: why[0] ?? preferred.whyItMatters,
  };
}

function stableAlertId(candidate: IntelligenceAlertCandidate) {
  return `alert:${buildAlertDedupeKey(candidate)}`
    .toLowerCase()
    .replace(/[^a-z0-9:]+/g, "-")
    .replace(/-$/g, "");
}

export function correlateAlertCandidates(candidates: IntelligenceAlertCandidate[]): IntelligenceAlert[] {
  const correlated = new Map<string, IntelligenceAlertCandidate>();

  for (const candidate of candidates) {
    const key = buildAlertDedupeKey(candidate);
    const existing = correlated.get(key);
    correlated.set(key, existing ? mergeCandidates(existing, candidate) : {
      ...candidate,
      id: stableAlertId(candidate),
    });
  }

  return Array.from(correlated.values())
    .map((candidate): IntelligenceAlert => {
      const severity = severityFromAlertCandidate(candidate);
      const notificationPriority = notificationPriorityFromAlert({
        ...candidate,
        severity,
      });

      return {
        ...candidate,
        correlationKey: buildAlertCorrelationKey(candidate),
        cooldownKey: buildAlertCooldownKey(candidate),
        dedupeKey: buildAlertDedupeKey(candidate),
        notificationPriority,
        notificationSuppressionKey: buildAlertCooldownKey(candidate),
        severity,
        status: "open",
      };
    })
    .toSorted(compareAlerts);
}
