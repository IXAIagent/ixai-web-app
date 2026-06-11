import type {
  PortfolioScenarioInput,
  PortfolioScenarioReport,
} from "@/src/lib/portfolio/scenario/scenario-types";

export interface PortfolioScenarioEngine {
  runScenario(input: PortfolioScenarioInput): Promise<PortfolioScenarioReport>;
}
