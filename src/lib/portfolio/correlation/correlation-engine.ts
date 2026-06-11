import type {
  PortfolioCorrelationInput,
  PortfolioCorrelationReport,
} from "@/src/lib/portfolio/correlation/correlation-types";

export interface PortfolioCorrelationEngine {
  generateCorrelation(input: PortfolioCorrelationInput): Promise<PortfolioCorrelationReport>;
}
