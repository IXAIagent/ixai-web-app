import { mockPortfolioConcentrationEngine } from "@/src/lib/portfolio/concentration/mock-concentration-engine";
import type { PortfolioConcentrationEngine } from "@/src/lib/portfolio/concentration/concentration-engine";
import type { PortfolioConcentrationReport } from "@/src/lib/portfolio/concentration/concentration-types";
import type { PortfolioExposureReport } from "@/src/lib/portfolio/exposure/exposure-types";

export async function buildPortfolioConcentration(input: {
  concentrationEngine?: PortfolioConcentrationEngine;
  exposureReport: PortfolioExposureReport;
}): Promise<PortfolioConcentrationReport> {
  const engine = input.concentrationEngine ?? mockPortfolioConcentrationEngine;

  return engine.generateConcentration({
    exposureReport: input.exposureReport,
  });
}
