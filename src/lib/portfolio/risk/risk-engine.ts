import type {
  PortfolioRiskEngineInput,
  PortfolioRiskReport,
} from "@/src/lib/portfolio/risk/risk-types";

export interface PortfolioRiskEngine {
  generateRiskReport(input: PortfolioRiskEngineInput): Promise<PortfolioRiskReport>;
}
