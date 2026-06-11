import type { PortfolioConcentrationReport } from "@/src/lib/portfolio/concentration/concentration-types";
import type { PortfolioCorrelationReport } from "@/src/lib/portfolio/correlation/correlation-types";
import type { PortfolioExposureReport } from "@/src/lib/portfolio/exposure/exposure-types";
import type { PortfolioValuationReport } from "@/src/lib/portfolio/valuation/valuation-types";

export type PortfolioScenarioLevel = "CRITICAL" | "HIGH" | "LOW" | "MEDIUM";

export type PortfolioScenarioType =
  | "CONCENTRATION_SHOCK"
  | "CRYPTO_CORRECTION"
  | "FCN_UNDERLYING_STRESS"
  | "REGIONAL_SHOCK"
  | "TECHNOLOGY_SELLOFF";

export interface PortfolioScenario {
  assumption: string;
  id: string;
  name: string;
  shockPercent: number;
  type: PortfolioScenarioType;
}

export interface PortfolioScenarioResult {
  affectedAssets: string[];
  estimatedImpactPct: number;
  estimatedImpactValue: number;
  level: PortfolioScenarioLevel;
  scenario: PortfolioScenario;
  summary: string;
}

export interface PortfolioScenarioReport {
  alerts: string[];
  averageImpactPct: number;
  generatedAt: string;
  id: string;
  results: PortfolioScenarioResult[];
  scenarioRiskLevel: PortfolioScenarioLevel;
  summary: string;
  totalScenarios: number;
  worstScenario: PortfolioScenarioResult | null;
}

export interface PortfolioScenarioInput {
  concentrationReport: PortfolioConcentrationReport;
  correlationReport: PortfolioCorrelationReport;
  exposureReport: PortfolioExposureReport;
  valuationReport: PortfolioValuationReport;
}
