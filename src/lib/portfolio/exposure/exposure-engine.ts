import type {
  PortfolioExposureInput,
  PortfolioExposureReport,
} from "@/src/lib/portfolio/exposure/exposure-types";

export interface PortfolioExposureEngine {
  generateExposure(input: PortfolioExposureInput): Promise<PortfolioExposureReport>;
}
