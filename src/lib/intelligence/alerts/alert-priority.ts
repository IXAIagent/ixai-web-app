import type {
  IntelligenceAlert,
  IntelligenceAlertCandidate,
  IntelligenceAlertSeverity,
} from "@/src/lib/intelligence/alerts/alert-types";
import type { NotificationPriority } from "@/src/lib/intelligence/notifications";
import type { IntelligencePriority } from "@/src/lib/intelligence/platform";

const PRIORITY_WEIGHT: Record<IntelligencePriority, number> = {
  high: 70,
  low: 20,
  normal: 45,
  urgent: 90,
};

const SEVERITY_WEIGHT: Record<IntelligenceAlertSeverity, number> = {
  critical: 90,
  info: 30,
  warning: 65,
};

export function severityFromAlertCandidate(candidate: IntelligenceAlertCandidate): IntelligenceAlertSeverity {
  if (candidate.health === "critical" || candidate.priority === "urgent") {
    return "critical";
  }

  if (
    candidate.health === "elevated" ||
    candidate.health === "watch" ||
    candidate.priority === "high" ||
    candidate.confidence >= 0.7
  ) {
    return "warning";
  }

  return "info";
}

export function notificationPriorityFromAlert(input: Pick<IntelligenceAlertCandidate, "confidence" | "priority"> & {
  severity: IntelligenceAlertSeverity;
}): NotificationPriority {
  const score = SEVERITY_WEIGHT[input.severity] + PRIORITY_WEIGHT[input.priority] + input.confidence * 20;

  if (input.severity === "critical" || score >= 170) return "urgent";
  if (input.severity === "warning" || score >= 125) return "high";
  if (score >= 80) return "normal";
  return "low";
}

export function compareAlerts(left: IntelligenceAlert, right: IntelligenceAlert) {
  const priorityWeight: Record<NotificationPriority, number> = {
    high: 3,
    low: 1,
    normal: 2,
    urgent: 4,
  };
  const priorityDiff = priorityWeight[right.notificationPriority] - priorityWeight[left.notificationPriority];
  if (priorityDiff !== 0) return priorityDiff;

  const severityDiff = SEVERITY_WEIGHT[right.severity] - SEVERITY_WEIGHT[left.severity];
  if (severityDiff !== 0) return severityDiff;

  const confidenceDiff = right.confidence - left.confidence;
  if (confidenceDiff !== 0) return confidenceDiff;

  return left.id.localeCompare(right.id);
}
