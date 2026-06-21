import type { FCNObservationScheduleItem, FCNPosition } from "@/src/types/fcn-position";
import type {
  FcnCouponScheduleEvent,
  FcnMonthlyCashflow,
  FcnPortfolioScheduleSummary,
  FcnPositionScheduleSummary,
  FcnScheduleEventType,
  FcnScheduleSourceStatus,
  FcnScheduleUrgency,
  FcnScheduleWarning,
} from "@/src/lib/fcn/schedule/fcn-schedule-types";

const DISCLAIMER =
  "FCN Coupon & Schedule Engine is informational and monitoring-only. It does not provide investment recommendations, tax reporting, order execution, auto trading, target prices, or return promises.";

type LooseRecord = Record<string, unknown>;

function isRecord(value: unknown): value is LooseRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function parseNumber(value: unknown) {
  if (isFiniteNumber(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, "").trim());
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function normalizeDate(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return trimmed.slice(0, 10);
}

function toLocalDate(value: string | undefined) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function getEventDate(event: FcnCouponScheduleEvent) {
  return (
    event.paymentDate ??
    event.couponDate ??
    event.observationEndDate ??
    event.observationStartDate ??
    event.maturityDate
  );
}

export function calculateDaysUntilEvent(
  eventOrDate: FcnCouponScheduleEvent | string | undefined,
  today = getToday(),
) {
  const eventDate =
    typeof eventOrDate === "string" ? eventOrDate : getEventDate(eventOrDate as FcnCouponScheduleEvent);
  const date = toLocalDate(eventDate);

  if (!date) {
    return undefined;
  }

  return Math.round((date.getTime() - today.getTime()) / 86_400_000);
}

export function calculateScheduleUrgency(
  eventOrDate: FcnCouponScheduleEvent | string | undefined,
  today = getToday(),
): FcnScheduleUrgency {
  const daysUntilEvent = calculateDaysUntilEvent(eventOrDate, today);

  if (typeof daysUntilEvent !== "number") {
    return "unavailable";
  }

  if (daysUntilEvent < 0) {
    return "overdue";
  }

  if (daysUntilEvent <= 7) {
    return "due_soon";
  }

  if (daysUntilEvent <= 30) {
    return "upcoming";
  }

  return "future";
}

function buildEvent(input: {
  currency?: string;
  expectedCouponAmount?: number;
  eventType: FcnScheduleEventType;
  fcnId: string;
  fcnName: string;
  id: string;
  maturityDate?: string;
  observationEndDate?: string;
  observationStartDate?: string;
  paymentDate?: string;
  sourceStatus?: FcnScheduleSourceStatus;
  warningMessage?: string;
}): FcnCouponScheduleEvent {
  const couponDate =
    input.eventType === "coupon" ? input.paymentDate ?? input.observationEndDate : undefined;
  const eventDate =
    input.paymentDate ?? couponDate ?? input.observationEndDate ?? input.observationStartDate ?? input.maturityDate;
  const daysUntilEvent = calculateDaysUntilEvent(eventDate);
  const urgency = calculateScheduleUrgency(eventDate);

  return {
    currency: input.currency,
    daysUntilEvent,
    eventType: input.eventType,
    fcnId: input.fcnId,
    fcnName: input.fcnName,
    id: input.id,
    maturityDate: input.maturityDate,
    observationEndDate: input.observationEndDate,
    observationStartDate: input.observationStartDate,
    paymentDate: input.paymentDate,
    sourceStatus: input.sourceStatus ?? (urgency === "unavailable" ? "unavailable" : "fallback"),
    urgency,
    ...(couponDate ? { couponDate } : {}),
    ...(isFiniteNumber(input.expectedCouponAmount)
      ? { expectedCouponAmount: input.expectedCouponAmount }
      : {}),
    ...(input.warningMessage ? { warningMessage: input.warningMessage } : {}),
  };
}

function getRecordString(record: LooseRecord, keys: string[]) {
  for (const key of keys) {
    const value = normalizeDate(record[key]);
    if (value) return value;
  }

  return undefined;
}

function getRecordNumber(record: LooseRecord, keys: string[]) {
  for (const key of keys) {
    const value = parseNumber(record[key]);
    if (value !== undefined) return value;
  }

  return undefined;
}

function getArrayFromRecord(record: LooseRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
}

function eventFromScheduleRecord(input: {
  currency: string;
  fcnId: string;
  fcnName: string;
  index: number;
  record: LooseRecord;
  sourceKey: string;
}): FcnCouponScheduleEvent[] {
  const observationStartDate = getRecordString(input.record, [
    "observationStart",
    "observation_start",
    "observationStartDate",
    "observation_start_date",
    "observationDate",
    "observation_date",
    "startDate",
    "start_date",
  ]);
  const observationEndDate = getRecordString(input.record, [
    "observationEnd",
    "observation_end",
    "observationEndDate",
    "observation_end_date",
    "observationDate",
    "observation_date",
    "endDate",
    "end_date",
  ]);
  const paymentDate = getRecordString(input.record, [
    "couponPaymentDate",
    "coupon_payment_date",
    "paymentDate",
    "payment_date",
    "couponDate",
    "coupon_date",
  ]);
  const expectedCouponAmount = getRecordNumber(input.record, [
    "expectedCouponAmount",
    "expected_coupon_amount",
    "couponAmount",
    "coupon_amount",
    "amount",
  ]);
  const events: FcnCouponScheduleEvent[] = [];

  if (observationStartDate || observationEndDate) {
    events.push(
      buildEvent({
        currency: input.currency,
        eventType: "observation",
        fcnId: input.fcnId,
        fcnName: input.fcnName,
        id: `${input.fcnId}-${input.sourceKey}-${input.index}-observation`,
        observationEndDate,
        observationStartDate,
      }),
      buildEvent({
        currency: input.currency,
        eventType: "ko_observation",
        fcnId: input.fcnId,
        fcnName: input.fcnName,
        id: `${input.fcnId}-${input.sourceKey}-${input.index}-ko`,
        observationEndDate,
        observationStartDate,
      }),
    );
  }

  if (paymentDate) {
    events.push(
      buildEvent({
        currency: input.currency,
        eventType: "coupon",
        expectedCouponAmount,
        fcnId: input.fcnId,
        fcnName: input.fcnName,
        id: `${input.fcnId}-${input.sourceKey}-${input.index}-coupon`,
        observationEndDate,
        observationStartDate,
        paymentDate,
      }),
    );
  }

  if (events.length === 0) {
    events.push(
      buildEvent({
        currency: input.currency,
        eventType: "unknown",
        fcnId: input.fcnId,
        fcnName: input.fcnName,
        id: `${input.fcnId}-${input.sourceKey}-${input.index}-unknown`,
        sourceStatus: "unavailable",
        warningMessage: "Schedule item does not include a usable event date.",
      }),
    );
  }

  return events;
}

function eventsFromObservationSchedule(position: FCNPosition) {
  return position.observationSchedule.flatMap((item: FCNObservationScheduleItem, index) =>
    eventFromScheduleRecord({
      currency: position.currency,
      fcnId: position.id,
      fcnName: position.name,
      index,
      record: item as LooseRecord,
      sourceKey: "observationSchedule",
    }),
  );
}

function eventsFromMetadata(position: FCNPosition) {
  const metadata = position.metadata;
  if (!isRecord(metadata)) {
    return [];
  }

  const scheduleKeys = [
    "couponSchedules",
    "coupon_schedule",
    "observationSchedules",
    "observation_schedule",
    "schedule",
    "observations",
  ];
  const dateKeys = ["couponDates", "coupon_dates"];
  const events = scheduleKeys.flatMap((key) =>
    getArrayFromRecord(metadata, [key]).flatMap((item, index) => {
      if (!isRecord(item)) {
        return [
          buildEvent({
            currency: position.currency,
            eventType: "unknown",
            fcnId: position.id,
            fcnName: position.name,
            id: `${position.id}-${key}-${index}-invalid`,
            sourceStatus: "unavailable",
            warningMessage: `${key}[${index}] is not a usable schedule object.`,
          }),
        ];
      }

      return eventFromScheduleRecord({
        currency: position.currency,
        fcnId: position.id,
        fcnName: position.name,
        index,
        record: item,
        sourceKey: key,
      });
    }),
  );

  dateKeys.forEach((key) => {
    getArrayFromRecord(metadata, [key]).forEach((value, index) => {
      const paymentDate = normalizeDate(value);
      events.push(
        buildEvent({
          currency: position.currency,
          eventType: "coupon",
          fcnId: position.id,
          fcnName: position.name,
          id: `${position.id}-${key}-${index}-coupon`,
          paymentDate,
          sourceStatus: paymentDate ? "fallback" : "unavailable",
          warningMessage: paymentDate ? undefined : `${key}[${index}] is not a usable date.`,
        }),
      );
    });
  });

  return events;
}

function dedupeEvents(events: FcnCouponScheduleEvent[]) {
  const seen = new Set<string>();

  return events.filter((event) => {
    const key = [
      event.fcnId,
      event.eventType,
      getEventDate(event) ?? "no-date",
      event.expectedCouponAmount ?? "no-amount",
    ].join(":");

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function normalizeFcnScheduleEvents(position: FCNPosition) {
  const events = [
    ...eventsFromObservationSchedule(position),
    ...eventsFromMetadata(position),
  ];

  if (position.maturityDate) {
    events.push(
      buildEvent({
        currency: position.currency,
        eventType: "maturity",
        fcnId: position.id,
        fcnName: position.name,
        id: `${position.id}-maturity`,
        maturityDate: position.maturityDate,
      }),
    );
  }

  return dedupeEvents(events).toSorted((left, right) => {
    const leftDate = getEventDate(left) ?? "9999-12-31";
    const rightDate = getEventDate(right) ?? "9999-12-31";

    if (leftDate !== rightDate) return leftDate.localeCompare(rightDate);
    if (left.eventType !== right.eventType) return left.eventType.localeCompare(right.eventType);
    return left.id.localeCompare(right.id);
  });
}

export function buildMonthlyCashflows(events: FcnCouponScheduleEvent[]) {
  const groups = new Map<string, FcnMonthlyCashflow>();

  events
    .filter((event) => event.eventType === "coupon")
    .forEach((event) => {
      const eventDate = event.paymentDate ?? event.couponDate;
      const monthKey = eventDate?.slice(0, 7);
      const currency = event.currency ?? "UNKNOWN";

      if (!monthKey) {
        return;
      }

      const key = `${monthKey}:${currency}`;
      const existing =
        groups.get(key) ??
        ({
          currency,
          eventCount: 0,
          events: [],
          expectedCouponAmount: null,
          monthKey,
        } satisfies FcnMonthlyCashflow);

      existing.eventCount += 1;
      existing.events.push(event);

      if (isFiniteNumber(event.expectedCouponAmount)) {
        existing.expectedCouponAmount =
          (existing.expectedCouponAmount ?? 0) + event.expectedCouponAmount;
      }

      groups.set(key, existing);
    });

  return Array.from(groups.values()).toSorted((left, right) => {
    if (left.monthKey !== right.monthKey) return left.monthKey.localeCompare(right.monthKey);
    return left.currency.localeCompare(right.currency);
  });
}

function findNextEvent(events: FcnCouponScheduleEvent[], eventTypes: FcnScheduleEventType[]) {
  return events.find((event) => {
    return (
      eventTypes.includes(event.eventType) &&
      (event.urgency === "due_soon" || event.urgency === "upcoming" || event.urgency === "future")
    );
  });
}

export function findNextCouponEvent(events: FcnCouponScheduleEvent[]) {
  return findNextEvent(events, ["coupon"]);
}

export function findNextObservationEvent(events: FcnCouponScheduleEvent[]) {
  return findNextEvent(events, ["observation", "ko_observation"]);
}

export function findNextMaturityEvent(events: FcnCouponScheduleEvent[]) {
  return findNextEvent(events, ["maturity"]);
}

function combineSourceStatus(events: FcnCouponScheduleEvent[]): FcnScheduleSourceStatus {
  if (events.length === 0) return "unavailable";
  if (events.every((event) => event.sourceStatus === "live")) return "live";
  if (events.every((event) => event.sourceStatus === "fallback")) return "fallback";
  if (events.every((event) => event.sourceStatus === "unavailable")) return "unavailable";
  return "partial";
}

function buildWarnings(position: FCNPosition, events: FcnCouponScheduleEvent[]) {
  const warnings: FcnScheduleWarning[] = [];

  if (events.length === 0) {
    warnings.push({
      code: "missing_schedule",
      message: "FCN position does not include coupon, observation, or maturity schedule data.",
    });
  }

  if (events.some((event) => event.urgency === "unavailable")) {
    warnings.push({
      code: "unusable_schedule_dates",
      message: "Some schedule items do not include usable dates.",
    });
  }

  if (
    position.couponRatePct !== null &&
    events.some((event) => event.eventType === "coupon" && event.expectedCouponAmount === undefined)
  ) {
    warnings.push({
      code: "missing_coupon_amount",
      message:
        "Coupon rate exists, but explicit coupon amount is not stored. Events are shown without estimated amount.",
    });
  }

  return warnings;
}

export function buildFcnPositionScheduleSummary(
  position: FCNPosition,
): FcnPositionScheduleSummary {
  const upcomingEvents = normalizeFcnScheduleEvents(position);
  const warnings = buildWarnings(position, upcomingEvents);
  const sourceStatus =
    warnings.length > 0
      ? "partial"
      : combineSourceStatus(upcomingEvents);

  return {
    id: position.id,
    informationalOnlyDisclaimer: DISCLAIMER,
    monthlyCashflows: buildMonthlyCashflows(upcomingEvents),
    name: position.name,
    nextCouponEvent: findNextCouponEvent(upcomingEvents),
    nextMaturityEvent: findNextMaturityEvent(upcomingEvents),
    nextObservationEvent: findNextObservationEvent(upcomingEvents),
    sourceStatus,
    upcomingEvents,
    updatedAt: new Date().toISOString(),
    warnings,
  };
}

function getNext30DayEvents(summaries: FcnPositionScheduleSummary[]) {
  return summaries
    .flatMap((summary) => summary.upcomingEvents)
    .filter((event) => {
      return typeof event.daysUntilEvent === "number" && event.daysUntilEvent >= 0 && event.daysUntilEvent <= 30;
    })
    .toSorted((left, right) => (left.daysUntilEvent ?? 9999) - (right.daysUntilEvent ?? 9999));
}

export function buildFcnPortfolioScheduleSummary(
  positions: FCNPosition[],
): FcnPortfolioScheduleSummary {
  const summaries = positions.map(buildFcnPositionScheduleSummary);
  const allEvents = summaries.flatMap((summary) => summary.upcomingEvents);

  return {
    dueSoonEventCount: allEvents.filter((event) => event.urgency === "due_soon").length,
    informationalOnlyDisclaimer: DISCLAIMER,
    monthlyCashflows: buildMonthlyCashflows(allEvents),
    next30DayEvents: getNext30DayEvents(summaries),
    overdueEventCount: allEvents.filter((event) => event.urgency === "overdue").length,
    positionCount: positions.length,
    scheduledPositionCount: summaries.filter((summary) => summary.upcomingEvents.length > 0).length,
    sourceStatus: combineSourceStatus(allEvents),
    summaries,
    unavailablePositionCount: summaries.filter((summary) => summary.sourceStatus === "unavailable").length,
    upcomingEventCount: allEvents.filter(
      (event) => event.urgency === "due_soon" || event.urgency === "upcoming" || event.urgency === "future",
    ).length,
    updatedAt: new Date().toISOString(),
  };
}
