import type {
  FcnPositionRiskSummary,
  FcnPortfolioRiskSummary,
} from "@/src/lib/fcn/risk/fcn-risk-types";
import type {
  FcnCouponScheduleEvent,
  FcnPortfolioScheduleSummary,
} from "@/src/lib/fcn/schedule";
import type {
  PortfolioValuationResult,
} from "@/src/lib/portfolio/valuation/portfolio-valuation-types";
import type { PortfolioRiskResult } from "@/src/lib/risk/risk-engine-types";
import type {
  WorkspaceIntelligenceCard,
  WorkspaceIntelligenceEngineInput,
  WorkspaceIntelligenceReport,
  WorkspaceIntelligenceSeverity,
  WorkspaceIntelligenceSourceEngine,
} from "@/src/lib/intelligence/engine/intelligence-types";

function formatCurrency(value: number | null | undefined, currency = "USD") {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "unknown value";
  }

  return new Intl.NumberFormat("en-US", {
    currency: currency === "USDT" ? "USD" : currency,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function formatPercent(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "unknown";
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function card(input: WorkspaceIntelligenceCard): WorkspaceIntelligenceCard {
  return input;
}

function highestBy<T>(items: T[], readValue: (item: T) => number | null | undefined) {
  return items.reduce<T | null>((best, item) => {
    const value = readValue(item);
    const bestValue = best ? readValue(best) : null;

    if (typeof value !== "number" || !Number.isFinite(value)) {
      return best;
    }

    if (typeof bestValue !== "number" || !Number.isFinite(bestValue)) {
      return item;
    }

    return value > bestValue ? item : best;
  }, null);
}

function lowestBy<T>(items: T[], readValue: (item: T) => number | null | undefined) {
  return items.reduce<T | null>((best, item) => {
    const value = readValue(item);
    const bestValue = best ? readValue(best) : null;

    if (typeof value !== "number" || !Number.isFinite(value)) {
      return best;
    }

    if (typeof bestValue !== "number" || !Number.isFinite(bestValue)) {
      return item;
    }

    return value < bestValue ? item : best;
  }, null);
}

function severityForAllocation(allocationPercent: number | null | undefined): WorkspaceIntelligenceSeverity {
  if (typeof allocationPercent !== "number" || !Number.isFinite(allocationPercent)) {
    return "info";
  }

  if (allocationPercent >= 60) return "critical";
  if (allocationPercent >= 40) return "warning";
  return "info";
}

function buildPortfolioCards(
  valuation: PortfolioValuationResult,
): WorkspaceIntelligenceCard[] {
  const cards: WorkspaceIntelligenceCard[] = [];
  const positions = valuation.positions;
  const largestPosition = highestBy(positions, (position) => position.allocationPercent);
  const largestGain = highestBy(
    positions.filter((position) => (position.unrealizedPnl ?? 0) > 0),
    (position) => position.unrealizedPnl,
  );
  const largestLoss = lowestBy(
    positions.filter((position) => (position.unrealizedPnl ?? 0) < 0),
    (position) => position.unrealizedPnl,
  );
  const largestAssetClass = highestBy(
    valuation.summary.assetAllocation,
    (allocation) => allocation.allocationPercent,
  );

  if (largestPosition) {
    cards.push(
      card({
        category: "portfolio",
        id: `portfolio-largest-position-${largestPosition.id}`,
        severity: severityForAllocation(largestPosition.allocationPercent),
        sourceEngine: "portfolio_valuation",
        summary: `${largestPosition.symbol} is the largest visible position at ${formatPercent(largestPosition.allocationPercent)} allocation and ${formatCurrency(largestPosition.marketValue, largestPosition.currency)} estimated value.`,
        title: "Largest position",
      }),
    );
  }

  if (largestGain) {
    cards.push(
      card({
        category: "portfolio",
        id: `portfolio-largest-gain-${largestGain.id}`,
        severity: "info",
        sourceEngine: "portfolio_valuation",
        summary: `${largestGain.symbol} has the largest available unrealized gain at ${formatCurrency(largestGain.unrealizedPnl, largestGain.currency)} (${formatPercent(largestGain.unrealizedPnlPercent)}).`,
        title: "Largest available gain",
      }),
    );
  }

  if (largestLoss) {
    cards.push(
      card({
        category: "portfolio",
        id: `portfolio-largest-loss-${largestLoss.id}`,
        severity: "warning",
        sourceEngine: "portfolio_valuation",
        summary: `${largestLoss.symbol} has the largest available unrealized loss at ${formatCurrency(largestLoss.unrealizedPnl, largestLoss.currency)} (${formatPercent(largestLoss.unrealizedPnlPercent)}).`,
        title: "Largest available loss",
      }),
    );
  }

  if (largestAssetClass && largestAssetClass.allocationPercent >= 40) {
    cards.push(
      card({
        category: "portfolio",
        id: `portfolio-asset-class-concentration-${largestAssetClass.assetClass}`,
        severity: severityForAllocation(largestAssetClass.allocationPercent),
        sourceEngine: "portfolio_valuation",
        summary: `${largestAssetClass.assetClass.toUpperCase()} is the highest asset-class allocation at ${formatPercent(largestAssetClass.allocationPercent)} across ${largestAssetClass.positionCount} positions.`,
        title: "Highest asset-class concentration",
      }),
    );
  }

  if (valuation.summary.unpricedPositionCount > 0) {
    cards.push(
      card({
        category: "risk",
        id: "portfolio-unpriced-positions",
        severity: valuation.summary.unpricedPositionCount >= valuation.summary.pricedPositionCount ? "critical" : "warning",
        sourceEngine: "portfolio_valuation",
        summary: `${valuation.summary.unpricedPositionCount} positions are not fully priced. Market data, quantity, or cost data may be missing.`,
        title: "Unpriced positions",
      }),
    );
  }

  return cards;
}

function buildRiskCards(risk: PortfolioRiskResult): WorkspaceIntelligenceCard[] {
  const cards: WorkspaceIntelligenceCard[] = [];
  const criticalSignals = risk.signals.filter((signal) => signal.severity === "critical");
  const highSignals = risk.signals.filter((signal) => signal.severity === "high");
  const concentrationSignals = risk.signals.filter(
    (signal) => signal.category === "concentration" || signal.category === "asset_allocation",
  );

  criticalSignals.slice(0, 3).forEach((signal) => {
    cards.push(
      card({
        category: "risk",
        id: `risk-critical-${signal.id}`,
        severity: "critical",
        sourceEngine: "risk_engine",
        summary: `${signal.message} Affected symbols: ${signal.affectedSymbols.join(", ") || "n/a"}.`,
        title: signal.title,
      }),
    );
  });

  highSignals.slice(0, 3).forEach((signal) => {
    cards.push(
      card({
        category: "risk",
        id: `risk-high-${signal.id}`,
        severity: "warning",
        sourceEngine: "risk_engine",
        summary: `${signal.message} Affected symbols: ${signal.affectedSymbols.join(", ") || "n/a"}.`,
        title: signal.title,
      }),
    );
  });

  concentrationSignals.slice(0, 2).forEach((signal) => {
    cards.push(
      card({
        category: "risk",
        id: `risk-concentration-${signal.id}`,
        severity: signal.severity === "critical" ? "critical" : "warning",
        sourceEngine: "risk_engine",
        summary: signal.message,
        title: "Concentration warning",
      }),
    );
  });

  return cards;
}

function severityForFcnRisk(position: FcnPositionRiskSummary): WorkspaceIntelligenceSeverity {
  if (position.riskLevel === "critical") return "critical";
  if (position.riskLevel === "high" || position.riskLevel === "medium") return "warning";
  return "info";
}

function buildFcnRiskCards(fcnRisk: FcnPortfolioRiskSummary): WorkspaceIntelligenceCard[] {
  const cards: WorkspaceIntelligenceCard[] = [];
  const kiBreached = fcnRisk.summaries.filter((summary) => summary.kiBreached);
  const nearKi = fcnRisk.summaries.filter(
    (summary) =>
      typeof summary.nearestKiDistancePercent === "number" &&
      summary.nearestKiDistancePercent > 0 &&
      summary.nearestKiDistancePercent <= 10,
  );
  const topRisk = fcnRisk.topRiskPositions.slice(0, 3);

  kiBreached.forEach((position) => {
    cards.push(
      card({
        category: "fcn",
        id: `fcn-ki-breached-${position.id}`,
        severity: "critical",
        sourceEngine: "fcn_risk",
        summary: `${position.name} has KI breached status. Worst-of: ${position.worstOfSymbol ?? "unknown"}, nearest KI distance: ${formatPercent(position.nearestKiDistancePercent)}.`,
        title: "FCN KI breached",
      }),
    );
  });

  nearKi.forEach((position) => {
    cards.push(
      card({
        category: "fcn",
        id: `fcn-near-ki-${position.id}`,
        severity: "warning",
        sourceEngine: "fcn_risk",
        summary: `${position.name} is near KI with nearest KI distance ${formatPercent(position.nearestKiDistancePercent)}. Worst-of: ${position.worstOfSymbol ?? "unknown"}.`,
        title: "FCN near KI",
      }),
    );
  });

  topRisk.forEach((position) => {
    cards.push(
      card({
        category: "fcn",
        id: `fcn-top-risk-${position.id}`,
        severity: severityForFcnRisk(position),
        sourceEngine: "fcn_risk",
        summary: `${position.name} risk level is ${position.riskLevel}. Worst-of performance: ${formatPercent(position.worstOfPerformancePercent)}.`,
        title: "FCN risk monitor",
      }),
    );
  });

  return cards;
}

function eventDate(event: FcnCouponScheduleEvent) {
  return (
    event.couponDate ??
    event.paymentDate ??
    event.observationEndDate ??
    event.observationStartDate ??
    event.maturityDate ??
    "date unavailable"
  );
}

function eventSeverity(event: FcnCouponScheduleEvent): WorkspaceIntelligenceSeverity {
  if (event.urgency === "overdue") return "critical";
  if (event.urgency === "due_soon" || event.urgency === "upcoming") return "warning";
  return "info";
}

function buildScheduleCards(schedule: FcnPortfolioScheduleSummary): WorkspaceIntelligenceCard[] {
  const cards: WorkspaceIntelligenceCard[] = [];
  const nextCoupon = schedule.next30DayEvents.find((event) => event.eventType === "coupon");
  const nextObservation = schedule.next30DayEvents.find(
    (event) => event.eventType === "observation" || event.eventType === "ko_observation",
  );
  const nextMaturity = schedule.next30DayEvents.find((event) => event.eventType === "maturity");
  const upcomingKo = schedule.next30DayEvents.filter(
    (event) => event.eventType === "ko_observation",
  );

  if (nextCoupon) {
    cards.push(
      card({
        category: "schedule",
        id: `schedule-next-coupon-${nextCoupon.id}`,
        severity: eventSeverity(nextCoupon),
        sourceEngine: "fcn_schedule",
        summary: `${nextCoupon.fcnName} has a coupon-related event on ${eventDate(nextCoupon)}. Amount is ${typeof nextCoupon.expectedCouponAmount === "number" ? formatCurrency(nextCoupon.expectedCouponAmount, nextCoupon.currency ?? "USD") : "not stored"}.`,
        title: "Next coupon event",
      }),
    );
  }

  if (nextObservation) {
    cards.push(
      card({
        category: "schedule",
        id: `schedule-next-observation-${nextObservation.id}`,
        severity: eventSeverity(nextObservation),
        sourceEngine: "fcn_schedule",
        summary: `${nextObservation.fcnName} has ${nextObservation.eventType.replaceAll("_", " ")} on ${eventDate(nextObservation)}.`,
        title: "Next observation event",
      }),
    );
  }

  if (nextMaturity) {
    cards.push(
      card({
        category: "schedule",
        id: `schedule-next-maturity-${nextMaturity.id}`,
        severity: eventSeverity(nextMaturity),
        sourceEngine: "fcn_schedule",
        summary: `${nextMaturity.fcnName} has maturity event on ${eventDate(nextMaturity)}.`,
        title: "Next maturity event",
      }),
    );
  }

  upcomingKo.slice(0, 2).forEach((event) => {
    cards.push(
      card({
        category: "fcn",
        id: `fcn-upcoming-ko-${event.id}`,
        severity: eventSeverity(event),
        sourceEngine: "fcn_schedule",
        summary: `${event.fcnName} has an upcoming KO observation on ${eventDate(event)}.`,
        title: "Upcoming KO observation",
      }),
    );
  });

  return cards;
}

function uniqueSourceEngines(cards: WorkspaceIntelligenceCard[]) {
  return Array.from(
    new Set(cards.map((item) => item.sourceEngine)),
  ).sort((a, b) => a.localeCompare(b)) as WorkspaceIntelligenceSourceEngine[];
}

export function buildWorkspaceIntelligenceReport(
  input: WorkspaceIntelligenceEngineInput,
): WorkspaceIntelligenceReport {
  const cards = [
    ...buildPortfolioCards(input.portfolioValuation),
    ...buildRiskCards(input.portfolioRisk),
    ...buildFcnRiskCards(input.fcnRisk),
    ...buildScheduleCards(input.fcnSchedule),
  ];

  return {
    cardCount: cards.length,
    cards,
    criticalCount: cards.filter((item) => item.severity === "critical").length,
    generatedAt: new Date().toISOString(),
    infoCount: cards.filter((item) => item.severity === "info").length,
    sourceEngines: uniqueSourceEngines(cards),
    warningCount: cards.filter((item) => item.severity === "warning").length,
  };
}
