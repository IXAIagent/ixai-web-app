import type { PortfolioAccount } from "@/src/lib/portfolio/data-model/portfolio-account-types";
import type { PortfolioAsset } from "@/src/lib/portfolio/data-model/portfolio-asset-types";
import type { PortfolioPosition } from "@/src/lib/portfolio/data-model/portfolio-position-types";

export type PortfolioDataModel = {
  accounts: PortfolioAccount[];
  assets: PortfolioAsset[];
  positions: PortfolioPosition[];
};

export function buildPortfolioDataModel({
  accounts,
  assets,
  positions,
}: PortfolioDataModel): PortfolioDataModel {
  return {
    accounts,
    assets,
    positions,
  };
}

export function getPortfolioDataModelCounts(model: PortfolioDataModel) {
  return {
    accounts: model.accounts.length,
    assets: model.assets.length,
    positions: model.positions.length,
  };
}
