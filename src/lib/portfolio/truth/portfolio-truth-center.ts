import type {
  BuildPortfolioTruthInput,
  PortfolioTruthDataSourceStatus,
  PortfolioTruthReadback,
  PortfolioTruthReadinessLevel,
  PortfolioTruthSourceStatus,
} from "@/src/lib/portfolio/truth/portfolio-truth-types";
import type { CryptoPosition } from "@/src/types/crypto-position";
import type { StockPosition } from "@/src/types/stock-position";

function isFiniteNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value);
}

function normalizeSymbol(symbol: string | null | undefined) {
  return (symbol ?? "").trim().toUpperCase();
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values.map(normalizeSymbol).filter(Boolean))).sort(
    (a, b) => a.localeCompare(b),
  );
}

function calculateKnownPositionValue(input: {
  averageCost: number | null;
  currentPrice: number | null;
  quantity: number;
}) {
  const price = isFiniteNumber(input.currentPrice)
    ? input.currentPrice
    : input.averageCost;

  if (!isFiniteNumber(price) || !isFiniteNumber(input.quantity)) {
    return null;
  }

  return input.quantity * Number(price);
}

function isCryptoGrid(position: CryptoPosition) {
  return (
    position.positionType === "grid" ||
    position.strategyType === "grid" ||
    position.strategyType === "futures_grid"
  );
}

function isCryptoDual(position: CryptoPosition) {
  return position.positionType === "dual" || position.strategyType === "dual";
}

function sumKnownStockValue(positions: StockPosition[]) {
  return positions.reduce((total, position) => {
    const value = calculateKnownPositionValue(position);
    return value === null ? total : total + value;
  }, 0);
}

function sumKnownCryptoValue(positions: CryptoPosition[]) {
  return positions.reduce((total, position) => {
    const value = calculateKnownPositionValue(position);
    return value === null ? total : total + value;
  }, 0);
}

function countIncompleteKnownValue(
  positions: Array<{
    averageCost: number | null;
    currentPrice: number | null;
    quantity: number;
  }>,
) {
  return positions.filter(
    (position) => calculateKnownPositionValue(position) === null,
  ).length;
}

function getSourceStatus(input: {
  count: number;
  error?: boolean;
  incompleteCount?: number;
  unauthenticated?: boolean;
}): PortfolioTruthSourceStatus {
  if (input.unauthenticated) {
    return "unauthenticated";
  }

  if (input.error) {
    return "unavailable";
  }

  if (input.count > 0 && (input.incompleteCount ?? 0) > 0) {
    return "partial";
  }

  if (input.count > 0) {
    return "ready";
  }

  return "placeholder";
}

function getDashboardStatus(input: {
  error?: boolean;
  hasSummary: boolean;
  unauthenticated?: boolean;
}): PortfolioTruthSourceStatus {
  if (input.unauthenticated) {
    return "unauthenticated";
  }

  if (input.error) {
    return "unavailable";
  }

  return input.hasSummary ? "ready" : "placeholder";
}

function getReadinessLevel(
  statuses: PortfolioTruthDataSourceStatus[],
): PortfolioTruthReadinessLevel {
  if (statuses.every((source) => source.status === "unauthenticated")) {
    return "unauthenticated";
  }

  if (statuses.some((source) => source.status === "ready")) {
    return statuses.some((source) => source.status === "partial")
      ? "partial"
      : "ready";
  }

  if (statuses.some((source) => source.status === "partial")) {
    return "partial";
  }

  if (statuses.some((source) => source.status === "unavailable")) {
    return "unavailable";
  }

  return "placeholder";
}

