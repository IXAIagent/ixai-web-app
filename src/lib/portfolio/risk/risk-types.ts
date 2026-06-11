import type { PortfolioAccount } from "@/src/lib/portfolio/data-model/portfolio-account-types";
import type { PortfolioAsset } from "@/src/lib/portfolio/data-model/portfolio-asset-types";
import type { PortfolioPosition } from "@/src/lib/portfolio/data-model/portfolio-position-types";

export type PortfolioRiskLevel = "CRITICAL" | "HIGH" | "LOW" | "MODERATE";

export interface PortfolioRiskReport {
  alerts: string[];
  cashBufferRisk: PortfolioRiskLevel;
  concentrationRisk: PortfolioRiskLevel;
  cryptoRisk: PortfolioRiskLevel;
  diversificationRisk: PortfolioRiskLevel;
  fcnRisk: PortfolioRiskLevel;
  generatedAt: string;
  overallRisk: PortfolioRiskLevel;
  riskScore: number;
  summary: string;
}

export type PortfolioRiskEngineInput = {
  accounts: PortfolioAccount[];
  assets: PortfolioAsset[];
  positions: PortfolioPosition[];
};
