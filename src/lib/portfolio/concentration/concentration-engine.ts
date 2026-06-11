import type {
  PortfolioConcentrationInput,
  PortfolioConcentrationReport,
} from "@/src/lib/portfolio/concentration/concentration-types";

export interface PortfolioConcentrationEngine {
  generateConcentration(
    input: PortfolioConcentrationInput,
  ): Promise<PortfolioConcentrationReport>;
}