export function buildPortfolioTruthReadback(
  input: BuildPortfolioTruthInput,
): PortfolioTruthReadback {
  const fcnNotional = input.fcnPositions.reduce(
    (total, position) =>
      isFiniteNumber(position.notionalAmount)
        ? total + Number(position.notionalAmount)
        : total,
    0,
  );
  const stockNotionalKnown = sumKnownStockValue(input.stockPositions);
  const cryptoNotionalKnown = sumKnownCryptoValue(input.cryptoPositions);
  const totalKnownNotional =
    fcnNotional + stockNotionalKnown + cryptoNotionalKnown;
  const incompleteStockValueCount = countIncompleteKnownValue(
    input.stockPositions,
  );
  const incompleteCryptoValueCount = countIncompleteKnownValue(
    input.cryptoPositions,
  );
  const missingFcnNotionalCount = input.fcnPositions.filter(
    (position) => !isFiniteNumber(position.notionalAmount),
  ).length;

  const counts = {
    totalAssets:
      input.fcnPositions.length +
      input.stockPositions.length +
      input.cryptoPositions.length,
    totalCryptoPositions: input.cryptoPositions.length,
    totalDualPositions: input.cryptoPositions.filter(isCryptoDual).length,
    totalFcnPositions: input.fcnPositions.length,
    totalGridPositions: input.cryptoPositions.filter(isCryptoGrid).length,
    totalStockPositions: input.stockPositions.length,
  };

  const underlyingSymbols = uniqueSorted(
    input.fcnPositions.flatMap((position) =>
      position.underlyings.map((underlying) => underlying.symbol),
    ),
  );
  const stockSymbols = uniqueSorted(
    input.stockPositions.map((position) => position.symbol),
  );
  const cryptoSymbols = uniqueSorted(
    input.cryptoPositions.map((position) => position.symbol),
  );

  const dataSourceStatuses: PortfolioTruthDataSourceStatus[] = [
    {
      key: "fcn",
      label: "FCN API",
      note:
        input.fcnPositions.length > 0
          ? "Persisted FCN positions are included in the shared truth layer."
          : "No FCN positions are available from the current user readback.",
      status: getSourceStatus({
        count: input.fcnPositions.length,
        error: input.fcnError,
        incompleteCount: missingFcnNotionalCount,
        unauthenticated: input.unauthenticated,
      }),
    },
    {
      key: "stock",
      label: "Stock API",
      note:
        input.stockPositions.length > 0
          ? "Stock positions are included when readback is available."
          : "Stock position readback is ready for future records.",
      status: getSourceStatus({
        count: input.stockPositions.length,
        error: input.stockError,
        incompleteCount: incompleteStockValueCount,
        unauthenticated: input.unauthenticated,
      }),
    },
    {
      key: "crypto",
      label: "Crypto API",
      note:
        input.cryptoPositions.length > 0
          ? "Crypto, Grid, and Dual records are included when present."
          : "Crypto position readback is ready for future records.",
      status: getSourceStatus({
        count: input.cryptoPositions.length,
        error: input.cryptoError,
        incompleteCount: incompleteCryptoValueCount,
        unauthenticated: input.unauthenticated,
      }),
    },
    {
      key: "portfolioDashboard",
      label: "Portfolio Dashboard",
      note: input.portfolioDashboardSummary
        ? "Existing dashboard summary remains available as a supporting source."
        : "Portfolio dashboard summary did not return a usable readback.",
      status: getDashboardStatus({
        error: input.portfolioDashboardError,
        hasSummary: Boolean(input.portfolioDashboardSummary),
        unauthenticated: input.unauthenticated,
      }),
    },
  ];

  const missingDataWarnings = [
    input.unauthenticated
      ? "Sign in is required before the shared Portfolio Truth Layer can read user positions."
      : "",
    counts.totalAssets === 0 && !input.unauthenticated
      ? "No FCN, Stock, or Crypto positions are available from the current readback."
      : "",
    missingFcnNotionalCount > 0
      ? `${missingFcnNotionalCount} FCN position(s) are missing notional amount.`
      : "",
    incompleteStockValueCount > 0
      ? `${incompleteStockValueCount} stock position(s) are missing quantity or price data for known value.`
      : "",
    incompleteCryptoValueCount > 0
      ? `${incompleteCryptoValueCount} crypto position(s) are missing quantity or price data for known value.`
      : "",
    input.fcnError ? "FCN API readback is currently unavailable." : "",
    input.stockError ? "Stock API readback is currently unavailable." : "",
    input.cryptoError ? "Crypto API readback is currently unavailable." : "",
    input.portfolioDashboardError
      ? "Portfolio Dashboard summary readback is currently unavailable."
      : "",
  ].filter(Boolean);

  return {
    amounts: {
      cryptoNotionalKnown,
      fcnNotional,
      stockNotionalKnown,
      totalKnownNotional,
    },
    counts,
    dataSourceStatuses,
    lastRefreshedAt: new Date().toISOString(),
    missingDataWarnings,
    portfolioDashboard: input.portfolioDashboardSummary ?? null,
    positions: {
      crypto: input.cryptoPositions,
      fcn: input.fcnPositions,
      stock: input.stockPositions,
    },
    readinessLevel: getReadinessLevel(dataSourceStatuses),
    symbols: {
      cryptoSymbols,
      stockSymbols,
      topAvailableSymbols: uniqueSorted([
        ...underlyingSymbols,
        ...stockSymbols,
        ...cryptoSymbols,
      ]).slice(0, 12),
      underlyingSymbols,
    },
  };
}
