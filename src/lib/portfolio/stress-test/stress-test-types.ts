import type { PortfolioConcentrationReport } from "@/src/lib/portfolio/concentration/concentration-types";
import type { PortfolioCorrelationReport } from "@/src/lib/portfolio/correlation/correlation-types";
import type { PortfolioExposureReport } from "@/src/lib/portfolio/exposure/exposure-types";
import type { PortfolioScenarioReport } from "@/src/lib/portfolio/scenario/scenario-types";
import type { PortfolioValuationReport } from "@/src/lib/portfolio/valuation/valuation-types";

export type PortfolioStressTestLevel = "CRITICAL" | "HIGH" | "LOW" | "MEDIUM";

export type PortfolioStressTestType =
  | "CONCENTRATION_BREAKDOWN"
  | "CRYPTO_CRASH"
  | "FCN_WORST_OF_SHOCK"
  | "GLOBAL_EQUITY_SHOCK"
  | "HIGH_CORRELATION_SHOCK"
  | "REGIONAL_CRISIS";

export interface PortfolioStressTestCase {
  assumption: string;
  id: string;
  name: string;
  shockPercent: number;
  type: PortfolioStressTestType;
}

export interface PortfolioStressTestResult {
  affectedExposure: string[];
  estimatedImpactPct: number;
  estimatedImpactValue: number;
  level: PortfolioStressTestLevel;
  stressTest: PortfolioStressTestCase;
  summary: string;
}

export interface PortfolioStressTestReport {
  alerts: string[];
  averageStressImpactPct: number;
  capitalPreservationWarning: string;
  generatedAt: string;
  id: string;
  results: PortfolioStressTestResult[];
  stressRiskLevel: PortfolioStressTestLevel;
  summary: string;
  totalStressTests: number;
  worstStressTest: PortfolioStressTestResult | null;
}

export interface PortfolioStressTestInput {
  concentrationReport: PortfolioConcentrationReport;
  correlationReport: PortfolioCorrelationReport;
  exposureReport: PortfolioExposureReport;
  scenarioReport: PortfolioScenarioReport;
  valuationReport: PortfolioValuationReport;
}
