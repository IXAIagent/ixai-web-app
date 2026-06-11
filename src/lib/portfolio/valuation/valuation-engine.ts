import type {
  PortfolioValuationInput,
  PortfolioValuationReport,
} from "@/src/lib/portfolio/valuation/valuation-types";

export interface PortfolioValuationEngine {
  generateValuation(input: PortfolioValuationInput): Promise<PortfolioValuationReport>;
}
