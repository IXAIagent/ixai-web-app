import { buildIntelligenceConfidence } from "@/src/lib/intelligence/platform/platform-confidence";
import {
  createStableItemId,
  freshnessFromIso,
  normalizeSourceState,
  strongestSourceState,
  uniqueStrings,
} from "@/src/lib/intelligence/platform/platform-normalization";
import {
  healthFromRisk,
  priorityFromSeverity,
  sortIntelligenceItems,
} from "@/src/lib/intelligence/platform/platform-priority";
import type {
  IntelligenceItem,
  IntelligencePlatformContext,
  RiskIntelligenceSnapshot,
} from "@/src/lib/intelligence/platform/platform-types";

function buildRiskItems(context: IntelligencePlatformContext): IntelligenceItem[] {
  const risk = context.portfolioRisk;

  if (!risk || risk.summary.signalCount === 0) {
    return [
      {
        confidence: buildIntelligenceConfidence({
          freshness: "unknown",
          limitations: risk ? [] : ["Portfolio risk read model is unavailable."],
          reasons: risk ? ["No elevated portfolio risk signals were generated."] : ["Risk source did not return a result."],
          score: risk ? 0.65 : 0.2,
          sourceCoverage: [risk ? normalizeSourceState(risk.summary.sourceStatus) : "limited"],
        }),
        domain: "risk",
        freshness: "unknown",
        generatedAt: context.generatedAt,
        health: risk ? "healthy" : "unknown",
        id: "intel:risk:no-elevated-risks",
        limitations: risk ? [] : ["Risk insight is limited until portfolio risk is available."],
        priority: "normal",
        relatedAssetIds: [],
        relatedFcnIds: [],
        relatedSymbols: [],
        sourceState: risk ? normalizeSourceState(risk.summary.sourceStatus) : "limited",
        summary: risk ? "No elevated portfolio risks are currently highlighted." : "Risk intelligence is waiting for portfolio context.",
        title: risk ? "No elevated portfolio risks" : "Risk coverage is limited",
        whatToInspect: risk ? "Continue monitoring concentration, FCN, and market data quality." : "Verify portfolio data and risk read model availability.",
        whyItMatters: "Risk attention helps separate normal movement from issues that deserve review.",
      },
    ];
  }

  return sortIntelligenceItems(
    risk.summary.topSignals.slice(0, 5).map((signal): IntelligenceItem => {
      const sourceState = normalizeSourceState(signal.sourceStatus);
      const freshness = freshnessFromIso(signal.createdAt, context.generatedAt);
      return {
        confidence: buildIntelligenceConfidence({
          freshness,
          reasons: ["Risk item is derived from the existing portfolio risk summary."],
          score: Math.min(1, Math.max(0.3, signal.scoreImpact / 35)),
          sourceCoverage: [sourceState],
        }),
        domain: "risk",
        freshness,
        generatedAt: context.generatedAt,
        health: healthFromRisk(signal.severity),
        id: createStableItemId({
          domain: "risk",
          relatedFcnIds: [],
          relatedSymbols: signal.affectedSymbols,
          title: signal.title,
        }),
        limitations: [],
        priority: priorityFromSeverity(signal.severity),
        relatedAssetIds: [],
        relatedFcnIds: [],
        relatedSymbols: signal.affectedSymbols,
        sourceState,
        summary: signal.message,
        title: signal.title,
        whatToInspect: "Review the affected assets and monitor whether the signal persists.",
        whyItMatters: "This signal can influence what deserves attention today.",
      };
    }),
  );
}

export function buildRiskIntelligenceSnapshot(context: IntelligencePlatformContext): RiskIntelligenceSnapshot {
  const risk = context.portfolioRisk;
  const items = buildRiskItems(context);
  const states = items.map((item) => item.sourceState);

  return {
    confidence: buildIntelligenceConfidence({
      freshness: risk ? freshnessFromIso(risk.summary.updatedAt, context.generatedAt) : "unknown",
      limitations: risk ? [] : ["Portfolio risk source is unavailable."],
      reasons: risk ? ["Risk snapshot reuses the existing portfolio risk result."] : ["No risk result was available."],
      score: risk ? 0.7 : 0.2,
      sourceCoverage: states,
    }),
    criticalCount: risk?.summary.criticalSignalCount ?? 0,
    domain: "risk",
    elevatedCount: (risk?.summary.highSignalCount ?? 0) + (risk?.summary.warningSignalCount ?? 0),
    generatedAt: context.generatedAt,
    health: healthFromRisk(risk?.summary.riskLevel),
    items,
    limitations: risk ? [] : ["Risk intelligence is limited."],
    sourceState: strongestSourceState(states),
    topRiskSymbols: uniqueStrings(risk?.summary.topSignals.flatMap((signal) => signal.affectedSymbols) ?? []),
  };
}
