import type {
  BuildPortfolioTruthInput,
  PortfolioTruthDataSourceStatus,
  PortfolioTruthReadback,
  PortfolioTruthReadinessLevel,
  PortfolioTruthRiskLevel,
  PortfolioTruthRiskSummary,
  PortfolioTruthSymbolExposure,
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

function buildTopSymbolExposures(input: BuildPortfolioTruthInput) {
  const exposures = new Map<string, { count: number; sources: Set<string> }>();

  function addExposure(symbol: string | null | undefined, source: string) {
    const normalized = normalizeSymbol(symbol);

    if (!normalized) {
      return;
    }

    const current = exposures.get(normalized) ?? {
      count: 0,
      sources: new Set<string>(),
    };

    current.count += 1;
    current.sources.add(source);
    exposures.set(normalized, current);
  }

  input.fcnPositions.forEach((position) => {
    position.underlyings.forEach((underlying) => {
      addExposure(underlying.symbol, "FCN underlying");
    });
  });

  input.stockPositions.forEach((position) => {
    addExposure(position.symbol, "Stock");
  });

  input.cryptoPositions.forEach((position) => {
    addExposure(position.symbol, "Crypto");
  });

  input.pendingInputs?.forEach((pendingInput) => {
    pendingInput.symbols.forEach((symbol) => {
      addExposure(symbol, `Pending ${pendingInput.category} input`);
    });
  });

  return Array.from(exposures.entries())
    .map(
      ([symbol, exposure]): PortfolioTruthSymbolExposure => ({
        occurrenceCount: exposure.count,
        sources: Array.from(exposure.sources).sort((a, b) =>
          a.localeCompare(b),
        ),
        symbol,
      }),
    )
    .sort((a, b) => {
      if (b.occurrenceCount !== a.occurrenceCount) {
        return b.occurrenceCount - a.occurrenceCount;
      }

      return a.symbol.localeCompare(b.symbol);
    });
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

function getConcentrationLevel(input: {
  repeatedSymbolCount: number;
  topExposureSharePct: number | null;
  topOccurrenceCount: number;
}): PortfolioTruthRiskLevel {
  if (input.topOccurrenceCount === 0 || input.topExposureSharePct === null) {
    return "UNKNOWN";
  }

  if (
    input.topOccurrenceCount >= 4 ||
    input.topExposureSharePct >= 50 ||
    input.repeatedSymbolCount >= 4
  ) {
    return "HIGH";
  }

  if (
    input.topOccurrenceCount >= 2 ||
    input.topExposureSharePct >= 30 ||
    input.repeatedSymbolCount >= 2
  ) {
    return "MODERATE";
  }

  return "LOW";
}

function buildConcentrationSummary(input: {
  level: PortfolioTruthRiskLevel;
  topExposure: PortfolioTruthSymbolExposure | null;
  topExposureSharePct: number | null;
}) {
  if (!input.topExposure) {
    return "No shared symbol exposure is available yet.";
  }

  const shareLabel =
    input.topExposureSharePct === null
      ? "unknown share"
      : `${Math.round(input.topExposureSharePct)}% of known symbol occurrences`;

  if (input.level === "HIGH") {
    return `${input.topExposure.symbol} is the largest repeated exposure with ${input.topExposure.occurrenceCount} occurrence(s), representing ${shareLabel}.`;
  }

  if (input.level === "MODERATE") {
    return `${input.topExposure.symbol} appears more than once across known holdings. Concentration is visible but still foundation-level.`;
  }

  return `Known holdings are currently spread across available symbols. Top symbol: ${input.topExposure.symbol}.`;
}

function getDataQualityLevel(input: {
  partialSourceCount: number;
  unavailableSourceCount: number;
  warningCount: number;
}): PortfolioTruthRiskLevel {
  if (input.unavailableSourceCount > 0 || input.warningCount >= 5) {
    return "HIGH";
  }

  if (input.partialSourceCount > 0 || input.warningCount > 0) {
    return "MODERATE";
  }

  return "LOW";
}

function buildRiskSummary(input: {
  dataSourceStatuses: PortfolioTruthDataSourceStatus[];
  missingDataWarnings: string[];
  topExposures: PortfolioTruthSymbolExposure[];
}): PortfolioTruthRiskSummary {
  const totalSymbolOccurrences = input.topExposures.reduce(
    (total, exposure) => total + exposure.occurrenceCount,
    0,
  );
  const topExposure = input.topExposures[0] ?? null;
  const topExposureSharePct =
    topExposure && totalSymbolOccurrences > 0
      ? (topExposure.occurrenceCount / totalSymbolOccurrences) * 100
      : null;
  const repeatedSymbolCount = input.topExposures.filter(
    (exposure) => exposure.occurrenceCount >= 2,
  ).length;
  const concentrationLevel = getConcentrationLevel({
    repeatedSymbolCount,
    topExposureSharePct,
    topOccurrenceCount: topExposure?.occurrenceCount ?? 0,
  });
  const unavailableSourceCount = input.dataSourceStatuses.filter(
    (source) => source.status === "unavailable" || source.status === "unauthenticated",
  ).length;
  const partialSourceCount = input.dataSourceStatuses.filter(
    (source) => source.status === "partial",
  ).length;
  const dataQualityLevel = getDataQualityLevel({
    partialSourceCount,
    unavailableSourceCount,
    warningCount: input.missingDataWarnings.length,
  });

  return {
    concentrationRisk: {
      level: concentrationLevel,
      repeatedSymbolCount,
      score:
        concentrationLevel === "UNKNOWN"
          ? null
          : Math.min(
              100,
              Math.round(
                (topExposureSharePct ?? 0) +
                  repeatedSymbolCount * 8 +
                  (topExposure?.occurrenceCount ?? 0) * 5,
              ),
            ),
      summary: buildConcentrationSummary({
        level: concentrationLevel,
        topExposure,
        topExposureSharePct,
      }),
      topExposure,
      topExposureSharePct,
      totalSymbolOccurrences,
    },
    dataQualityRisk: {
      level: dataQualityLevel,
      partialSourceCount,
      score: Math.min(
        100,
        unavailableSourceCount * 35 +
          partialSourceCount * 15 +
          input.missingDataWarnings.length * 8,
      ),
      summary:
        input.missingDataWarnings.length > 0
          ? `${input.missingDataWarnings.length} data warning(s) are present across the shared readback.`
          : "No data quality warnings are present in the shared readback.",
      unavailableSourceCount,
      warningCount: input.missingDataWarnings.length,
    },
  };
}

export function buildPortfolioTruthReadback(
  input: BuildPortfolioTruthInput,
): PortfolioTruthReadback {
  const pendingInputs = input.pendingInputs ?? [];
  const pendingStockInputs = pendingInputs.filter((item) => item.category === "STOCK");
  const pendingCryptoInputs = pendingInputs.filter((item) => item.category === "CRYPTO");
  const pendingFcnInputs = pendingInputs.filter((item) => item.category === "FCN");
  const fcnNotional = input.fcnPositions.reduce(
    (total, position) =>
      isFiniteNumber(position.notionalAmount)
        ? total + Number(position.notionalAmount)
        : total,
    0,
  );
  const stockNotionalKnown = sumKnownStockValue(input.stockPositions);
  const cryptoNotionalKnown = sumKnownCryptoValue(input.cryptoPositions);
  const pendingKnownNotional = pendingInputs.reduce(
    (total, item) =>
      isFiniteNumber(item.knownNotional) ? total + Number(item.knownNotional) : total,
    0,
  );
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

  const totalPersistedAssets =
      input.fcnPositions.length +
      input.stockPositions.length +
      input.cryptoPositions.length;

  const counts = {
    totalAssets: totalPersistedAssets + pendingInputs.length,
    totalCryptoPositions: input.cryptoPositions.length + pendingCryptoInputs.length,
    totalDualPositions: input.cryptoPositions.filter(isCryptoDual).length,
    totalFcnPositions: input.fcnPositions.length + pendingFcnInputs.length,
    totalGridPositions: input.cryptoPositions.filter(isCryptoGrid).length,
    totalPendingCryptoInputs: pendingCryptoInputs.length,
    totalPendingFcnInputs: pendingFcnInputs.length,
    totalPendingInputs: pendingInputs.length,
    totalPendingStockInputs: pendingStockInputs.length,
    totalPersistedAssets,
    totalStockPositions: input.stockPositions.length + pendingStockInputs.length,
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
  const pendingSymbols = uniqueSorted(pendingInputs.flatMap((item) => item.symbols));
  const symbolExposures = buildTopSymbolExposures(input);

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
    {
      key: "inputBridge",
      label: "Input Truth Bridge",
      note:
        pendingInputs.length > 0
          ? "Local pending inputs are visible in Workspace readback but are not persisted server records."
          : "No local pending inputs are available from the browser bridge.",
      status: pendingInputs.length > 0 ? "partial" : "placeholder",
    },
  ];

  const missingDataWarnings = [
    input.unauthenticated
      ? "Sign in is required before the shared Portfolio Truth Layer can read user positions."
      : "",
    counts.totalAssets === 0 && !input.unauthenticated
      ? "No FCN, Stock, or Crypto positions are available from the current readback."
      : "",
    pendingInputs.length > 0
      ? `${pendingInputs.length} local pending input(s) are included through the v4.10 Input Truth Bridge and still need server persistence.`
      : "",
    input.fcnPositions.length === 0 &&
    pendingFcnInputs.length === 0 &&
    !input.unauthenticated &&
    !input.fcnError
      ? "No FCN records are available from the current readback."
      : "",
    input.stockPositions.length === 0 &&
    pendingStockInputs.length === 0 &&
    !input.unauthenticated &&
    !input.stockError
      ? "No Stock records are available from the current readback."
      : "",
    input.cryptoPositions.length === 0 &&
    pendingCryptoInputs.length === 0 &&
    !input.unauthenticated &&
    !input.cryptoError
      ? "No Crypto records are available from the current readback."
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
  const topExposures = symbolExposures.slice(0, 5);
  const risk = buildRiskSummary({
    dataSourceStatuses,
    missingDataWarnings,
    topExposures: symbolExposures,
  });

  return {
    amounts: {
      cryptoNotionalKnown,
      fcnNotional,
      pendingKnownNotional,
      stockNotionalKnown,
      totalKnownNotional,
    },
    counts,
    dataSourceStatuses,
    lastRefreshedAt: new Date().toISOString(),
    missingDataWarnings,
    pendingInputs,
    portfolioDashboard: input.portfolioDashboardSummary ?? null,
    positions: {
      crypto: input.cryptoPositions,
      fcn: input.fcnPositions,
      stock: input.stockPositions,
    },
    readinessLevel: getReadinessLevel(dataSourceStatuses),
    risk,
    symbols: {
      cryptoSymbols,
      stockSymbols,
      topAvailableSymbols: uniqueSorted([
        ...underlyingSymbols,
        ...stockSymbols,
        ...cryptoSymbols,
        ...pendingSymbols,
      ]).slice(0, 12),
      topExposures,
      underlyingSymbols,
    },
  };
}
