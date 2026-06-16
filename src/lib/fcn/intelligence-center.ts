import type { FCNPosition, FCNUnderlying } from "@/src/types/fcn-position";

export type FCNIntelligenceRiskStatus = "GREEN" | "RED" | "UNKNOWN" | "YELLOW";
export type FCNLifecycleStatus = "ACTIVE" | "ARCHIVED" | "CALLED" | "MATURED" | "UNKNOWN";
export type FCNLifecycleFilter = "active" | "all" | "archived" | "closed";
export type FCNTimelineEventStatus = "overdue" | "today" | "upcoming";
export type FCNTimelineEventType =
  | "coupon_observation"
  | "coupon_payment"
  | "ko_observation"
  | "maturity";

export type FCNManualPriceOverrides = Record<string, number>;

export interface FCNUnderlyingRiskReadback {
  currentPrice: number | null;
  distanceToKiPct: number | null;
  invalidInitialPrice: boolean;
  invalidKiPrice: boolean;
  missingCurrentPrice: boolean;
  status: FCNIntelligenceRiskStatus;
  underlying: FCNUnderlying;
}

export interface FCNPositionRiskReadback {
  invalidDataCount: number;
  lifecycleStatus: FCNLifecycleStatus;
  missingPriceCount: number;
  nextEvent: FCNTimelineEvent | null;
  positionId: string;
  riskScore: number | null;
  riskStatus: FCNIntelligenceRiskStatus;
  underlyingCount: number;
  underlyingRisks: FCNUnderlyingRiskReadback[];
  worstKiDistancePct: number | null;
  worstUnderlying: FCNUnderlyingRiskReadback | null;
}

export interface FCNConcentrationItem {
  fcnCount: number;
  linkedPositionIds: string[];
  missingPrice: boolean;
  riskStatus: FCNIntelligenceRiskStatus;
  symbol: string;
  totalNotional: number;
}

export interface FCNTimelineEvent {
  date: string;
  eventType: FCNTimelineEventType;
  fcnId: string;
  fcnName: string;
  note: string;
  status: FCNTimelineEventStatus;
}

export interface FCNIntelligenceSummary {
  activeCount: number;
  archivedCount: number;
  calledCount: number;
  highRiskCount: number;
  maturedCount: number;
  totalCount: number;
  totalNotionalLabel: string;
  uniqueUnderlyingCount: number;
  unknownRiskCount: number;
  unknownStatusCount: number;
  upcomingEventsCount: number;
  watchCount: number;
}

export interface FCNIntelligenceCenterReadback {
  concentration: FCNConcentrationItem[];
  positionRisks: Map<string, FCNPositionRiskReadback>;
  summary: FCNIntelligenceSummary;
  timeline: FCNTimelineEvent[];
}

const RISK_WEIGHT: Record<FCNIntelligenceRiskStatus, number> = {
  RED: 4,
  YELLOW: 3,
  UNKNOWN: 2,
  GREEN: 1,
};

function isFiniteNumber(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase();
}

function getManualCurrentPrice(
  underlying: FCNUnderlying,
  manualPrices: FCNManualPriceOverrides,
) {
  const symbol = normalizeSymbol(underlying.symbol);
  const manualPrice = manualPrices[symbol];

  if (isFiniteNumber(manualPrice) && manualPrice >= 0) {
    return manualPrice;
  }

  return underlying.currentPrice;
}

function getToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function parseDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setHours(0, 0, 0, 0);
  return date;
}

function getEventStatus(date: string): FCNTimelineEventStatus {
  const eventDate = parseDate(date);

  if (!eventDate) {
    return "upcoming";
  }

  const today = getToday();

  if (eventDate.getTime() === today.getTime()) {
    return "today";
  }

  return eventDate < today ? "overdue" : "upcoming";
}

function compareOptionalNumberDesc(a: number, b: number) {
  return b - a;
}

