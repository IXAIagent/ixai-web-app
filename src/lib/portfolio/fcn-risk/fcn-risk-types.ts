import type { PortfolioConcentrationReport } from "@/src/lib/portfolio/concentration/concentration-types";
import type { PortfolioCorrelationReport } from "@/src/lib/portfolio/correlation/correlation-types";
import type { PortfolioAsset } from "@/src/lib/portfolio/data-model/portfolio-asset-types";
import type { PortfolioExposureReport } from "@/src/lib/portfolio/exposure/exposure-types";
import type { PortfolioStressTestReport } from "@/src/lib/portfolio/stress-test/stress-test-types";

export type PortfolioFCNRiskLevel = "CRITICAL" | "HIGH" | "LOW" | "MEDIUM";

export interface PortfolioFCNRiskPosition {
  assetId: string;
  currency: string;
  name: string;
  region: string;
  symbol: string;
  underlyingCount: number;
  underlyings: string[];
}

export interface PortfolioFCNRiskAlert {
  description: string;
  id: string;
  level: PortfolioFCNRiskLevel;
  title: string;
}

export interface PortfolioFCNRiskReport {
  alerts: PortfolioFCNRiskAlert[];
  correlatedUnderlyingCount: number;
  fcnCount: number;
  fcnExposurePct: number;
  fcnRiskLevel: PortfolioFCNRiskLevel;
  fcnRiskScore: number;
  generatedAt: string;
  id: string;
  positions: PortfolioFCNRiskPosition[];
  repeatedUnderlyingCount: number;
  stressTestSensitivityPct: number;
  summary: string;
  underlyingCount: number;
  worstUnderlyingConcentrationPct: number;
}

export interface PortfolioFCNRiskInput {
  assets: PortfolioAsset[];
  concentrationReport: PortfolioConcentrationReport;
  correlationReport: PortfolioCorrelationReport;
  exposureReport: PortfolioExposureReport;
  stressTestReport: PortfolioStressTestReport;
}
