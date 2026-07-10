import type {
  IntelligenceAlert,
  IntelligenceAlertLifecycleAction,
  IntelligenceAlertLifecycleResult,
  IntelligenceAlertStatus,
} from "@/src/lib/intelligence/alerts/alert-types";

const TRANSITIONS: Record<IntelligenceAlertStatus, IntelligenceAlertLifecycleAction[]> = {
  acknowledged: ["open", "resolve", "snooze", "archive"],
  archived: ["open"],
  open: ["acknowledge", "resolve", "snooze", "archive"],
  resolved: ["open", "archive"],
  snoozed: ["open", "resolve", "archive"],
};

const NEXT_STATUS: Record<IntelligenceAlertLifecycleAction, IntelligenceAlertStatus> = {
  acknowledge: "acknowledged",
  archive: "archived",
  open: "open",
  resolve: "resolved",
  snooze: "snoozed",
};

export function transitionAlertLifecycle(
  alert: IntelligenceAlert,
  action: IntelligenceAlertLifecycleAction,
): IntelligenceAlertLifecycleResult {
  const allowed = TRANSITIONS[alert.status].includes(action);
  const nextStatus = allowed ? NEXT_STATUS[action] : alert.status;

  return {
    alert: {
      ...alert,
      status: nextStatus,
    },
    allowed,
    nextStatus,
    reason: allowed
      ? `Alert can transition from ${alert.status} to ${nextStatus}.`
      : `Alert cannot transition from ${alert.status} using ${action}.`,
  };
}

export function isActionableAlert(alert: IntelligenceAlert) {
  return alert.status === "open" || alert.status === "acknowledged";
}
