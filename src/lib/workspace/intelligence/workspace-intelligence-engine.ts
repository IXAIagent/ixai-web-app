import type { WorkspaceAlertSummary } from "@/src/lib/alerts";
import type { FcnPortfolioRiskSummary } from "@/src/lib/fcn/risk/fcn-risk-types";
import type { PortfolioValuationResult } from "@/src/lib/portfolio/valuation/portfolio-valuation-types";
import type { PortfolioRiskResult } from "@/src/lib/risk/risk-engine-types";
import type { WorkspaceWatchlistSummary } from "@/src/lib/watchlist/watchlist-types";
import type { WorkspaceTimelineSummary } from "@/src/lib/workspace/timeline";
import type {
  WorkspaceIntelligenceCard,
  WorkspaceIntelligenceDataQuality,
  WorkspaceIntelligenceReadinessStatus,
  WorkspaceIntelligenceReportV14,
  WorkspaceIntelligenceSeverity,
  WorkspaceIntelligenceSummaryBlock,
} from "@/src/lib/workspace/intelligence/workspace-intelligence-types";

const DISCLAIMER =
  "Workspace Intelligence is deterministic, rule-based, and explain-only. It does not call AI models, provide recommendations, set target prices, or issue trading instructions.";

function formatMoney(value: number | null | undefined, currency = "USD") {
  if (typeof value !== "number" || !Number.isFinite(value)) return "unknown";
  return new Intl.NumberFormat("en-US", {
    currency: currency === "USDT" ? "USD" : currency,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function sourceQuality(status: string | null | undefined): WorkspaceIntelligenceDataQuality {
  if (status === "live" || status === "delayed") return "live";
  if (status === "fallback" || status === "stale") return "fallback";
  if (status === "unavailable") return "unavailable";
  return "partial";
}

function statusFromQuality(quality: WorkspaceIntelligenceDataQuality): WorkspaceIntelligenceReadinessStatus {
  if (quality === "live") return "ready";
  if (quality === "unavailable") return "unavailable";
  return "partial";
}

function block(input: WorkspaceIntelligenceSummaryBlock): WorkspaceIntelligenceSummaryBlock {
  return input;
}

function card(input: Omit<WorkspaceIntelligenceCard, "disclaimer" | "generatedAt">): WorkspaceIntelligenceCard {
  return {
    ...input,
    disclaimer: DISCLAIMER,
    generatedAt: new Date().toISOString(),
  };
}

function severityForRiskLevel(level: string | null | undefined): WorkspaceIntelligenceSeverity {
  if (level === "critical") return "critical";
  if (level === "high") return "elevated";
  if (level === "medium") return "watch";
  return "info";
}

function highestReadiness(cards: WorkspaceIntelligenceCard[]): WorkspaceIntelligenceReadinessStatus {
  if (cards.length === 0) return "unavailable";
  if (cards.some((item) => item.dataQuality === "unavailable")) return "partial";
  if (cards.some((item) => item.dataQuality === "fallback" || item.dataQuality === "partial")) {
    return "partial";
  }
  return "ready";
}

export function buildWorkspaceIntelligenceReportV14(input: {
  alerts: WorkspaceAlertSummary | null;
  fcnRisk: FcnPortfolioRiskSummary | null;
  portfolioRisk: PortfolioRiskResult | null;
  portfolioValuation: PortfolioValuationResult | null;
  timeline: WorkspaceTimelineSummary | null;
  watchlist: WorkspaceWatchlistSummary | null;
}): WorkspaceIntelligenceReportV14 {
  const generatedAt = new Date().toISOString();
  const portfolioQuality = sourceQuality(input.portfolioValuation?.summary.sourceStatus);
  const riskQuality = sourceQuality(input.portfolioRisk?.summary.sourceStatus);
  const fcnQuality = sourceQuality(input.fcnRisk?.sourceStatus);
  const watchlistQuality = sourceQuality(input.watchlist?.sourceStatus);
  const timelineQuality: WorkspaceIntelligenceDataQuality = input.timeline ? "partial" : "unavailable";
  const alertQuality: WorkspaceIntelligenceDataQuality = input.alerts ? "partial" : "unavailable";
  const sourceQualities = [
    portfolioQuality,
    riskQuality,
    fcnQuality,
    watchlistQuality,
    timelineQuality,
    alertQuality,
  ];
  const dataQuality: WorkspaceIntelligenceDataQuality = sourceQualities.includes("unavailable")
    ? "partial"
    : sourceQualities.includes("fallback") || sourceQualities.includes("partial")
      ? "partial"
      : "live";
  const cards: WorkspaceIntelligenceCard[] = [
    card({
      dataQuality: portfolioQuality,
      details: [
        `Priced positions: ${input.portfolioValuation?.summary.pricedPositionCount ?? 0}`,
        `Unpriced positions: ${input.portfolioValuation?.summary.unpricedPositionCount ?? 0}`,
      ],
      id: "v14-portfolio-summary",
      severity: input.portfolioValuation?.summary.unpricedPositionCount ? "watch" : "info",
      source: "portfolio_valuation",
      summary: `${input.portfolioValuation?.summary.positionCount ?? 0} visible position(s), estimated value ${formatMoney(input.portfolioValuation?.summary.totalMarketValue, input.portfolioValuation?.currency)}.`,
      title: "Portfolio summary",
      type: "portfolio",
    }),
    card({
      dataQuality: riskQuality,
      details: [
        `Risk score: ${input.portfolioRisk?.summary.riskScore ?? "unavailable"}`,
        `Signals: ${input.portfolioRisk?.summary.signalCount ?? 0}`,
      ],
      id: "v14-risk-summary",
      severity: severityForRiskLevel(input.portfolioRisk?.summary.riskLevel),
      source: "risk_engine",
      summary: `Risk level is ${input.portfolioRisk?.summary.riskLevel ?? "unavailable"} with ${input.portfolioRisk?.summary.criticalSignalCount ?? 0} critical signal(s).`,
      title: "Risk summary",
      type: "risk",
    }),
    card({
      dataQuality: fcnQuality,
      details: [
        `Analyzed FCN positions: ${input.fcnRisk?.analyzedPositionCount ?? 0}`,
        `Unavailable FCN positions: ${input.fcnRisk?.unavailablePositionCount ?? 0}`,
      ],
      id: "v14-fcn-summary",
      severity: input.fcnRisk?.criticalRiskCount ? "critical" : input.fcnRisk?.highRiskCount ? "elevated" : "info",
      source: "fcn_live_risk",
      summary: `${input.fcnRisk?.positionCount ?? 0} FCN position(s), ${input.fcnRisk?.criticalRiskCount ?? 0} critical and ${input.fcnRisk?.highRiskCount ?? 0} elevated risk item(s).`,
      title: "FCN summary",
      type: "fcn",
    }),
    card({
      dataQuality: watchlistQuality,
      details: [
        `Quoted: ${input.watchlist?.quotedItemCount ?? 0}`,
        `Missing quotes: ${input.watchlist?.missingQuoteCount ?? input.watchlist?.unquotedItemCount ?? 0}`,
      ],
      id: "v14-watchlist-summary",
      severity: input.watchlist?.unquotedItemCount ? "watch" : "info",
      source: "watchlist_readback",
      summary: `${input.watchlist?.itemCount ?? 0} watchlist item(s), ${input.watchlist?.quotedItemCount ?? 0} with available quote context.`,
      title: "Watchlist summary",
      type: "watchlist",
    }),
    card({
      dataQuality: alertQuality,
      details: [
        `Critical: ${input.alerts?.criticalCount ?? 0}`,
        `High: ${input.alerts?.highCount ?? 0}`,
        `Warning: ${input.alerts?.warningCount ?? 0}`,
      ],
      id: "v14-alert-summary",
      severity: input.alerts?.criticalCount ? "critical" : input.alerts?.highCount || input.alerts?.warningCount ? "watch" : "info",
      source: "alert_readback",
      summary: `${input.alerts?.alertCount ?? 0} monitoring alert card(s). Delivery remains disabled.`,
      title: "Alert summary",
      type: "alert",
    }),
    card({
      dataQuality: timelineQuality,
      details: input.timeline?.groups.map((group) => `${group.key}: ${group.events.length}`) ?? [
        "Timeline unavailable.",
      ],
      id: "v14-timeline-summary",
      severity: input.timeline?.groups.some((group) => group.key === "overdue" && group.events.length > 0)
        ? "watch"
        : "info",
      source: "workspace_timeline",
      summary: `${input.timeline?.eventCount ?? 0} dated event(s) are visible across FCN schedule and alerts.`,
      title: "Timeline summary",
      type: "timeline",
    }),
    card({
      dataQuality,
      details: sourceQualities.map((quality, index) => `source_${index + 1}: ${quality}`),
      id: "v14-data-quality-summary",
      severity: dataQuality === "partial" ? "watch" : "info",
      source: "workspace_intelligence_engine",
      summary: `Workspace source quality is ${dataQuality}. Missing data degrades to source-labeled fallback rather than blocking the route.`,
      title: "Data quality summary",
      type: "data_quality",
    }),
  ];

  const criticalCount = cards.filter((item) => item.severity === "critical").length;
  const elevatedCount = cards.filter((item) => item.severity === "elevated").length;
  const watchCount = cards.filter((item) => item.severity === "watch").length;
  const readinessStatus = highestReadiness(cards);

  return {
    alertSummary: block({
      dataQuality: alertQuality,
      label: "Alerts",
      source: "alert_readback",
      status: statusFromQuality(alertQuality),
      summary: `${input.alerts?.alertCount ?? 0} monitoring alert card(s), no delivery activation.`,
    }),
    cardCount: cards.length,
    cards,
    criticalCount,
    dataQualitySummary: block({
      dataQuality,
      label: "Data Quality",
      source: "workspace_intelligence_engine",
      status: readinessStatus,
      summary: `Source quality is ${dataQuality}; fallback and unavailable states are visible.`,
    }),
    elevatedCount,
    fcnSummary: block({
      dataQuality: fcnQuality,
      label: "FCN",
      source: "fcn_live_risk",
      status: statusFromQuality(fcnQuality),
      summary: `${input.fcnRisk?.positionCount ?? 0} FCN position(s), ${input.fcnRisk?.criticalRiskCount ?? 0} critical.`,
    }),
    generatedAt,
    informationalOnlyDisclaimer: DISCLAIMER,
    marketSummary: block({
      dataQuality: dataQuality === "live" ? "live" : "partial",
      label: "Market",
      source: "live_market_service",
      status: dataQuality === "live" ? "ready" : "partial",
      summary: "Market context is consumed through existing live valuation, FCN risk, and watchlist quote paths.",
    }),
    portfolioSummary: block({
      dataQuality: portfolioQuality,
      label: "Portfolio",
      source: "portfolio_valuation",
      status: statusFromQuality(portfolioQuality),
      summary: `${input.portfolioValuation?.summary.positionCount ?? 0} visible position(s), ${formatMoney(input.portfolioValuation?.summary.totalMarketValue, input.portfolioValuation?.currency)} estimated value.`,
    }),
    readinessStatus,
    riskSummary: block({
      dataQuality: riskQuality,
      label: "Risk",
      source: "risk_engine",
      status: statusFromQuality(riskQuality),
      summary: `Risk level ${input.portfolioRisk?.summary.riskLevel ?? "unavailable"}, ${input.portfolioRisk?.summary.signalCount ?? 0} signal(s).`,
    }),
    sourceStatus: dataQuality,
    timelineSummary: block({
      dataQuality: timelineQuality,
      label: "Timeline",
      source: "workspace_timeline",
      status: statusFromQuality(timelineQuality),
      summary: `${input.timeline?.eventCount ?? 0} dated event(s) grouped without invented dates.`,
    }),
    watchCount,
    watchlistSummary: block({
      dataQuality: watchlistQuality,
      label: "Watchlist",
      source: "watchlist_readback",
      status: statusFromQuality(watchlistQuality),
      summary: `${input.watchlist?.itemCount ?? 0} item(s), ${input.watchlist?.quotedItemCount ?? 0} quoted.`,
    }),
  };
}
