import type { PortfolioConcentrationReport } from "@/src/lib/portfolio/concentration/concentration-types";
import type { PortfolioExposureReport } from "@/src/lib/portfolio/exposure/exposure-types";

export type PortfolioCorrelationLevel = "CRITICAL" | "HIGH" | "LOW" | "MEDIUM";

export interface PortfolioCorrelationPair {
  leftLabel: string;
  leftSymbol: string;
  level: PortfolioCorrelationLevel;
  rationale: string;
  rightLabel: string;
  rightSymbol: string;
  score: number;
}

export interface PortfolioCorrelationReport {
  alerts: string[];
  correlationScore: number;
  generatedAt: string;
  highCorrelationCount: number;
  id: string;
  level: PortfolioCorrelationLevel;
  lowCorrelationCount: number;
  mediumCorrelationCount: number;
  pairs: PortfolioCorrelationPair[];
  summary: string;
  topCorrelationPairs: PortfolioCorrelationPair[];
}

export interface PortfolioCorrelationInput {
  concentrationReport: PortfolioConcentrationReport;
  exposureReport: PortfolioExposureReport;
}
