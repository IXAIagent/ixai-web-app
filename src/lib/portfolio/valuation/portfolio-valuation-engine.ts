import type { PendingPortfolioInputRecord } from "@/src/lib/portfolio/input/input-truth-bridge";
import type { PortfolioTruthReadback } from "@/src/lib/portfolio/truth/portfolio-truth-types";
import type {
  AssetClass,
  AssetClassValuation,
  PortfolioValuationResult,
  PositionValuation,
  ValuationCurrency,
  ValuationSourceStatus,
  ValuationWarning,
} from "@/src/lib/portfolio/valuation/portfolio-valuation-types";
import type { MarketQuoteResult } from "@/src/lib/market/types";
import type { CryptoPosition } from "@/src/types/crypto-position";
import type { FCNPosition, FCNUnderlying } from "@/src/types/fcn-position";
import type { StockPosition } from "@/src/types/stock-position";

type QuoteMap = Map<string, MarketQuoteResult>;

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function normalizeSymbol(symbol: string | null | undefined) {
  return (symbol ?? "").trim().toUpperCase();
}

function normalizeCurrency(currency: string | null | undefined): ValuationCurrency {
  if (
    currency === "HKD" ||
    currency === "JPY" ||
    currency === "TWD" ||
    currency === "USD" ||
    currency === "USDT"
  ) {
    return currency;
  }

  return "USD";
}

function quoteKeyForCrypto(symbol: string) {
  const normalized = normalizeSymbol(symbol);

  if (!normalized) {
    return normalized;
  }

  if (normalized.endsWith("USDT")) {
    return normalized;
  }

  if (normalized === "BTC" || normalized === "ETH" || normalized === "BNB") {
    return `${normalized}USDT`;
  }

  return normalized;
}

function calculatePercent(numerator: number | null, denominator: number | null) {
  if (!isFiniteNumber(numerator) || !isFiniteNumber(denominator) || denominator === 0) {
    return null;
  }

  return (numerator / denominator) * 100;
}

function getUnrealizedPnl(input: {
  costBasis: number | null;
  marketValue: number | null;
}) {
  if (!isFiniteNumber(input.marketValue) || !isFiniteNumber(input.costBasis)) {
    return null;
  }

  return input.marketValue - input.costBasis;
}

function sourceStatusFromQuote(result: MarketQuoteResult | undefined): ValuationSourceStatus {
  if (!result?.quote) {
    return "unavailable";
  }

  if (result.sourceStatus === "live" || result.sourceStatus === "delayed") {
    return result.sourceStatus;
  }

  if (result.sourceStatus === "fallback") {
    return "fallback";
  }

  return "unavailable";
}

function getQuotePrice(result: MarketQuoteResult | undefined) {
  return isFiniteNumber(result?.quote?.price) ? result.quote.price : null;
}

function buildStockValuation(
  position: StockPosition,
  quotes: QuoteMap,
): PositionValuation {
  const symbol = normalizeSymbol(position.symbol);
  const quote = quotes.get(symbol);
  const marketPrice = getQuotePrice(quote);
  const hasQuantity = isFiniteNumber(position.quantity) && position.quantity > 0;
  const hasCost = isFiniteNumber(position.averageCost);
  const marketValue = hasQuantity && marketPrice !== null ? position.quantity * marketPrice : null;
  const costBasis = hasQuantity && hasCost ? position.quantity * Number(position.averageCost) : null;
  const unrealizedPnl = getUnrealizedPnl({ costBasis, marketValue });
  const sourceStatus = sourceStatusFromQuote(quote);
  const warningMessage =
    sourceStatus === "unavailable"
      ? "Market quote unavailable for this stock position."
      : !hasQuantity || !hasCost
        ? "Missing quantity or average cost data."
        : undefined;

  return {
    allocationPercent: 0,
    assetClass: "stock",
    costBasis,
    currency: normalizeCurrency(position.currency),
    id: position.id,
    marketPrice,
    marketValue,
    name: position.name ?? symbol,
    quantity: hasQuantity ? position.quantity : null,
    sourceStatus: warningMessage && sourceStatus !== "unavailable" ? "partial" : sourceStatus,
    symbol,
    unrealizedPnl,
    unrealizedPnlPercent: calculatePercent(unrealizedPnl, costBasis),
    warningMessage,
  };
}

