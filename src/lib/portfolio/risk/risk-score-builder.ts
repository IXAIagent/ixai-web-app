import type { PortfolioAccount } from "@/src/lib/portfolio/data-model/portfolio-account-types";
import type { PortfolioAsset } from "@/src/lib/portfolio/data-model/portfolio-asset-types";
import type { PortfolioPosition } from "@/src/lib/portfolio/data-model/portfolio-position-types";
import type { PortfolioRiskEngine } from "@/src/lib/portfolio/risk/risk-engine";
import type { PortfolioRiskReport } from "@/src/lib/portfolio/risk/risk-types";
import { mockPortfolioRiskEngine } from "@/src/lib/portfolio/risk/mock-risk-engine";

export async function buildPortfolioRiskReport(input: {
  accounts: PortfolioAccount[];
  assets: PortfolioAsset[];
  positions: PortfolioPosition[];
  riskEngine?: PortfolioRiskEngine;
}): Promise<PortfolioRiskReport> {
  const engine = input.riskEngine ?? mockPortfolioRiskEngine;

  return engine.generateRiskReport({
    accounts: input.accounts,
    assets: input.assets,
    positions: input.positions,
  });
}
