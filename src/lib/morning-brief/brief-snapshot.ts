import type { MorningBrief, MorningSnapshot } from "@/src/lib/morning-brief/brief-types";

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

export function buildMorningSnapshot(brief: MorningBrief): MorningSnapshot {
  return {
    brief,
    generatedAt: new Date().toISOString(),
    headline: `Morning Brief Preview · ${brief.date}`,
    readOnly: true,
    sections: [
      {
        label: "Portfolio",
        sourceStatus: brief.portfolioSummary.sourceStatus,
        summary: `${brief.portfolioSummary.positionCount} position(s), ${brief.portfolioSummary.totalKnownNotional ?? "unknown"} known notional.`,
      },
      {
        label: "Risk",
        sourceStatus: brief.riskSummary.sourceStatus,
        summary: `${formatStatus(brief.riskSummary.riskLevel)} risk, score ${brief.riskSummary.riskScore ?? "N/A"}.`,
      },
      {
        label: "FCN",
        sourceStatus: brief.fcnSummary.sourceStatus,
        summary: `${brief.fcnSummary.criticalCount} critical, ${brief.fcnSummary.highRiskCount} high, ${brief.fcnSummary.insufficientDataCount} insufficient-data.`,
      },
      {
        label: "Market Data",
        sourceStatus: brief.marketDataSummary.sourceStatus,
        summary: `${brief.marketDataSummary.quoteCount} placeholder quote(s), provider ${brief.marketDataSummary.providerStatus}.`,
      },
      {
        label: "Live Preview",
        sourceStatus: brief.livePreview?.sourceStatus ?? "unavailable",
        summary: brief.livePreview
          ? `Yahoo preview value ${brief.livePreview.portfolioCurrentValue ?? "unknown"}, risk ${formatStatus(brief.livePreview.riskLevel)}.`
          : "Yahoo live preview not loaded.",
      },
      {
        label: "News",
        sourceStatus: brief.newsSummary.sourceStatus,
        summary: "News provider not configured in V16.",
      },
    ],
  };
}
