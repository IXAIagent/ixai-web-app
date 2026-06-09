import type { FCNExposureSummary, FCNWorstOfRankingItem } from "@/src/lib/fcn/risk-score";

export type FCNIntelligenceRiskBand = "High Risk" | "Low Risk" | "Moderate Risk";

export type FCNIntelligenceSummary = {
  complianceNote: "Monitoring and risk-awareness only. Not investment advice.";
  concentrationNarrative: string;
  nearKiNarrative: string;
  riskBand: FCNIntelligenceRiskBand;
  riskNarrative: string;
  worstOfNarrative: string;
};

const COMPLIANCE_NOTE = "Monitoring and risk-awareness only. Not investment advice." as const;

function formatSymbols(symbols: Array<string | null | undefined>) {
  const cleaned = symbols
    .map((symbol) => symbol?.trim().toUpperCase())
    .filter((symbol): symbol is string => Boolean(symbol));

  if (cleaned.length === 0) {
    return "no completed symbol set";
  }

  if (cleaned.length === 1) {
    return cleaned[0];
  }

  return `${cleaned.slice(0, -1).join(", ")} and ${cleaned.at(-1)}`;
}

export function buildRiskNarrative(input: {
  nearKiCount: number;
  riskScore: number;
}): { riskBand: FCNIntelligenceRiskBand; text: string } {
  if (input.riskScore >= 70 || input.nearKiCount >= 3) {
    return {
      riskBand: "High Risk",
      text:
        "Portfolio FCN risk is high because several stored positions or underlyings show elevated pressure near KI thresholds.",
    };
  }

  if (input.riskScore >= 35 || input.nearKiCount > 0) {
    return {
      riskBand: "Moderate Risk",
      text:
        "Portfolio FCN risk is moderate because part of the stored FCN set requires closer monitoring around KI distance and worst-of movement.",
    };
  }

  return {
    riskBand: "Low Risk",
    text:
      "Portfolio FCN risk is low based on the currently stored manual prices, with no near-KI concentration detected.",
  };
}

export function buildWorstOfNarrative(worstOfRanking: FCNWorstOfRankingItem[]) {
  const weakestSymbols = formatSymbols(
    worstOfRanking.slice(0, 3).map((item) => item.underlyingSymbol),
  );

  if (worstOfRanking.length === 0) {
    return "Worst-of interpretation is waiting for complete initial and current prices across FCN underlyings.";
  }

  return `Current weakest underlyings are ${weakestSymbols}, based on stored return calculations across FCN positions.`;
}

export function buildConcentrationNarrative(exposureSummary: FCNExposureSummary[]) {
  const concentrated = exposureSummary.filter((item) => item.count > 1).slice(0, 3);

  if (concentrated.length === 0) {
    return "Portfolio FCN exposure is not concentrated in repeated underlyings based on the current stored data.";
  }

  return `Portfolio exposure is concentrated in ${formatSymbols(
    concentrated.map((item) => item.underlyingSymbol),
  )}, based on repeated FCN underlying appearances.`;
}

export function buildNearKiNarrative(nearKiCount: number) {
  if (nearKiCount <= 0) {
    return "No stored FCN underlyings are currently near KI thresholds based on available manual prices.";
  }

  if (nearKiCount === 1) {
    return "1 FCN underlying is currently near its KI threshold and should remain on the monitoring list.";
  }

  return `${nearKiCount} FCN underlyings are currently near KI thresholds and should remain on the monitoring list.`;
}

export function buildFcnIntelligenceSummary(input: {
  exposureSummary: FCNExposureSummary[];
  nearKiCount: number;
  riskScore: number;
  worstOfRanking: FCNWorstOfRankingItem[];
}): FCNIntelligenceSummary {
  const risk = buildRiskNarrative({
    nearKiCount: input.nearKiCount,
    riskScore: input.riskScore,
  });

  return {
    complianceNote: COMPLIANCE_NOTE,
    concentrationNarrative: buildConcentrationNarrative(input.exposureSummary),
    nearKiNarrative: buildNearKiNarrative(input.nearKiCount),
    riskBand: risk.riskBand,
    riskNarrative: risk.text,
    worstOfNarrative: buildWorstOfNarrative(input.worstOfRanking),
  };
}