function getTotalNotionalLabel(positions: FCNPosition[]) {
  const totals = new Map<string, number>();

  positions.forEach((position) => {
    if (!isFiniteNumber(position.notionalAmount)) {
      return;
    }

    totals.set(position.currency, (totals.get(position.currency) ?? 0) + position.notionalAmount);
  });

  if (totals.size === 0) {
    return "未填";
  }

  return Array.from(totals.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([currency, total]) => `${currency} ${total.toLocaleString("en-US")}`)
    .join(" / ");
}

function getNearestEvent(events: FCNTimelineEvent[]) {
  const upcomingEvents = events.filter((event) => event.status === "today" || event.status === "upcoming");
  return upcomingEvents[0] ?? null;
}

export function getLifecycleStatus(position: FCNPosition): FCNLifecycleStatus {
  if (position.status === "active") {
    const maturityDate = parseDate(position.maturityDate);

    if (maturityDate && maturityDate < getToday()) {
      return "MATURED";
    }

    return "ACTIVE";
  }

  if (position.status === "archived") return "ARCHIVED";
  if (position.status === "called") return "CALLED";
  if (position.status === "matured") return "MATURED";

  return "UNKNOWN";
}

export function isVisibleForLifecycleFilter(
  lifecycleStatus: FCNLifecycleStatus,
  filter: FCNLifecycleFilter,
) {
  if (filter === "all") return true;
  if (filter === "archived") return lifecycleStatus === "ARCHIVED";
  if (filter === "closed") return lifecycleStatus === "CALLED" || lifecycleStatus === "MATURED";
  return lifecycleStatus === "ACTIVE" || lifecycleStatus === "UNKNOWN";
}

export function calculateUnderlyingRisk(
  underlying: FCNUnderlying,
  manualPrices: FCNManualPriceOverrides = {},
): FCNUnderlyingRiskReadback {
  const currentPrice = getManualCurrentPrice(underlying, manualPrices);
  const missingCurrentPrice = !isFiniteNumber(currentPrice);
  const invalidKiPrice = !isFiniteNumber(underlying.kiPrice) || underlying.kiPrice <= 0;
  const invalidInitialPrice =
    underlying.initialPrice !== null &&
    underlying.initialPrice !== undefined &&
    (!Number.isFinite(underlying.initialPrice) || underlying.initialPrice <= 0);
  const distanceToKiPct =
    !missingCurrentPrice && !invalidKiPrice && isFiniteNumber(underlying.kiPrice)
      ? ((currentPrice - underlying.kiPrice) / underlying.kiPrice) * 100
      : null;

  let status: FCNIntelligenceRiskStatus = "UNKNOWN";

  if (!missingCurrentPrice && !invalidKiPrice && !invalidInitialPrice && distanceToKiPct !== null) {
    if (distanceToKiPct <= 0) {
      status = "RED";
    } else if (distanceToKiPct <= 10) {
      status = "YELLOW";
    } else {
      status = "GREEN";
    }
  }

  return {
    currentPrice,
    distanceToKiPct,
    invalidInitialPrice,
    invalidKiPrice,
    missingCurrentPrice,
    status,
    underlying,
  };
}

