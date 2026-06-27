import type { FcnPortfolioRiskSummary } from "@/src/lib/fcn/risk/fcn-risk-types";
import type { FcnPortfolioScheduleSummary } from "@/src/lib/fcn/schedule";
import type { PortfolioRiskResult } from "@/src/lib/risk/risk-engine-types";
import type {
  WorkspaceWatchlistSummary,
} from "@/src/lib/watchlist/watchlist-types";
import type {
  WorkspaceAlertCard,
  WorkspaceAlertSummary,
} from "@/src/lib/alerts/alert-types";

const DISCLAIMER =
  "Alerts are UI-only monitoring signals. No push delivery, buy/sell instruction, order execution, or investment recommendation is implemented.";

function now() {
  return new Date().toISOString();
}

function alert(input: Omit<WorkspaceAlertCard, "createdAt">): WorkspaceAlertCard {
  return {
    ...input,
    createdAt: now(),
  };
}

export function buildWorkspaceAlertSummary(input: {
  fcnRisk: FcnPortfolioRiskSummary;
  fcnSchedule: FcnPortfolioScheduleSummary;
  portfolioRisk: PortfolioRiskResult;
  watchlist: WorkspaceWatchlistSummary;
}): WorkspaceAlertSummary {
  const alerts: WorkspaceAlertCard[] = [];

  input.watchlist.items.forEach((item) => {
    const price = item.quote?.quote?.price ?? null;

    if (typeof price !== "number") {
      alerts.push(
        alert({
          category: "data_quality",
          id: `watchlist-missing-price-${item.id}`,
          message: `${item.symbol} does not have an available quote in the current market-service readback.`,
          severity: "info",
          sourceEngine: "watchlist_engine",
          title: "Watchlist quote unavailable",
        }),
      );
      return;
    }

    if (item.quote?.sourceStatus === "fallback") {
      alerts.push(
        alert({
          category: "data_quality",
          id: `watchlist-stale-price-${item.id}`,
          message: `${item.symbol} is using stale or fallback quote data from the current live market snapshot.`,
          severity: "info",
          sourceEngine: "live_market_service",
          title: "Watchlist quote freshness",
        }),
      );
    }

    if (typeof item.alertAbove === "number" && price >= item.alertAbove) {
      alerts.push(
        alert({
          category: "price_above",
          id: `watchlist-price-above-${item.id}`,
          message: `${item.symbol} is at ${price}, above the local alert threshold ${item.alertAbove}.`,
          severity: "warning",
          sourceEngine: "watchlist_engine",
          title: "Watchlist price threshold",
        }),
      );
    }

    if (typeof item.alertBelow === "number" && price <= item.alertBelow) {
      alerts.push(
        alert({
          category: "price_below",
          id: `watchlist-price-below-${item.id}`,
          message: `${item.symbol} is at ${price}, below the local alert threshold ${item.alertBelow}.`,
          severity: "warning",
          sourceEngine: "watchlist_engine",
          title: "Watchlist price threshold",
        }),
      );
    }
  });

  input.portfolioRisk.signals.slice(0, 5).forEach((signal) => {
    alerts.push(
      alert({
        category:
          signal.category === "data_quality" || signal.category === "market_data"
            ? "data_quality"
            : "risk_level",
        id: `risk-${signal.id}`,
        message: signal.message,
        severity: signal.severity === "critical" ? "critical" : signal.severity,
        sourceEngine: "risk_engine",
        title: signal.title,
      }),
    );
  });

  input.fcnRisk.topRiskPositions.slice(0, 5).forEach((position) => {
    if (position.riskLevel === "critical" || position.riskLevel === "high") {
      alerts.push(
        alert({
          category: "fcn_ki_warning",
          id: `fcn-risk-${position.id}`,
          message: `${position.name} is ${position.riskLevel.toUpperCase()} risk. Worst-of: ${position.worstOfSymbol ?? "unknown"}, KI distance: ${position.nearestKiDistancePercent ?? "unknown"}%.`,
          severity: position.riskLevel === "critical" ? "critical" : "high",
          sourceEngine: "fcn_risk_engine",
          title: "FCN risk monitor",
        }),
      );
    }
  });

  input.fcnSchedule.next30DayEvents.slice(0, 5).forEach((event) => {
    alerts.push(
      alert({
        category: "coupon_due",
        id: `fcn-schedule-${event.id}`,
        message: `${event.fcnName} has ${event.eventType.replace("_", " ")} scheduled with ${event.daysUntilEvent ?? "unknown"} day(s) until event.`,
        severity:
          event.urgency === "overdue"
            ? "high"
            : event.urgency === "due_soon"
              ? "warning"
              : "info",
        sourceEngine: "fcn_schedule_engine",
        title: "Upcoming FCN event",
      }),
    );
  });

  return {
    alertCount: alerts.length,
    alerts,
    criticalCount: alerts.filter((item) => item.severity === "critical").length,
    generatedAt: now(),
    highCount: alerts.filter((item) => item.severity === "high").length,
    informationalOnlyDisclaimer: DISCLAIMER,
    warningCount: alerts.filter((item) => item.severity === "warning").length,
  };
}
