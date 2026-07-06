import type {
  MonitoringEvent,
  MonitoringTimeline,
  MonitoringTimelineBucket,
} from "@/src/lib/intelligence/monitoring/monitoring-types";

function bucket(label: MonitoringTimelineBucket["label"], events: MonitoringEvent[]): MonitoringTimelineBucket {
  return {
    events: events.sort((a, b) => b.priorityScore - a.priorityScore),
    label,
  };
}

export function buildMonitoringTimeline(
  events: MonitoringEvent[],
  generatedAt = new Date().toISOString(),
): MonitoringTimeline {
  const now = new Date(generatedAt).getTime();
  const oneDay = 24 * 60 * 60 * 1000;
  const sevenDays = 7 * oneDay;
  const expired: MonitoringEvent[] = [];
  const today: MonitoringEvent[] = [];
  const next7Days: MonitoringEvent[] = [];
  const later: MonitoringEvent[] = [];

  for (const event of events) {
    const expiresAt = new Date(event.expiresAt).getTime();
    if (!Number.isFinite(expiresAt) || expiresAt < now) {
      expired.push(event);
    } else if (expiresAt <= now + oneDay) {
      today.push(event);
    } else if (expiresAt <= now + sevenDays) {
      next7Days.push(event);
    } else {
      later.push(event);
    }
  }

  return {
    expired: bucket("expired", expired),
    generatedAt,
    later: bucket("later", later),
    next7Days: bucket("next_7_days", next7Days),
    today: bucket("today", today),
  };
}
