import type { WorkspaceIntelligenceReportV14 } from "@/src/lib/workspace/intelligence";
import type {
  WorkspaceMorningBrief,
  WorkspaceMorningBriefSection,
  WorkspaceMorningBriefStatus,
} from "@/src/lib/workspace/morning-brief/workspace-brief-types";

const DISCLAIMER =
  "Workspace Morning Brief is generated on demand for Workspace reading only. It is rule-based, explain-only, and does not send notifications, call AI models, provide recommendations, or issue trading instructions.";

function dateKey() {
  return new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Taipei",
    year: "numeric",
  }).format(new Date());
}

function statusFromReport(report: WorkspaceIntelligenceReportV14): WorkspaceMorningBriefStatus {
  if (report.readinessStatus === "ready") return "ready";
  if (report.cardCount === 0) return "unavailable";
  return "partial";
}

function section(input: WorkspaceMorningBriefSection): WorkspaceMorningBriefSection {
  return input;
}

export function buildWorkspaceMorningBrief(input: {
  intelligence: WorkspaceIntelligenceReportV14;
}): WorkspaceMorningBrief {
  const { intelligence } = input;
  const criticalCards = intelligence.cards.filter((card) => card.severity === "critical");
  const watchCards = intelligence.cards.filter(
    (card) => card.severity === "elevated" || card.severity === "watch",
  );
  const sections: WorkspaceMorningBriefSection[] = [
    section({
      dataQuality: intelligence.sourceStatus,
      key: "opening",
      severity: criticalCards.length ? "critical" : watchCards.length ? "watch" : "info",
      source: "workspace_intelligence_engine",
      summary:
        criticalCards.length > 0
          ? `Start with ${criticalCards.length} critical item(s), then review FCN, risk, and data quality context.`
          : watchCards.length > 0
            ? `Start with ${watchCards.length} watch item(s), then review portfolio and FCN context.`
            : "Workspace sources are readable. Review portfolio, market, FCN, and timeline context before taking any separate action.",
      title: "Opening summary",
    }),
    section({
      dataQuality: intelligence.marketSummary.dataQuality,
      key: "market",
      severity: intelligence.sourceStatus === "live" ? "info" : "watch",
      source: intelligence.marketSummary.source,
      summary: intelligence.marketSummary.summary,
      title: "Market snapshot",
    }),
    section({
      dataQuality: intelligence.portfolioSummary.dataQuality,
      key: "portfolio",
      severity: intelligence.cards.find((card) => card.id === "v14-portfolio-summary")?.severity ?? "info",
      source: intelligence.portfolioSummary.source,
      summary: intelligence.portfolioSummary.summary,
      title: "Portfolio snapshot",
    }),
    section({
      dataQuality: intelligence.fcnSummary.dataQuality,
      key: "fcn",
      severity: intelligence.cards.find((card) => card.id === "v14-fcn-summary")?.severity ?? "info",
      source: intelligence.fcnSummary.source,
      summary: intelligence.fcnSummary.summary,
      title: "FCN risk snapshot",
    }),
    section({
      dataQuality: intelligence.watchlistSummary.dataQuality,
      key: "watchlist",
      severity: intelligence.cards.find((card) => card.id === "v14-watchlist-summary")?.severity ?? "info",
      source: intelligence.watchlistSummary.source,
      summary: intelligence.watchlistSummary.summary,
      title: "Watchlist movement",
    }),
    section({
      dataQuality: intelligence.alertSummary.dataQuality,
      key: "risk",
      severity: intelligence.cards.find((card) => card.id === "v14-alert-summary")?.severity ?? "info",
      source: intelligence.alertSummary.source,
      summary: `${intelligence.riskSummary.summary} ${intelligence.alertSummary.summary}`,
      title: "Risk alerts",
    }),
    section({
      dataQuality: intelligence.timelineSummary.dataQuality,
      key: "timeline",
      severity: intelligence.cards.find((card) => card.id === "v14-timeline-summary")?.severity ?? "info",
      source: intelligence.timelineSummary.source,
      summary: intelligence.timelineSummary.summary,
      title: "Timeline / upcoming events",
    }),
    section({
      dataQuality: intelligence.dataQualitySummary.dataQuality,
      key: "data_quality",
      severity: intelligence.sourceStatus === "live" ? "info" : "watch",
      source: intelligence.dataQualitySummary.source,
      summary: intelligence.dataQualitySummary.summary,
      title: "Data quality / missing data",
    }),
    section({
      dataQuality: "live",
      key: "compliance",
      severity: "info",
      source: "ixai_compliance_boundary",
      summary:
        "This brief is monitoring and intelligence workflow context only. No buy/sell/hold, target price, product suitability, automated order, scheduler, or notification delivery is enabled.",
      title: "Compliance note",
    }),
  ];

  return {
    date: dateKey(),
    generatedAt: new Date().toISOString(),
    highlights: intelligence.cards.slice(0, 4).map((card) => `${card.title}: ${card.summary}`),
    informationalOnlyDisclaimer: DISCLAIMER,
    sections,
    sourceStatus: intelligence.sourceStatus,
    status: statusFromReport(intelligence),
    title: `Workspace Morning Brief · ${dateKey()}`,
    warnings: [
      ...criticalCards.map((card) => card.summary),
      ...watchCards.slice(0, 3).map((card) => card.summary),
    ],
  };
}
