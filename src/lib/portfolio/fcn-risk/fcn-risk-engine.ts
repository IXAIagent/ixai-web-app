import type {
  PortfolioFCNRiskInput,
  PortfolioFCNRiskReport,
} from "@/src/lib/portfolio/fcn-risk/fcn-risk-types";

export interface PortfolioFCNRiskEngine {
  generateFCNRisk(input: PortfolioFCNRiskInput): Promise<PortfolioFCNRiskReport>;
}
