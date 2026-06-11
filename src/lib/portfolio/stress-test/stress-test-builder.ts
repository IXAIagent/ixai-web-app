import type { PortfolioConcentrationReport } from "@/src/lib/portfolio/concentration/concentration-types";
import type { PortfolioCorrelationReport } from "@/src/lib/portfolio/correlation/correlation-types";
import type { PortfolioExposureReport } from "@/src/lib/portfolio/exposure/exposure-types";
import type { PortfolioScenarioReport } from "@/src/lib/portfolio/scenario/scenario-types";
import { mockPortfolioStressTestEngine } from "@/src/lib/portfolio/stress-test/mock-stress-test-engine";
import type { PortfolioStressTestEngine } from "@/src/lib/portfolio/stress-test/stress-test-engine";
import type { PortfolioStressTestReport } from "@/src/lib/portfolio/stress-test/stress-test-types";
import type { PortfolioValuationReport } from "@/src/lib/portfolio/valuation/valuation-types";

export async function buildPortfolioStressTestReport(input: {
  concentrationReport: PortfolioConcentrationReport;
  correlationReport: PortfolioCorrelationReport;
  exposureReport: PortfolioExposureReport;
  scenarioReport: PortfolioScenarioReport;
  stressTestEngine?: PortfolioStressTestEngine;
  valuationReport: PortfolioValuationReport;
}): Promise<PortfolioStressTestReport> {
  const engine = input.stressTestEngine ?? mockPortfolioStressTestEngine;

  return engine.runStressTest({
    concentrationReport: input.concentrationReport,
    correlationReport: input.correlationReport,
    exposureReport: input.exposureReport,
    scenarioReport: input.scenarioReport,
    valuationReport: input.valuationReport,
  });
}
