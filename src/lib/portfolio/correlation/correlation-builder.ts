import { mockPortfolioCorrelationEngine } from "@/src/lib/portfolio/correlation/mock-correlation-engine";
import type { PortfolioConcentrationReport } from "@/src/lib/portfolio/concentration/concentration-types";
import type { PortfolioCorrelationEngine } from "@/src/lib/portfolio/correlation/correlation-engine";
import type { PortfolioCorrelationReport } from "@/src/lib/portfolio/correlation/correlation-types";
import type { PortfolioExposureReport } from "@/src/lib/portfolio/exposure/exposure-types";

export async function buildPortfolioCorrelation(input: {
  concentrationReport: PortfolioConcentrationReport;
  correlationEngine?: PortfolioCorrelationEngine;
  exposureReport: PortfolioExposureReport;
}): Promise<PortfolioCorrelationReport> {
  const engine = input.correlationEngine ?? mockPortfolioCorrelationEngine;

  return engine.generateCorrelation({
    concentrationReport: input.concentrationReport,
    exposureReport: input.exposureReport,
  });
}
