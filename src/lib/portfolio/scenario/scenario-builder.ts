import type { PortfolioConcentrationReport } from "@/src/lib/portfolio/concentration/concentration-types";
import type { PortfolioCorrelationReport } from "@/src/lib/portfolio/correlation/correlation-types";
import type { PortfolioExposureReport } from "@/src/lib/portfolio/exposure/exposure-types";
import { mockPortfolioScenarioEngine } from "@/src/lib/portfolio/scenario/mock-scenario-engine";
import type { PortfolioScenarioEngine } from "@/src/lib/portfolio/scenario/scenario-engine";
import type { PortfolioScenarioReport } from "@/src/lib/portfolio/scenario/scenario-types";
import type { PortfolioValuationReport } from "@/src/lib/portfolio/valuation/valuation-types";

export async function buildPortfolioScenarioReport(input: {
  concentrationReport: PortfolioConcentrationReport;
  correlationReport: PortfolioCorrelationReport;
  exposureReport: PortfolioExposureReport;
  scenarioEngine?: PortfolioScenarioEngine;
  valuationReport: PortfolioValuationReport;
}): Promise<PortfolioScenarioReport> {
  const engine = input.scenarioEngine ?? mockPortfolioScenarioEngine;

  return engine.runScenario({
    concentrationReport: input.concentrationReport,
    correlationReport: input.correlationReport,
    exposureReport: input.exposureReport,
    valuationReport: input.valuationReport,
  });
}
