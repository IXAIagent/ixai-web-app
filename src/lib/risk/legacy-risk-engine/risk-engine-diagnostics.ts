import type { PortfolioTruthReadback } from "@/src/lib/portfolio/truth/portfolio-truth-types";
import type {
  LegacyConcentrationRiskSummary,
  LegacyExposureRiskSummary,
  LegacyFcnRiskSummary,
  LegacyPortfolioRiskSummary,
  LegacyRiskEngineDiagnostics,
} from "@/src/lib/risk/legacy-risk-engine/risk-engine-types";

export function buildLegacyRiskEngineDiagnostics(input: {
  concentrationRisk: LegacyConcentrationRiskSummary;
  exposureRisk: LegacyExposureRiskSummary;
  fcnRisk: LegacyFcnRiskSummary;
  limitations: string[];
  portfolioRisk: LegacyPortfolioRiskSummary;
  truth: PortfolioTruthReadback | null;
}): LegacyRiskEngineDiagnostics {
  return {
    actionableTradingInstructions: false,
    calculationOnly: true,
    dataSource: "portfolio_truth_layer",
    dbWritesEnabled: false,
    fallbackPreserved: true,
    generatedAt: new Date().toISOString(),
    inputReadiness: input.truth?.readinessLevel ?? "unavailable",
    limitationCount: input.limitations.length,
    modules: [
      { name: "Portfolio Risk", sourceStatus: input.portfolioRisk.sourceStatus },
      { name: "FCN Worst-of Risk", sourceStatus: input.fcnRisk.sourceStatus },
      { name: "Concentration Risk", sourceStatus: input.concentrationRisk.sourceStatus },
      { name: "Exposure Risk", sourceStatus: input.exposureRisk.sourceStatus },
    ],
    phase: "V15_LEGACY_RISK_ENGINE_MIGRATION",
    recommendationLogicEnabled: false,
  };
}
