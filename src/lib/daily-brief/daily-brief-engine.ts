import type { WorkspaceAlertSummary } from "@/src/lib/alerts";
import type { FcnPortfolioRiskSummary } from "@/src/lib/fcn/risk/fcn-risk-types";
import type { FcnPortfolioScheduleSummary } from "@/src/lib/fcn/schedule";
import type { WorkspaceIntelligenceReport } from "@/src/lib/intelligence/engine/intelligence-types";
import type { PortfolioPersistenceResult } from "@/src/lib/portfolio/persistence";
import type { PortfolioValuationResult } from "@/src/lib/portfolio/valuation/portfolio-valuation-types";
import type { PortfolioRiskResult } from "@/src/lib/risk/risk-engine-types";
import type { WorkspaceWatchlistSummary } from "@/src/lib/watchlist/watchlist-types";
import type {
  WorkspaceDailyBrief,
  WorkspaceDailyBriefSection,
} from "@/src/lib/daily-brief/daily-brief-types";

const DISCLAIMER =
  "Workspace Daily Brief is rule-based and informational only. It does not use AI model calls, external news fetching, recommendations, order execution, or auto trading.";

function formatCurrency(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "unknown";
  }

  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function section(input: WorkspaceDailyBriefSection): WorkspaceDailyBriefSection {
  return input;
}

export function buildWorkspaceDailyBrief(input: {
  alerts: WorkspaceAlertSummary;
  fcnRisk: FcnPortfolioRiskSummary;
  fcnSchedule: FcnPortfolioScheduleSummary;
  intelligence: WorkspaceIntelligenceReport;
  persistence: PortfolioPersistenceResult;
  portfolioRisk: PortfolioRiskResult;
  valuation: PortfolioValuationResult;
  watchlist: WorkspaceWatchlistSummary;
}): WorkspaceDailyBrief {
  const sections: WorkspaceDailyBriefSection[] = [
    section({
      body: `${input.persistence.summary.totalPositions} position(s) are visible across persisted, local, and fallback readback. Estimated market value: ${formatCurrency(input.valuation.summary.totalMarketValue)}.`,
      key: "portfolio_snapshot",
      severity: input.persistence.summary.totalPositions > 0 ? "info" : "warning",
      title: "Portfolio Snapshot",
    }),
    section({
      body: `Risk score is ${input.portfolioRisk.summary.riskScore ?? "unavailable"} with ${input.portfolioRisk.summary.signalCount} signal(s). Top visible signal: ${input.portfolioRisk.summary.topSignals[0]?.title ?? "none"}.`,
      key: "risk_summary",
      severity:
        input.portfolioRisk.summary.riskLevel === "critical" ||
        input.portfolioRisk.summary.riskLevel === "high"
          ? "critical"
          : input.portfolioRisk.summary.signalCount > 0
            ? "warning"
            : "info",
      title: "Risk Summary",
    }),
    section({
      body: `${input.fcnRisk.analyzedPositionCount} FCN position(s) analyzed. Critical: ${input.fcnRisk.criticalRiskCount}; high risk: ${input.fcnRisk.highRiskCount}.`,
      key: "fcn_risk",
      severity:
        input.fcnRisk.criticalRiskCount > 0
          ? "critical"
          : input.fcnRisk.highRiskCount > 0
            ? "warning"
            : "info",
      title: "FCN Risk",
    }),
    section({
      body: `${input.fcnSchedule.next30DayEvents.length} FCN event(s) are visible in the next 30 days. Due soon: ${input.fcnSchedule.dueSoonEventCount}; overdue: ${input.fcnSchedule.overdueEventCount}.`,
      key: "fcn_schedule",
      severity:
        input.fcnSchedule.overdueEventCount > 0
          ? "critical"
          : input.fcnSchedule.dueSoonEventCount > 0
            ? "warning"
            : "info",
      title: "FCN Schedule",
    }),
    section({
      body: `${input.watchlist.itemCount} watchlist item(s), ${input.watchlist.quotedItemCount} with available quotes through Market Service.`,
      key: "watchlist",
      severity: input.watchlist.unquotedItemCount > 0 ? "warning" : "info",
      title: "Watchlist",
    }),
    section({
      body: `${input.alerts.alertCount} monitoring alert card(s). Critical: ${input.alerts.criticalCount}; high: ${input.alerts.highCount}; warning: ${input.alerts.warningCount}.`,
      key: "alerts",
      severity:
        input.alerts.criticalCount > 0
          ? "critical"
          : input.alerts.highCount > 0 || input.alerts.warningCount > 0
            ? "warning"
            : "info",
      title: "Alerts",
    }),
    section({
      body: `${input.intelligence.cardCount} deterministic intelligence card(s) are available from existing engines. No AI model calls are used.`,
      key: "intelligence",
      severity: input.intelligence.criticalCount > 0 ? "critical" : "info",
      title: "Intelligence",
    }),
  ];

  return {
    generatedAt: new Date().toISOString(),
    informationalOnlyDisclaimer: DISCLAIMER,
    sectionCount: sections.length,
    sections,
    summary:
      sections.length > 0
        ? "Workspace Daily Brief combines existing IXAI engines into one rule-based morning readback."
        : "No usable Workspace data is available for a Daily Brief yet.",
  };
}