function buildCryptoValuation(
  position: CryptoPosition,
  quotes: QuoteMap,
): PositionValuation {
  const symbol = normalizeSymbol(position.symbol);
  const quoteKey = quoteKeyForCrypto(symbol);
  const quote = quotes.get(quoteKey);
  const marketPrice = getQuotePrice(quote);
  const hasQuantity = isFiniteNumber(position.quantity) && position.quantity > 0;
  const hasCost = isFiniteNumber(position.averageCost);
  const marketValue = hasQuantity && marketPrice !== null ? position.quantity * marketPrice : null;
  const costBasis = hasQuantity && hasCost ? position.quantity * Number(position.averageCost) : null;
  const unrealizedPnl = getUnrealizedPnl({ costBasis, marketValue });
  const sourceStatus = sourceStatusFromQuote(quote);
  const warningMessage =
    sourceStatus === "unavailable"
      ? "Market quote unavailable for this crypto position."
      : !hasQuantity || !hasCost
        ? "Missing quantity or average cost data."
        : undefined;

  return {
    allocationPercent: 0,
    assetClass: "crypto",
    costBasis,
    currency: normalizeCurrency(position.currency === "USDT" ? "USD" : position.currency),
    id: position.id,
    marketPrice,
    marketValue,
    name: position.name ?? symbol,
    quantity: hasQuantity ? position.quantity : null,
    sourceStatus: warningMessage && sourceStatus !== "unavailable" ? "partial" : sourceStatus,
    symbol,
    unrealizedPnl,
    unrealizedPnlPercent: calculatePercent(unrealizedPnl, costBasis),
    warningMessage,
  };
}

function calculateKiDistance(underlying: FCNUnderlying) {
  if (
    !isFiniteNumber(underlying.currentPrice) ||
    !isFiniteNumber(underlying.kiPrice) ||
    underlying.kiPrice <= 0
  ) {
    return null;
  }

  return ((underlying.currentPrice - underlying.kiPrice) / underlying.kiPrice) * 100;
}

function getFcnRiskFields(position: FCNPosition) {
  const distances = position.underlyings
    .map((underlying) => ({
      distance: calculateKiDistance(underlying),
      symbol: normalizeSymbol(underlying.symbol),
    }))
    .filter((item): item is { distance: number; symbol: string } => isFiniteNumber(item.distance));
  const nearest = distances.sort((left, right) => left.distance - right.distance)[0] ?? null;

  if (nearest) {
    return {
      fcnRiskStatus: "partial" as const,
      nearestKiDistancePercent: nearest.distance,
      worstOfSymbol: nearest.symbol,
    };
  }

  return {
    fcnRiskStatus: position.underlyings.length > 0 ? ("pending" as const) : ("unavailable" as const),
    nearestKiDistancePercent: null,
    worstOfSymbol: position.worstOfSummary?.worstUnderlyingSymbol ?? null,
  };
}

function buildFcnValuation(position: FCNPosition): PositionValuation {
  const notional = isFiniteNumber(position.notionalAmount) ? position.notionalAmount : null;
  const riskFields = getFcnRiskFields(position);
  const warningMessage =
    "FCN uses notional placeholder; pricing engine not yet implemented.";

  return {
    allocationPercent: 0,
    assetClass: "fcn",
    costBasis: notional,
    currency: normalizeCurrency(position.currency),
    id: position.id,
    marketPrice: null,
    marketValue: notional,
    name: position.name,
    quantity: notional === null ? null : 1,
    sourceStatus: notional === null ? "unavailable" : "fallback",
    symbol: position.name,
    unrealizedPnl: notional === null ? null : 0,
    unrealizedPnlPercent: notional === null ? null : 0,
    warningMessage,
    ...riskFields,
  };
}

