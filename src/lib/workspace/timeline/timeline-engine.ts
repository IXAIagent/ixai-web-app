import type { WorkspaceAlertSummary } from "@/src/lib/alerts";
import type { FcnCouponScheduleEvent, FcnPortfolioScheduleSummary } from "@/src/lib/fcn/schedule";
import type {
  WorkspaceTimelineEvent,
  WorkspaceTimelineEventType,
  WorkspaceTimelineGroup,
  WorkspaceTimelineSeverity,
  WorkspaceTimelineSummary,
} from "@/src/lib/workspace/timeline/timeline-types";

const DISCLAIMER =
  "Timeline is a read-only event view. It does not invent dates, deliver alerts, execute orders, or provide investment recommendations.";

function parseDate(value: string | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysUntil(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(date);
  eventDate.setHours(0, 0, 0, 0);
  return Math.round((eventDate.getTime() - today.getTime()) / 86_400_000);
}

function eventDate(event: FcnCouponScheduleEvent) {
  return (
    parseDate(event.couponDate) ??
    parseDate(event.paymentDate) ??
    parseDate(event.observationEndDate) ??
    parseDate(event.observationStartDate) ??
    parseDate(event.maturityDate)
  );
}

function typeFromSchedule(event: FcnCouponScheduleEvent): WorkspaceTimelineEventType {
  if (event.eventType === "coupon") return "fcn_coupon";
  if (event.eventType === "ko_observation") return "fcn_ko_observation";
  if (event.eventType === "maturity") return "fcn_maturity";
  if (event.eventType === "observation") return "fcn_observation";
  return "unknown";
}

function severityForDays(days: number): WorkspaceTimelineSeverity {
  if (days < 0) return "critical";
  if (days <= 7) return "warning";
  return "info";
}

function groupEvents(events: WorkspaceTimelineEvent[]): WorkspaceTimelineGroup[] {
  return [
    {
      events: events.filter((event) => event.daysUntil < 0),
      key: "overdue",
    },
    {
      events: events.filter((event) => event.daysUntil === 0),
      key: "today",
    },
    {
      events: events.filter((event) => event.daysUntil > 0 && event.daysUntil <= 7),
      key: "next7Days",
    },
    {
      events: events.filter((event) => event.daysUntil > 7),
      key: "later",
    },
  ];
}

export function buildWorkspaceTimelineSummary(input: {
  alerts: WorkspaceAlertSummary;
  fcnSchedule: FcnPortfolioScheduleSummary;
}): WorkspaceTimelineSummary {
  const scheduleEvents = input.fcnSchedule.summaries
    .flatMap((summary) => summary.upcomingEvents)
    .map((scheduleEvent): WorkspaceTimelineEvent | null => {
      const date = eventDate(scheduleEvent);
      if (!date) return null;
      const distance = daysUntil(date);

      return {
        date: date.toISOString(),
        daysUntil: distance,
        description: `${scheduleEvent.fcnName} ${scheduleEvent.eventType.replace("_", " ")} event.`,
        eventType: typeFromSchedule(scheduleEvent),
        id: `timeline-${scheduleEvent.id}`,
        relatedPositionName: scheduleEvent.fcnName,
        severity: severityForDays(distance),
        sourceEngine: "fcn_schedule_engine",
        title: scheduleEvent.eventType.replace("_", " "),
      };
    })
    .filter((event): event is WorkspaceTimelineEvent => Boolean(event));
  const alertEvents = input.alerts.alerts
    .map((alert): WorkspaceTimelineEvent | null => {
      const date = parseDate(alert.createdAt);
      if (!date) return null;
      const distance = daysUntil(date);

      return {
        date: date.toISOString(),
        daysUntil: distance,
        description: alert.message,
        eventType: "alert",
        id: `timeline-${alert.id}`,
        severity: alert.severity === "critical" ? "critical" : alert.severity === "info" ? "info" : "warning",
        sourceEngine: alert.sourceEngine,
        title: alert.title,
      };
    })
    .filter((event): event is WorkspaceTimelineEvent => Boolean(event));
  const dataQualityEvents: WorkspaceTimelineEvent[] =
    input.fcnSchedule.sourceStatus === "unavailable"
      ? [
          {
            date: new Date().toISOString(),
            daysUntil: 0,
            description:
              "FCN schedule source is unavailable, so Timeline is showing a source-quality event instead of inventing FCN dates.",
            eventType: "system",
            id: "timeline-data-quality-fcn-schedule-unavailable",
            severity: "warning",
            sourceEngine: "workspace_timeline",
            title: "Data quality review",
          },
        ]
      : [];
  const events = [...scheduleEvents, ...alertEvents, ...dataQualityEvents].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return {
    eventCount: events.length,
    generatedAt: new Date().toISOString(),
    groups: groupEvents(events),
    informationalOnlyDisclaimer: DISCLAIMER,
  };
}
