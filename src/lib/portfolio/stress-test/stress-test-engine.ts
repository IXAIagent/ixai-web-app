import type {
  PortfolioStressTestInput,
  PortfolioStressTestReport,
} from "@/src/lib/portfolio/stress-test/stress-test-types";

export interface PortfolioStressTestEngine {
  runStressTest(input: PortfolioStressTestInput): Promise<PortfolioStressTestReport>;
}
