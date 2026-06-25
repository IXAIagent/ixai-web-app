"use client";

import { loadPortfolioTruthReadback } from "@/src/lib/portfolio/truth/portfolio-truth-client";
import { buildLegacyConcentrationRiskSummary } from "@/src/lib/risk/legacy-risk-engine/concentration-risk-engine";
import { buildLegacyExposureRiskSummary } from "@/src/lib/risk/legacy-risk-engine/exposure-risk-engine";
import { buildLegacyFcnRiskSummary } from "@/src/lib/risk/legacy-risk-engine/fcn-risk-engine";
import { buildLegacyPortfolioRiskSummary } from "@/src/lib/risk/legacy-risk-engine/portfolio-risk-engine";
import { buildLegacyRiskEngineDiagnostics } from "@/src/lib/risk/legacy-risk-engine/risk-engine-diagnostics";
import type { LegacyRiskEngineSnapshot } from "@/src/lib/risk/legacy-risk-engine/risk-engine-types";
import type { PortfolioTruthReadback } from "@/src/lib/portfolio/truth/portfolio-truth-types";

const DISCLAIMER =
  "Legacy Risk Engine Migration is monitoring and risk-awareness only. It does not provide investment recommendations, buy/sell instructions, order execution, or return promises.";

export function buildLegacyRiskEngineSnapshot(
  truth: PortfolioTruthReadback | null,
): LegacyRiskEngineSnapshot {
  const portfolioRisk = buildLegacyPortfolioRiskSummary(truth);
  const fcnRisk = buildLegacyFcnRiskSummary(truth?.positions.fcn ?? []);
  const concentrationRisk = buildLegacyConcentrationRiskSummary(truth);
  const exposureRisk = buildLegacyExposureRiskSummary(truth, portfolioRisk);
  const limitations = [
    "No database write is performed by V15 risk calculations.",
    "No broker, trading, AI recommendation, Yahoo, Binance, or Morning Brief migration is included.",
    "FCN analysis uses existing stored/manual prices only; it is not a full FCN pricing engine.",
    "Local draft and Truth Layer fallback behavior remains intact.",
  ];
  const diagnostics = buildLegacyRiskEngineDiagnostics({
    concentrationRisk,
    exposureRisk,
    fcnRisk,
    limitations,
    portfolioRisk,
    truth,
  });

  return {
    concentrationRisk,
    diagnostics,
    exposureRisk,
    fcnRisk,
    generatedAt: new Date().toISOString(),
    informationalOnlyDisclaimer: DISCLAIMER,
    limitations,
    phase: "V15_LEGACY_RISK_ENGINE_MIGRATION",
    portfolioRisk,
  };
}

export async function getWorkspaceLegacyRiskEngineSnapshot(): Promise<LegacyRiskEngineSnapshot> {
  try {
    return buildLegacyRiskEngineSnapshot(await loadPortfolioTruthReadback());
  } catch {
    return buildLegacyRiskEngineSnapshot(null);
  }
}

export function getLegacyRiskEngineDiagnostics() {
  return buildLegacyRiskEngineSnapshot(null).diagnostics;
}
