import type { PortfolioConcentrationReport } from "@/src/lib/portfolio/concentration/concentration-types";
import type { PortfolioCorrelationReport } from "@/src/lib/portfolio/correlation/correlation-types";
import type { PortfolioAsset } from "@/src/lib/portfolio/data-model/portfolio-asset-types";
import type { PortfolioExposureReport } from "@/src/lib/portfolio/exposure/exposure-types";
import type { PortfolioFCNRiskEngine } from "@/src/lib/portfolio/fcn-risk/fcn-risk-engine";
import type { PortfolioFCNRiskReport } from "@/src/lib/portfolio/fcn-risk/fcn-risk-types";
import { mockPortfolioFCNRiskEngine } from "@/src/lib/portfolio/fcn-risk/mock-fcn-risk-engine";
import type { PortfolioStressTestReport } from "@/src/lib/portfolio/stress-test/stress-test-types";

export async function buildPortfolioFCNRiskReport(input: {
  assets: PortfolioAsset[];
  concentrationReport: PortfolioConcentrationReport;
  correlationReport: PortfolioCorrelationReport;
  exposureReport: PortfolioExposureReport;
  fcnRiskEngine?: PortfolioFCNRiskEngine;
  stressTestReport: PortfolioStressTestReport;
}): Promise<PortfolioFCNRiskReport> {
  const engine = input.fcnRiskEngine ?? mockPortfolioFCNRiskEngine;

  return engine.generateFCNRisk({
    assets: input.assets,
    concentrationReport: input.concentrationReport,
    correlationReport: input.correlationReport,
    exposureReport: input.exposureReport,
    stressTestReport: input.stressTestReport,
  });
}