function buildPendingInputValuation(input: PendingPortfolioInputRecord): PositionValuation {
  const knownNotional = isFiniteNumber(input.knownNotional) ? input.knownNotional : null;
  const assetClass = input.category === "FCN"
    ? "fcn"
    : input.category === "CRYPTO"
      ? "crypto"
      : input.category === "STOCK"
        ? "stock"
        : "unknown";

  return {
    allocationPercent: 0,
    assetClass,
    costBasis: knownNotional,
    currency: "USD",
    fcnRiskStatus: input.category === "FCN" ? "pending" : undefined,
    id: input.id,
    marketPrice: null,
    marketValue: knownNotional,
    name: input.title,
    quantity: null,
    sourceStatus: knownNotional === null ? "unavailable" : "partial",
    symbol: input.symbols[0] ?? input.title,
    unrealizedPnl: knownNotional === null ? null : 0,
    unrealizedPnlPercent: knownNotional === null ? null : 0,
    warningMessage:
      "Pending local input is included for Workspace continuity but is not server-persisted valuation data.",
  };
}

export function calculateUnrealizedPnl(input: {
  costBasis: number | null;
  marketValue: number | null;
}) {
  const unrealizedPnl = getUnrealizedPnl(input);

  return {
    unrealizedPnl,
    unrealizedPnlPercent: calculatePercent(unrealizedPnl, input.costBasis),
  };
}

export function calculatePositionValuation(input: {
  cryptoPosition?: CryptoPosition;
  fcnPosition?: FCNPosition;
  pendingInput?: PendingPortfolioInputRecord;
  quotes: QuoteMap;
  stockPosition?: StockPosition;
}): PositionValuation {
  if (input.stockPosition) {
    return buildStockValuation(input.stockPosition, input.quotes);
  }

  if (input.cryptoPosition) {
    return buildCryptoValuation(input.cryptoPosition, input.quotes);
  }

  if (input.fcnPosition) {
    return buildFcnValuation(input.fcnPosition);
  }

  if (input.pendingInput) {
    return buildPendingInputValuation(input.pendingInput);
  }

  return {
    allocationPercent: 0,
    assetClass: "unknown",
    costBasis: null,
    currency: "USD",
    id: "unknown-position",
    marketPrice: null,
    marketValue: null,
    name: "Unknown position",
    quantity: null,
    sourceStatus: "unavailable",
    symbol: "UNKNOWN",
    unrealizedPnl: null,
    unrealizedPnlPercent: null,
    warningMessage: "Missing quantity, price, or cost data.",
  };
}

function combineSourceStatus(statuses: ValuationSourceStatus[]): ValuationSourceStatus {
  if (statuses.length === 0) {
    return "unavailable";
  }

  if (statuses.some((status) => status === "unavailable" || status === "partial")) {
    return "partial";
  }

  if (statuses.every((status) => status === "live")) {
    return "live";
  }

  if (statuses.every((status) => status === "fallback")) {
    return "fallback";
  }

  if (statuses.some((status) => status === "delayed")) {
    return "delayed";
  }

  return statuses[0] ?? "unavailable";
}

export function calculateAssetAllocation(
  positions: PositionValuation[],
): AssetClassValuation[] {
  const totalMarketValue = positions.reduce(
    (total, position) => total + (position.marketValue ?? 0),
    0,
  );
  const groups = new Map<AssetClass, PositionValuation[]>();

  positions.forEach((position) => {
    const current = groups.get(position.assetClass) ?? [];
    current.push(position);
    groups.set(position.assetClass, current);
  });

  return Array.from(groups.entries())
    .map(([assetClass, group]) => {
      const marketValue = group.reduce((total, position) => total + (position.marketValue ?? 0), 0);
      const costBasis = group.reduce((total, position) => total + (position.costBasis ?? 0), 0);
      const unrealizedPnl = marketValue - costBasis;

      return {
        allocationPercent: totalMarketValue > 0 ? (marketValue / totalMarketValue) * 100 : 0,
        assetClass,
        costBasis,
        marketValue,
        positionCount: group.length,
        pricedPositionCount: group.filter((position) => isFiniteNumber(position.marketValue)).length,
        sourceStatus: combineSourceStatus(group.map((position) => position.sourceStatus)),
        unrealizedPnl,
        unrealizedPnlPercent: costBasis > 0 ? (unrealizedPnl / costBasis) * 100 : null,
      };
    })
    .sort((left, right) => {
      if (right.marketValue !== left.marketValue) {
        return right.marketValue - left.marketValue;
      }

      return left.assetClass.localeCompare(right.assetClass);
    });
}

