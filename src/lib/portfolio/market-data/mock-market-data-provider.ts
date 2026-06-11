import type { PortfolioMarketDataProvider } from "@/src/lib/portfolio/market-data/market-data-provider";
import type { PortfolioMarketSnapshot } from "@/src/lib/portfolio/market-data/market-data-types";

const UPDATED_AT = "2026-06-11T00:00:00.000Z";

const MOCK_SNAPSHOTS: Record<string, Omit<PortfolioMarketSnapshot, "symbol" | "updatedAt">> = {
  AAPL: {
    assetType: "STOCK",
    currency: "USD",
    dailyChangePercent: 0.8,
    marketStatus: "mock_open",
    price: 255,
  },
  AVGO: {
    assetType: "STOCK",
    currency: "USD",
    dailyChangePercent: 1.4,
    marketStatus: "mock_open",
    price: 1840,
  },
  BTC: {
    assetType: "CRYPTO",
    currency: "USD",
    dailyChangePercent: 2.1,
    marketStatus: "mock_open",
    price: 105000,
  },
  ETH: {
    assetType: "CRYPTO",
    currency: "USD",
    dailyChangePercent: 1.2,
    marketStatus: "mock_open",
    price: 5200,
  },
  GOOGL: {
    assetType: "STOCK",
    currency: "USD",
    dailyChangePercent: 0.5,
    marketStatus: "mock_open",
    price: 215,
  },
  MDB: {
    assetType: "STOCK",
    currency: "USD",
    dailyChangePercent: -1.9,
    marketStatus: "mock_open",
    price: 360,
  },
  MSFT: {
    assetType: "STOCK",
    currency: "USD",
    dailyChangePercent: 0.7,
    marketStatus: "mock_open",
    price: 515,
  },
  NVDA: {
    assetType: "STOCK",
    currency: "USD",
    dailyChangePercent: 1.8,
    marketStatus: "mock_open",
    price: 172,
  },
  ORCL: {
    assetType: "STOCK",
    currency: "USD",
    dailyChangePercent: -0.4,
    marketStatus: "mock_open",
    price: 145,
  },
  PLTR: {
    assetType: "STOCK",
    currency: "USD",
    dailyChangePercent: 1.1,
    marketStatus: "mock_open",
    price: 128,
  },
  TSLA: {
    assetType: "STOCK",
    currency: "USD",
    dailyChangePercent: -0.9,
    marketStatus: "mock_open",
    price: 410,
  },
};

export const mockMarketDataProvider: PortfolioMarketDataProvider = {
  async getSnapshots(symbols) {
    return symbols
      .map((symbol) => symbol.trim().toUpperCase())
      .filter((symbol, index, allSymbols) => symbol.length > 0 && allSymbols.indexOf(symbol) === index)
      .flatMap((symbol) => {
        const snapshot = MOCK_SNAPSHOTS[symbol];

        if (!snapshot) {
          return [];
        }

        return [
          {
            ...snapshot,
            symbol,
            updatedAt: UPDATED_AT,
          },
        ];
      });
  },
};
