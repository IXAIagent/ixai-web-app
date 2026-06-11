import type { PortfolioRiskReport } from "@/src/lib/portfolio/risk/risk-types";

export type PortfolioRecommendationCategory =
  | "CASH"
  | "CONCENTRATION"
  | "CRYPTO"
  | "DIVERSIFICATION"
  | "FCN"
  | "GENERAL"
  | "RISK";

export type PortfolioRecommendationSeverity = "HIGH" | "INFO" | "LOW" | "MODERATE";

export type PortfolioRecommendationPriority = "HIGH" | "LOW" | "MEDIUM";

export interface PortfolioRecommendation {
  category: PortfolioRecommendationCategory;
  description: string;
  generatedAt: string;
  id: string;
  priority: PortfolioRecommendationPriority;
  severity: PortfolioRecommendationSeverity;
  title: string;
}

export interface PortfolioRecommendationReport {
  generatedAt: string;
  highPriorityCount: number;
  recommendationCount: number;
  recommendations: PortfolioRecommendation[];
  summary: string;
}

export type PortfolioRecommendationEngineInput = {
  riskReport: PortfolioRiskReport;
};
