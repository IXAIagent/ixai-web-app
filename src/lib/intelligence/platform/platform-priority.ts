import type {
  IntelligenceHealth,
  IntelligenceItem,
  IntelligencePriority,
} from "@/src/lib/intelligence/platform/platform-types";

const PRIORITY_WEIGHT: Record<IntelligencePriority, number> = {
  urgent: 4,
  high: 3,
  normal: 2,
  low: 1,
};

export function priorityFromSeverity(value: string | null | undefined): IntelligencePriority {
  if (value === "critical") return "urgent";
  if (value === "high" || value === "warning") return "high";
  if (value === "info" || value === "medium") return "normal";
  return "low";
}

export function healthFromRisk(value: string | null | undefined): IntelligenceHealth {
  if (value === "critical") return "critical";
  if (value === "high" || value === "warning" || value === "medium" || value === "attention") return "elevated";
  if (value === "low" || value === "normal" || value === "healthy") return "healthy";
  if (value === "unavailable" || value === "offline" || value === "degraded") return "watch";
  return "unknown";
}

export function compareIntelligenceItems(left: IntelligenceItem, right: IntelligenceItem) {
  const priorityDiff = PRIORITY_WEIGHT[right.priority] - PRIORITY_WEIGHT[left.priority];
  if (priorityDiff !== 0) return priorityDiff;

  const confidenceDiff = (right.confidence.score ?? 0) - (left.confidence.score ?? 0);
  if (confidenceDiff !== 0) return confidenceDiff;

  return left.id.localeCompare(right.id);
}

export function sortIntelligenceItems(items: IntelligenceItem[]) {
  return [...items].sort(compareIntelligenceItems);
}
