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
  FcnIntelligenceSnapshot,
  IntelligenceItem,
  IntelligencePlatformContext,
} from "@/src/lib/intelligence/platform/platform-types";

function riskPriority(riskLevel: string | undefined) {
  if (riskLevel === "critical") return "urgent";
  if (riskLevel === "high" || riskLevel === "medium") return "high";
  return "normal";
}

function buildFcnItems(context: IntelligencePlatformContext): IntelligenceItem[] {
  const risk = context.fcnRisk;
  const schedule = context.fcnSchedule;

  if (!risk || risk.positionCount === 0) {
    return [
      {
        confidence: buildIntelligenceConfidence({
          freshness: "unknown",
          limitations: ["No FCN positions are available to the platform context."],
          reasons: ["FCN risk summary is empty or unavailable."],
          score: 0.25,
          sourceCoverage: ["limited"],
        }),
        domain: "fcn",
        freshness: "unknown",
        generatedAt: context.generatedAt,
        health: "unknown",
        id: "intel:fcn:no-positions",
        limitations: ["FCN monitoring improves after FCN positions are added."],
        priority: "normal",
        relatedAssetIds: [],
        relatedFcnIds: [],
        relatedSymbols: [],
        sourceState: "limited",
        summary: "FCN intelligence is waiting for FCN positions.",
        title: "FCN coverage is limited",
        whatToInspect: "Add FCN positions or verify FCN sync.",
        whyItMatters: "FCN risk depends on worst-of underlyings, KI distance, observation dates, coupons, and maturity.",
      },
    ];
  }

  const riskItems = risk.topRiskPositions.slice(0, 5).map((position): IntelligenceItem => {
    const sourceState = normalizeSourceState(position.sourceStatus);
    const freshness = freshnessFromIso(position.updatedAt, context.generatedAt);
    const symbols = uniqueStrings([
      position.worstOfSymbol,
      ...position.underlyings.map((underlying) => underlying.symbol),
    ]);

    return {
      confidence: buildIntelligenceConfidence({
        freshness,
        limitations: position.warnings.map((warning) => warning.message),
        reasons: ["FCN item is derived from the existing FCN risk read model."],
        score: position.sourceStatus === "unavailable" ? 0.25 : 0.7,
        sourceCoverage: [sourceState],
      }),
      domain: "fcn",
      freshness,
      generatedAt: context.generatedAt,
      health: healthFromRisk(position.riskLevel),
      id: createStableItemId({
        domain: "fcn",
        relatedFcnIds: [position.id],
        relatedSymbols: symbols,
        title: position.name,
      }),
      limitations: position.warnings.map((warning) => warning.message),
      priority: riskPriority(position.riskLevel),
      relatedAssetIds: [],
      relatedFcnIds: [position.id],
      relatedSymbols: symbols,
      sourceState,
      summary: position.worstOfSymbol
        ? `${position.worstOfSymbol} is the current worst-of underlying.`
        : "Worst-of underlying is not available yet.",
      title: `${position.name} needs FCN review`,
      whatToInspect: "Check worst-of performance, KI distance, observation schedule, and coupon timing.",
      whyItMatters: "FCN outcomes are driven by underlying movement and upcoming observation or coupon dates.",
    };
  });

  const scheduleItems = (schedule?.next30DayEvents ?? []).slice(0, 3).map((event): IntelligenceItem => {
    const sourceState = normalizeSourceState(event.sourceStatus);
    return {
      confidence: buildIntelligenceConfidence({
        freshness: "fresh",
        limitations: event.warningMessage ? [event.warningMessage] : [],
        reasons: ["FCN schedule event comes from the existing schedule summary."],
        score: event.sourceStatus === "unavailable" ? 0.25 : 0.75,
        sourceCoverage: [sourceState],
      }),
      domain: "fcn",
      freshness: "fresh",
      generatedAt: context.generatedAt,
      health: event.urgency === "overdue" || event.urgency === "due_soon" ? "elevated" : "healthy",
      id: createStableItemId({
        domain: "fcn",
        relatedFcnIds: [event.fcnId],
        relatedSymbols: [],
        title: event.id,
      }),
      limitations: event.warningMessage ? [event.warningMessage] : [],
      priority: priorityFromSeverity(event.urgency === "overdue" || event.urgency === "due_soon" ? "warning" : "info"),
      relatedAssetIds: [],
      relatedFcnIds: [event.fcnId],
      relatedSymbols: [],
      sourceState,
      summary: `${event.fcnName} has an upcoming ${event.eventType.replace(/_/g, " ")} event.`,
      title: "Upcoming FCN event",
      whatToInspect: "Review the event date and related FCN position.",
      whyItMatters: "FCN calendar events can determine whether a position needs closer monitoring.",
    };
  });

  return sortIntelligenceItems([...riskItems, ...scheduleItems]);
}

export function buildFcnIntelligenceSnapshot(context: IntelligencePlatformContext): FcnIntelligenceSnapshot {
  const items = buildFcnItems(context);
  const risk = context.fcnRisk;
  const schedule = context.fcnSchedule;
  const states = items.map((item) => item.sourceState);

  return {
    confidence: buildIntelligenceConfidence({
      freshness: risk ? freshnessFromIso(risk.updatedAt, context.generatedAt) : "unknown",
      limitations: risk?.summaries.flatMap((summary) => summary.warnings.map((warning) => warning.message)).slice(0, 5) ?? [],
      reasons: risk ? ["FCN snapshot reuses FCN risk and schedule read models."] : ["FCN risk source is unavailable."],
      score: risk ? Math.max(0.25, risk.analyzedPositionCount / Math.max(1, risk.positionCount)) : 0.25,
      sourceCoverage: states,
    }),
    domain: "fcn",
    fcnCount: risk?.positionCount ?? 0,
    generatedAt: context.generatedAt,
    health: risk?.criticalRiskCount ? "critical" : risk?.highRiskCount ? "elevated" : risk ? "healthy" : "unknown",
    items,
    limitations: risk ? [] : ["FCN intelligence is limited."],
    observationEventCount: schedule?.next30DayEvents.length ?? 0,
    sourceState: strongestSourceState(states),
    topRiskFcnIds: risk?.topRiskPositions.map((position) => position.id) ?? [],
  };
}
