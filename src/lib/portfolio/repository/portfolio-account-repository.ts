import type { PortfolioAccount } from "@/src/lib/portfolio/data-model/portfolio-account-types";

export type PortfolioAccountRepository = {
  getAccounts(): Promise<PortfolioAccount[]>;
};