function buildWarnings(positions: PositionValuation[]): ValuationWarning[] {
  const warnings: ValuationWarning[] = [];

  if (positions.length === 0) {
    warnings.push({
      code: "no_positions",
      message: "No portfolio positions are available for valuation yet.",
    });
  }

  positions.forEach((position) => {
    if (position.assetClass === "fcn") {
      warnings.push({
        code: "fcn_placeholder",
        message: "FCN uses notional placeholder; pricing engine not yet implemented.",
        positionId: position.id,
        symbol: position.symbol,
      });
    }

    if (position.sourceStatus === "unavailable") {
      warnings.push({
        code: "missing_quote",
        message: position.warningMessage ?? "Missing quantity, price, or cost data.",
        positionId: position.id,
        symbol: position.symbol,
      });
    } else if (position.warningMessage) {
      warnings.push({
        code: "missing_position_data",
        message: position.warningMessage,
        positionId: position.id,
        symbol: position.symbol,
      });
    }
  });

  return warnings;
}

function applyAllocationPercent(positions: PositionValuation[]) {
  const totalMarketValue = positions.reduce(
    (total, position) => total + (position.marketValue ?? 0),
    0,
  );

  return positions.map((position) => ({
    ...position,
    allocationPercent:
      totalMarketValue > 0 && isFiniteNumber(position.marketValue)
        ? (position.marketValue / totalMarketValue) * 100
        : 0,
  }));
}

export async function buildPortfolioValuation(input: {
  marketQuotes: MarketQuoteResult[];
  truth: PortfolioTruthReadback;
}): Promise<PortfolioValuationResult> {
  const quotes: QuoteMap = new Map(
    input.marketQuotes.map((result) => [normalizeSymbol(result.symbol), result]),
  );
  const rawPositions = [
    ...input.truth.positions.stock.map((position) =>
      calculatePositionValuation({ quotes, stockPosition: position }),
    ),
    ...input.truth.positions.crypto.map((position) =>
      calculatePositionValuation({ cryptoPosition: position, quotes }),
    ),
    ...input.truth.positions.fcn.map((position) =>
      calculatePositionValuation({ fcnPosition: position, quotes }),
    ),
    ...input.truth.pendingInputs.map((pendingInput) =>
      calculatePositionValuation({ pendingInput, quotes }),
    ),
  ];
  const positions = applyAllocationPercent(rawPositions);
  const totalMarketValue = positions.reduce(
    (total, position) => total + (position.marketValue ?? 0),
    0,
  );
  const totalCostBasis = positions.reduce(
    (total, position) => total + (position.costBasis ?? 0),
    0,
  );
  const totalUnrealizedPnl = totalMarketValue - totalCostBasis;
  const warnings = buildWarnings(positions);
  const assetAllocation = calculateAssetAllocation(positions);
  const pricedPositionCount = positions.filter((position) => isFiniteNumber(position.marketValue)).length;
  const currencies = new Set(positions.map((position) => position.currency));

  if (currencies.size > 1) {
    warnings.push({
      code: "mixed_currency",
      message: "Portfolio valuation includes multiple currencies and is shown as a foundation estimate.",
    });
  }

  return {
    currency: currencies.size > 1 ? "MIXED" : positions[0]?.currency ?? "USD",
    positions,
    summary: {
      assetAllocation,
      positionCount: positions.length,
      pricedPositionCount,
      sourceStatus: combineSourceStatus(positions.map((position) => position.sourceStatus)),
      totalCostBasis,
      totalMarketValue,
      totalUnrealizedPnl,
      totalUnrealizedPnlPercent:
        totalCostBasis > 0 ? (totalUnrealizedPnl / totalCostBasis) * 100 : null,
      unpricedPositionCount: positions.length - pricedPositionCount,
      updatedAt: new Date().toISOString(),
      warnings,
    },
  };
}
