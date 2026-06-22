import type { WorkspaceGraph } from "@/src/lib/workspace/graph";
import type {
  WorkspaceHealthDimension,
  WorkspaceHealthScore,
} from "@/src/lib/workspace/health/workspace-health-types";

const DISCLAIMER =
  "Workspace Health is deterministic infrastructure scoring for monitoring only. It is not investment advice, allocation guidance, or a recommendation engine.";

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function dimension(input: WorkspaceHealthDimension): WorkspaceHealthDimension {
  return {
    ...input,
    score: clampScore(input.score),
  };
}

export function buildWorkspaceHealthScore(graph: WorkspaceGraph): WorkspaceHealthScore {
  const warnings: string[] = [];
  const portfolioPositions =
    graph.portfolioPersistence?.summary.totalPositions ??
    graph.portfolioTruth?.counts.totalAssets ??
    0;
  const unavailableValuation = graph.valuation?.summary.sourceStatus === "unavailable";
  const highRiskSignals = graph.risk?.summary.highSignalCount ?? 0;
  const criticalRiskSignals = graph.risk?.summary.criticalSignalCount ?? 0;
  const criticalFcnRisk = graph.fcnRisk?.criticalRiskCount ?? 0;
  const highFcnRisk = graph.fcnRisk?.highRiskCount ?? 0;
  const overdueEvents = graph.fcnSchedule?.overdueEventCount ?? 0;
  const missingMarket =
    (graph.valuation?.summary.unpricedPositionCount ?? 0) +
    (graph.watchlist?.unquotedItemCount ?? 0);
  const intelligenceCards = graph.intelligence?.cardCount ?? 0;

  if (portfolioPositions === 0) warnings.push("No usable portfolio positions are available.");
  if (unavailableValuation) warnings.push("Portfolio valuation is unavailable.");
  if (missingMarket > 0) warnings.push(`${missingMarket} market-linked item(s) lack quote data.`);
  if (criticalRiskSignals > 0) warnings.push("Critical portfolio risk signals are present.");
  if (criticalFcnRisk > 0) warnings.push("Critical FCN risk positions are present.");
  if (overdueEvents > 0) warnings.push("Overdue FCN schedule events are present.");
  if (intelligenceCards === 0) warnings.push("No usable intelligence cards are available.");

  const summaries = [
    dimension({
      key: "portfolioHealth",
      score: 100 - (portfolioPositions === 0 ? 45 : 0),
      summary: `${portfolioPositions} visible position(s) across persistence/truth readback.`,
    }),
    dimension({
      key: "riskHealth",
      score: 100 - criticalRiskSignals * 25 - highRiskSignals * 12,
      summary: `${criticalRiskSignals} critical and ${highRiskSignals} high risk signal(s).`,
    }),
    dimension({
      key: "fcnHealth",
      score: 100 - criticalFcnRisk * 28 - highFcnRisk * 14,
      summary: `${criticalFcnRisk} critical and ${highFcnRisk} high FCN risk position(s).`,
    }),
    dimension({
      key: "marketHealth",
      score: 100 - missingMarket * 10,
      summary: `${missingMarket} missing quote or market-data item(s).`,
    }),
    dimension({
      key: "dataQualityHealth",
      score: 100 - (graph.portfolioTruth?.missingDataWarnings.length ?? 0) * 8,
      summary: `${graph.portfolioTruth?.missingDataWarnings.length ?? 0} truth-layer data warning(s).`,
    }),
    dimension({
      key: "scheduleHealth",
      score: 100 - overdueEvents * 20 - (graph.fcnSchedule?.dueSoonEventCount ?? 0) * 5,
      summary: `${overdueEvents} overdue and ${graph.fcnSchedule?.dueSoonEventCount ?? 0} due-soon FCN event(s).`,
    }),
    dimension({
      key: "intelligenceHealth",
      score: 100 - (intelligenceCards === 0 ? 35 : 0),
      summary: `${intelligenceCards} deterministic intelligence card(s) available.`,
    }),
  ];
  const overallHealth = clampScore(
    summaries.reduce((total, item) => total + item.score, 0) / summaries.length,
  );

  return {
    dataQualityHealth: summaries.find((item) => item.key === "dataQualityHealth")?.score ?? 0,
    fcnHealth: summaries.find((item) => item.key === "fcnHealth")?.score ?? 0,
    generatedAt: new Date().toISOString(),
    informationalOnlyDisclaimer: DISCLAIMER,
    intelligenceHealth: summaries.find((item) => item.key === "intelligenceHealth")?.score ?? 0,
    marketHealth: summaries.find((item) => item.key === "marketHealth")?.score ?? 0,
    overallHealth,
    portfolioHealth: summaries.find((item) => item.key === "portfolioHealth")?.score ?? 0,
    riskHealth: summaries.find((item) => item.key === "riskHealth")?.score ?? 0,
    scheduleHealth: summaries.find((item) => item.key === "scheduleHealth")?.score ?? 0,
    summaries,
    warnings,
  };
}
