import type { PortfolioAsset } from "@/src/lib/portfolio/data-model/portfolio-asset-types";

export const mockPortfolioDataModelAssets: PortfolioAsset[] = [
  {
    accountId: "mock-account-manual-fcn",
    category: "FCN",
    createdAt: "2026-06-01T09:00:00.000Z",
    currency: "USD",
    id: "mock-asset-fcn-717n",
    metadata: {
      underlyings: ["MDB", "AFRM", "TSLA"],
    },
    name: "FCN717N",
    region: "US",
    symbol: "FCN717N",
    updatedAt: "2026-06-01T09:00:00.000Z",
  },
  {
    accountId: "mock-account-manual-fcn",
    category: "FCN",
    createdAt: "2026-06-02T09:00:00.000Z",
    currency: "USD",
    id: "mock-asset-fcn-715n",
    metadata: {
      underlyings: ["NVDA", "TSLA", "MDB"],
    },
    name: "FCN715N",
    region: "US",
    symbol: "FCN715N",
    updatedAt: "2026-06-02T09:00:00.000Z",
  },
  {
    accountId: "mock-account-binance",
    category: "GRID",
    createdAt: "2026-06-03T09:00:00.000Z",
    currency: "USDT",
    id: "mock-asset-btc-grid",
    metadata: {
      exchange: "Binance",
    },
    name: "BTC Grid",
    region: "GLOBAL",
    symbol: "BTCUSDT",
    updatedAt: "2026-06-03T09:00:00.000Z",
  },
  {
    accountId: "mock-account-binance",
    category: "GRID",
    createdAt: "2026-06-04T09:00:00.000Z",
    currency: "USDT",
    id: "mock-asset-eth-grid",
    metadata: {
      exchange: "Binance",
    },
    name: "ETH Grid",
    region: "GLOBAL",
    symbol: "ETHUSDT",
    updatedAt: "2026-06-04T09:00:00.000Z",
  },
  {
    accountId: "mock-account-cash",
    category: "CASH",
    createdAt: "2026-06-05T09:00:00.000Z",
    currency: "USDT",
    id: "mock-asset-usdt-cash",
    metadata: {
      source: "Manual",
    },
    name: "USDT Cash",
    region: "GLOBAL",
    symbol: "USDT",
    updatedAt: "2026-06-05T09:00:00.000Z",
  },
];