function calculateRiskScore(input: {
  lifecycleStatus: FCNLifecycleStatus;
  missingPriceCount: number;
  nextEvent: FCNTimelineEvent | null;
  riskStatus: FCNIntelligenceRiskStatus;
  worstKiDistancePct: number | null;
}) {
  if (input.lifecycleStatus === "ARCHIVED" || input.lifecycleStatus === "CALLED" || input.lifecycleStatus === "MATURED") {
    return null;
  }

  if (input.riskStatus === "UNKNOWN") {
    return null;
  }

  let score = 20;

  if (input.riskStatus === "RED") {
    score = 85 + Math.min(15, Math.abs(input.worstKiDistancePct ?? 0));
  } else if (input.riskStatus === "YELLOW") {
    score = 50 + Math.min(29, Math.max(0, 10 - (input.worstKiDistancePct ?? 10)) * 3);
  } else if (input.riskStatus === "GREEN") {
    score = Math.max(0, Math.min(49, 45 - Math.max(0, input.worstKiDistancePct ?? 20) / 2));
  }

  if (input.nextEvent?.status === "today") {
    score += 5;
  }

  if (input.missingPriceCount > 0) {
    score += 5;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function buildFcnTimelineEvents(positions: FCNPosition[]) {
  const events: FCNTimelineEvent[] = [];

  positions.forEach((position) => {
    const lifecycleStatus = getLifecycleStatus(position);

    if (lifecycleStatus === "ARCHIVED") {
      return;
    }

    if (position.maturityDate) {
      events.push({
        date: position.maturityDate,
        eventType: "maturity",
        fcnId: position.id,
        fcnName: position.name,
        note: "Maturity date from stored FCN position.",
        status: getEventStatus(position.maturityDate),
      });
    }

    position.observationSchedule.forEach((item, index) => {
      const observationDate = item.observationEnd ?? item.observationStart;
      const label = item.periodLabel || `Observation ${index + 1}`;

      if (observationDate) {
        events.push({
          date: observationDate,
          eventType: "coupon_observation",
          fcnId: position.id,
          fcnName: position.name,
          note: `${label}: coupon observation.`,
          status: getEventStatus(observationDate),
        });
        events.push({
          date: observationDate,
          eventType: "ko_observation",
          fcnId: position.id,
          fcnName: position.name,
          note: `${label}: KO observation.`,
          status: getEventStatus(observationDate),
        });
      }

      if (item.couponPaymentDate) {
        events.push({
          date: item.couponPaymentDate,
          eventType: "coupon_payment",
          fcnId: position.id,
          fcnName: position.name,
          note: `${label}: coupon payment date.`,
          status: getEventStatus(item.couponPaymentDate),
        });
      }
    });
  });

  return events.toSorted((a, b) => a.date.localeCompare(b.date) || a.fcnName.localeCompare(b.fcnName));
}

export function calculatePositionRisk(
  position: FCNPosition,
  manualPrices: FCNManualPriceOverrides = {},
  timelineEvents: FCNTimelineEvent[] = buildFcnTimelineEvents([position]),
): FCNPositionRiskReadback {
  const underlyingRisks = position.underlyings.map((underlying) =>
    calculateUnderlyingRisk(underlying, manualPrices),
  );
  const validRisks = underlyingRisks.filter(
    (risk): risk is FCNUnderlyingRiskReadback & { distanceToKiPct: number } =>
      risk.distanceToKiPct !== null,
  );
  const worstUnderlying =
    validRisks.toSorted((a, b) => a.distanceToKiPct - b.distanceToKiPct)[0] ?? null;
  const missingPriceCount = underlyingRisks.filter((risk) => risk.missingCurrentPrice).length;
  const invalidDataCount = underlyingRisks.filter(
    (risk) => risk.invalidInitialPrice || risk.invalidKiPrice,
  ).length;
  const lifecycleStatus = getLifecycleStatus(position);
  const nextEvent = getNearestEvent(timelineEvents.filter((event) => event.fcnId === position.id));

  let riskStatus: FCNIntelligenceRiskStatus = "UNKNOWN";

  if (validRisks.some((risk) => risk.distanceToKiPct <= 0)) {
    riskStatus = "RED";
  } else if (missingPriceCount > 0 || invalidDataCount > 0 || validRisks.length === 0) {
    riskStatus = "UNKNOWN";
  } else if (worstUnderlying && worstUnderlying.distanceToKiPct <= 10) {
    riskStatus = "YELLOW";
  } else {
    riskStatus = "GREEN";
  }

  return {
    invalidDataCount,
    lifecycleStatus,
    missingPriceCount,
    nextEvent,
    positionId: position.id,
    riskScore: calculateRiskScore({
      lifecycleStatus,
      missingPriceCount,
      nextEvent,
      riskStatus,
      worstKiDistancePct: worstUnderlying?.distanceToKiPct ?? null,
    }),
    riskStatus,
    underlyingCount: position.underlyings.length,
    underlyingRisks,
    worstKiDistancePct: worstUnderlying?.distanceToKiPct ?? null,
    worstUnderlying,
  };
}

export function buildUnderlyingConcentration(
  positions: FCNPosition[],
  positionRisks: Map<string, FCNPositionRiskReadback>,
) {
  const concentration = new Map<string, FCNConcentrationItem>();

  positions.forEach((position) => {
    const positionRisk = positionRisks.get(position.id);
    const positionNotional = isFiniteNumber(position.notionalAmount) ? position.notionalAmount : 0;
    const seenSymbolsForPosition = new Set<string>();

    position.underlyings.forEach((underlying) => {
      const symbol = normalizeSymbol(underlying.symbol);

      if (!symbol) {
        return;
      }

      const underlyingRisk = positionRisk?.underlyingRisks.find(
        (risk) => normalizeSymbol(risk.underlying.symbol) === symbol,
      );
      const existing =
        concentration.get(symbol) ??
        ({
          fcnCount: 0,
          linkedPositionIds: [],
          missingPrice: false,
          riskStatus: "GREEN",
          symbol,
          totalNotional: 0,
        } satisfies FCNConcentrationItem);

      if (!seenSymbolsForPosition.has(symbol)) {
        existing.fcnCount += 1;
        existing.totalNotional += positionNotional;
        existing.linkedPositionIds.push(position.id);
        seenSymbolsForPosition.add(symbol);
      }

      if (underlyingRisk?.missingCurrentPrice) {
        existing.missingPrice = true;
      }

      const nextStatus = underlyingRisk?.status ?? "UNKNOWN";

      if (RISK_WEIGHT[nextStatus] > RISK_WEIGHT[existing.riskStatus]) {
        existing.riskStatus = nextStatus;
      }

      concentration.set(symbol, existing);
    });
  });

  return Array.from(concentration.values()).toSorted((a, b) => {
    if (b.fcnCount !== a.fcnCount) return b.fcnCount - a.fcnCount;
    if (b.totalNotional !== a.totalNotional) return compareOptionalNumberDesc(a.totalNotional, b.totalNotional);
    return RISK_WEIGHT[b.riskStatus] - RISK_WEIGHT[a.riskStatus] || a.symbol.localeCompare(b.symbol);
  });
}

export function buildFcnIntelligenceCenterReadback(
  positions: FCNPosition[],
  manualPrices: FCNManualPriceOverrides = {},
): FCNIntelligenceCenterReadback {
  const timeline = buildFcnTimelineEvents(positions);
  const positionRisks = new Map<string, FCNPositionRiskReadback>();

  positions.forEach((position) => {
    positionRisks.set(position.id, calculatePositionRisk(position, manualPrices, timeline));
  });

  const lifecycleStatuses = Array.from(positionRisks.values()).map((risk) => risk.lifecycleStatus);
  const uniqueUnderlyings = new Set<string>();

  positions.forEach((position) => {
    position.underlyings.forEach((underlying) => {
      const symbol = normalizeSymbol(underlying.symbol);
      if (symbol) uniqueUnderlyings.add(symbol);
    });
  });

  const positionRiskValues = Array.from(positionRisks.values());

  return {
    concentration: buildUnderlyingConcentration(positions, positionRisks),
    positionRisks,
    summary: {
      activeCount: lifecycleStatuses.filter((status) => status === "ACTIVE").length,
      archivedCount: lifecycleStatuses.filter((status) => status === "ARCHIVED").length,
      calledCount: lifecycleStatuses.filter((status) => status === "CALLED").length,
      highRiskCount: positionRiskValues.filter((risk) => risk.riskStatus === "RED").length,
      maturedCount: lifecycleStatuses.filter((status) => status === "MATURED").length,
      totalCount: positions.length,
      totalNotionalLabel: getTotalNotionalLabel(positions),
      uniqueUnderlyingCount: uniqueUnderlyings.size,
      unknownRiskCount: positionRiskValues.filter((risk) => risk.riskStatus === "UNKNOWN").length,
      unknownStatusCount: lifecycleStatuses.filter((status) => status === "UNKNOWN").length,
      upcomingEventsCount: timeline.filter(
        (event) => event.status === "today" || event.status === "upcoming",
      ).length,
      watchCount: positionRiskValues.filter((risk) => risk.riskStatus === "YELLOW").length,
    },
    timeline,
  };
}
