import { FcnRequestError, listFCNPositions } from "@/src/lib/fcn/server";
import { PortfolioRequestError, listPortfolios } from "@/src/lib/portfolio/server";
import { PositionRequestError } from "@/src/lib/positions/supabase";
import { listCryptoPositions } from "@/src/lib/crypto/server";
import { listStockPositions } from "@/src/lib/stock/server";
import type { CryptoPosition } from "@/src/types/crypto-position";
import type { Portfolio } from "@/src/types/portfolio";
import type { StockPosition } from "@/src/types/stock-position";

export type PortfolioDashboardRiskStatus = "clear" | "watch" | "elevated";
export type PortfolioDashboardState = "ready" | "unauthenticated" | "error";

export type PortfolioDashboardSummary = {
  state: PortfolioDashboardState;
  portfolioCount: number;
  fcnCount: number;
  stockCount: number;
  cryptoCount: number;
  totalNotionalApprox: number;
  stockMarketValueApprox: number;
  fcnNotionalApprox: number;
  cryptoMarketValueApprox: number;
  fcnUnderlyingCount: number;
  cryptoGridCount: number;
  cryptoDualCount: number;
  incompleteValuationCount: number;
  highLevelRiskStatus: PortfolioDashboardRiskStatus;
  portfolios: Pick<Portfolio, "baseCurrency" | "id" | "name" | "status">[];
  generatedAt: string;
};

const EMPTY_SUMMARY: PortfolioDashboardSummary = {
  cryptoCount: 0,
  cryptoDualCount: 0,
  cryptoGridCount: 0,
  cryptoMarketValueApprox: 0,
  fcnCount: 0,
  fcnNotionalApprox: 0,
  fcnUnderlyingCount: 0,
  generatedAt: "",
  highLevelRiskStatus: "clear",
  incompleteValuationCount: 0,
  portfolioCount: 0,
  portfolios: [],
  state: "ready",
  stockCount: 0,
  stockMarketValueApprox: 0,
  totalNotionalApprox: 0,
};

function valueOrZero(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function calculateStockMarketValue(position: StockPosition) {
  return valueOrZero(position.quantity) * valueOrZero(position.currentPrice);
}

function calculateCryptoMarketValue(position: CryptoPosition) {
  return valueOrZero(position.quantity) * valueOrZero(position.currentPrice);
}

function isCryptoGrid(position: CryptoPosition) {
  return position.positionType === "grid" || position.strategyType === "grid" || position.strategyType === "futures_grid";
}

function isCryptoDual(position: CryptoPosition) {
  return position.positionType === "dual" || position.strategyType === "dual";
}

function calculateRiskStatus(input: {
  activePositions: number;
  cryptoDualCount: number;
  cryptoGridCount: number;
  fcnCount: number;
  fcnUnderlyingCount: number;
  incompleteValuationCount: number;
}): PortfolioDashboardRiskStatus {
  if (input.activePositions === 0) {
    return "clear";
  }

  if (
    input.fcnCount >= 3 ||
    input.fcnUnderlyingCount >= 8 ||
    input.cryptoGridCount + input.cryptoDualCount >= 2 ||
    input.incompleteValuationCount >= 5
  ) {
    return "elevated";
  }

  return "watch";
}

function isAuthError(error: unknown) {
  return (
    (error instanceof PortfolioRequestError ||
      error instanceof FcnRequestError ||
      error instanceof PositionRequestError) &&
    error.status === 401
  );
}

function isStorageConfigError(error: unknown) {
  return (
    (error instanceof PortfolioRequestError ||
      error instanceof FcnRequestError ||
      error instanceof PositionRequestError) &&
    error.status === 503
  );
}

export async function getPortfolioDashboardSummary(
  authorizationHeader: string | null,
): Promise<PortfolioDashboardSummary> {
  try {
    const [portfolios, fcnPositions, stockPositions, cryptoPositions] = await Promise.all([
      listPortfolios(authorizationHeader),
      listFCNPositions(authorizationHeader),
      listStockPositions(authorizationHeader),
      listCryptoPositions(authorizationHeader),
    ]);

    const activeFcns = fcnPositions.filter((position) => position.status === "active");
    const activeStocks = stockPositions.filter((position) => position.status === "active");
    const activeCrypto = cryptoPositions.filter((position) => position.status === "active");

    const fcnNotionalApprox = activeFcns.reduce(
      (sum, position) => sum + valueOrZero(position.notionalAmount),
      0,
    );
    const stockMarketValueApprox = activeStocks.reduce(
      (sum, position) => sum + calculateStockMarketValue(position),
      0,
    );
    const cryptoMarketValueApprox = activeCrypto.reduce(
      (sum, position) => sum + calculateCryptoMarketValue(position),
      0,
    );
    const fcnUnderlyingCount = activeFcns.reduce(
      (sum, position) => sum + position.underlyings.length,
      0,
    );
    const cryptoGridCount = activeCrypto.filter(isCryptoGrid).length;
    const cryptoDualCount = activeCrypto.filter(isCryptoDual).length;
    const incompleteValuationCount =
      activeFcns.filter((position) => !position.notionalAmount).length +
      activeStocks.filter((position) => !position.currentPrice).length +
      activeCrypto.filter((position) => !position.currentPrice).length;
    const activePositions = activeFcns.length + activeStocks.length + activeCrypto.length;

    return {
      cryptoCount: activeCrypto.length,
      cryptoDualCount,
      cryptoGridCount,
      cryptoMarketValueApprox,
      fcnCount: activeFcns.length,
      fcnNotionalApprox,
      fcnUnderlyingCount,
      generatedAt: new Date().toISOString(),
      highLevelRiskStatus: calculateRiskStatus({
        activePositions,
        cryptoDualCount,
        cryptoGridCount,
        fcnCount: activeFcns.length,
        fcnUnderlyingCount,
        incompleteValuationCount,
      }),
      incompleteValuationCount,
      portfolioCount: portfolios.length,
      portfolios: portfolios.map((portfolio) => ({
        baseCurrency: portfolio.baseCurrency,
        id: portfolio.id,
        name: portfolio.name,
        status: portfolio.status,
      })),
      state: "ready",
      stockCount: activeStocks.length,
      stockMarketValueApprox,
      totalNotionalApprox: fcnNotionalApprox + stockMarketValueApprox + cryptoMarketValueApprox,
    };
  } catch (error) {
    if (isAuthError(error)) {
      return {
        ...EMPTY_SUMMARY,
        generatedAt: new Date().toISOString(),
        state: "unauthenticated",
      };
    }

    if (isStorageConfigError(error)) {
      return {
        ...EMPTY_SUMMARY,
        generatedAt: new Date().toISOString(),
        state: "error",
      };
    }

    return {
      ...EMPTY_SUMMARY,
      generatedAt: new Date().toISOString(),
      state: "error",
    };
  }
}
