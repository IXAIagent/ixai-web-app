import type { MarketQuoteResult, MarketQuote } from "@/src/lib/market/types";
import type { FCNPosition, FCNUnderlying } from "@/src/types/fcn-position";
import type {
  FcnPortfolioRiskSummary,
  FcnPositionRiskSummary,
  FcnRiskLevel,
  FcnRiskSourceStatus,
  FcnRiskWarning,
  FcnUnderlyingRisk,
} from "@/src/lib/fcn/risk/fcn-risk-types";

export type FcnRiskQuoteMap = Map<string, MarketQuoteResult<MarketQuote>>;
export type FcnRiskManualPrices = Record<string, number>;

const DISCLAIMER =
  "FCN Risk Engine v1 is informational and monitoring-only. It does not provide investment recommendations, buy/sell instructions, order execution, auto trading, target prices, or return promises.";

const RISK_LEVEL_RANK: Record<FcnRiskLevel, number> = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  unavailable: 1,
};

const SOURCE_STATUS_RANK: Record<FcnRiskSourceStatus, number> = {
  live: 5,
  delayed: 4,
  fallback: 3,
  partial: 2,
  unavailable: 1,
};

function isFiniteNumber(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function normalizeSymbol(symbol: string | null | undefined) {
  return (symbol ?? "").trim().toUpperCase();
}

function normalizeQuoteSymbol(symbol: string) {
  const normalized = normalizeSymbol(symbol);

  if (normalized === "BTC" || normalized === "ETH" || normalized === "BNB") {
    return `${normalized}USDT`;
  }

  return normalized;
}

function getQuoteForSymbol(symbol: string, quotesBySymbol: FcnRiskQuoteMap) {
  const normalized = normalizeSymbol(symbol);
  return quotesBySymbol.get(normalized) ?? quotesBySymbol.get(normalizeQuoteSymbol(normalized));
}

function getQuotePrice(
  symbol: string,
  quotesBySymbol: FcnRiskQuoteMap,
): {
  price: number | null;
  sourceStatus: FcnRiskSourceStatus;
} {
  const quoteResult = getQuoteForSymbol(symbol, quotesBySymbol);
  const quotePrice = quoteResult?.quote?.price;

  if (isFiniteNumber(quotePrice)) {
    return {
      price: quotePrice,
      sourceStatus: quoteResult?.sourceStatus ?? "partial",
    };
  }

  return {
    price: null,
    sourceStatus: quoteResult?.sourceStatus === "unavailable" ? "unavailable" : "partial",
  };
}

function getCurrentPrice(input: {
  manualPrices?: FcnRiskManualPrices;
  quotesBySymbol: FcnRiskQuoteMap;
  underlying: FCNUnderlying;
}) {
  const symbol = normalizeSymbol(input.underlying.symbol);
  const quote = getQuotePrice(symbol, input.quotesBySymbol);

  if (isFiniteNumber(quote.price)) {
    return quote;
  }

  const manualPrice = input.manualPrices?.[symbol];

  if (isFiniteNumber(manualPrice)) {
    return {
      price: manualPrice,
      sourceStatus: "fallback" as const,
    };
  }

  if (isFiniteNumber(input.underlying.currentPrice)) {
    return {
      price: input.underlying.currentPrice,
      sourceStatus: "fallback" as const,
    };
  }

  return quote;
}

function calculatePercentDistance(
  currentPrice: number | null,
  referencePrice: number | null,
) {
  if (!isFiniteNumber(currentPrice) || !isFiniteNumber(referencePrice) || referencePrice <= 0) {
    return null;
  }

  return ((currentPrice - referencePrice) / referencePrice) * 100;
}

export function calculateKiDistance(input: {
  currentPrice: number | null;
  kiPrice: number | null;
}) {
  return calculatePercentDistance(input.currentPrice, input.kiPrice);
}

export function calculateStrikeDistance(input: {
  currentPrice: number | null;
  strikePrice: number | null;
}) {
  return calculatePercentDistance(input.currentPrice, input.strikePrice);
}

export function calculateKoStatus(underlyings: FcnUnderlyingRisk[]) {
  const withKo = underlyings.filter(
    (underlying) => isFiniteNumber(underlying.currentPrice) && isFiniteNumber(underlying.koPrice),
  );

  if (withKo.length === 0 || withKo.length !== underlyings.length) {
    return false;
  }

  return withKo.every((underlying) => underlying.hasReachedKo);
}

export function analyzeFcnUnderlying(input: {
  manualPrices?: FcnRiskManualPrices;
  quotesBySymbol?: FcnRiskQuoteMap;
  underlying: FCNUnderlying;
}): FcnUnderlyingRisk {
  const quotesBySymbol = input.quotesBySymbol ?? new Map();
  const symbol = normalizeSymbol(input.underlying.symbol);
  const currentPrice = getCurrentPrice({
    manualPrices: input.manualPrices,
    quotesBySymbol,
    underlying: input.underlying,
  });
  const initialPrice = input.underlying.initialPrice;
  const kiPrice = input.underlying.kiPrice;
  const strikePrice = input.underlying.strikePrice;
  const koPrice = input.underlying.koPrice;
  const performancePercent = calculatePercentDistance(currentPrice.price, initialPrice);
  const distanceToKiPercent = calculateKiDistance({
    currentPrice: currentPrice.price,
    kiPrice,
  });
  const distanceToStrikePercent = calculateStrikeDistance({
    currentPrice: currentPrice.price,
    strikePrice,
  });
  const distanceToKoPercent = calculatePercentDistance(currentPrice.price, koPrice);
  const warnings: string[] = [];

  if (!isFiniteNumber(currentPrice.price)) {
    warnings.push("Missing current market price.");
  }

  if (!isFiniteNumber(initialPrice) || initialPrice <= 0) {
    warnings.push("Missing or invalid initial price.");
  }

  if (!isFiniteNumber(kiPrice) || kiPrice <= 0) {
    warnings.push("Missing or invalid KI price.");
  }

  if (!isFiniteNumber(strikePrice) || strikePrice <= 0) {
    warnings.push("Missing or invalid strike price.");
  }

  if (!isFiniteNumber(koPrice) || koPrice <= 0) {
    warnings.push("Missing or invalid KO price.");
  }

  return {
    currentPrice: currentPrice.price,
    distanceToKiPercent,
    distanceToKoPercent,
    distanceToStrikePercent,
    hasBreachedKi:
      isFiniteNumber(currentPrice.price) && isFiniteNumber(kiPrice) && currentPrice.price <= kiPrice,
    hasReachedKo:
      isFiniteNumber(currentPrice.price) && isFiniteNumber(koPrice) && currentPrice.price >= koPrice,
    initialPrice,
    isBelowStrike:
      isFiniteNumber(currentPrice.price) &&
      isFiniteNumber(strikePrice) &&
      currentPrice.price < strikePrice,
    isWorstOf: false,
    kiPrice,
    koPrice,
    performancePercent,
    sourceStatus: warnings.length > 0 && currentPrice.sourceStatus !== "unavailable"
      ? "partial"
      : currentPrice.sourceStatus,
    strikePrice,
    symbol,
    ...(warnings.length > 0 ? { warningMessage: warnings.join(" ") } : {}),
  };
}

export function calculateWorstOf(underlyings: FcnUnderlyingRisk[]) {
  return underlyings
    .filter((underlying) => isFiniteNumber(underlying.performancePercent))
    .toSorted((left, right) => {
      const performanceDiff =
        (left.performancePercent ?? 0) - (right.performancePercent ?? 0);

      if (performanceDiff !== 0) {
        return performanceDiff;
      }

      return left.symbol.localeCompare(right.symbol);
    })[0] ?? null;
}

function getNearestDistance(values: Array<number | null>) {
  const finiteValues = values.filter(isFiniteNumber);

  if (finiteValues.length === 0) {
    return null;
  }

  return finiteValues.toSorted((left, right) => left - right)[0] ?? null;
}

export function calculateFcnRiskLevel(input: {
  hasBreachedKi: boolean;
  nearestKiDistancePercent: number | null;
  worstOfPerformancePercent: number | null;
}): FcnRiskLevel {
  if (input.hasBreachedKi || (isFiniteNumber(input.nearestKiDistancePercent) && input.nearestKiDistancePercent <= 0)) {
    return "critical";
  }

  if (
    (isFiniteNumber(input.nearestKiDistancePercent) && input.nearestKiDistancePercent <= 10) ||
    (isFiniteNumber(input.worstOfPerformancePercent) && input.worstOfPerformancePercent <= -30)
  ) {
    return "high";
  }

  if (
    (isFiniteNumber(input.nearestKiDistancePercent) && input.nearestKiDistancePercent <= 20) ||
    (isFiniteNumber(input.worstOfPerformancePercent) && input.worstOfPerformancePercent <= -15)
  ) {
    return "medium";
  }

  if (
    !isFiniteNumber(input.nearestKiDistancePercent) &&
    !isFiniteNumber(input.worstOfPerformancePercent)
  ) {
    return "unavailable";
  }

  return "low";
}

function buildPositionWarnings(position: FCNPosition, underlyings: FcnUnderlyingRisk[]) {
  const warnings: FcnRiskWarning[] = [];

  if (position.underlyings.length === 0) {
    warnings.push({
      code: "missing_underlyings",
      message: "FCN position does not include underlyings.",
    });
  }

  underlyings.forEach((underlying) => {
    if (underlying.warningMessage) {
      warnings.push({
        code: "underlying_incomplete",
        message: underlying.warningMessage,
        symbol: underlying.symbol,
      });
    }
  });

  return warnings;
}

function combineSourceStatus(statuses: FcnRiskSourceStatus[]): FcnRiskSourceStatus {
  if (statuses.length === 0) {
    return "unavailable";
  }

  if (statuses.every((status) => status === "live")) {
    return "live";
  }

  if (statuses.every((status) => status === "live" || status === "delayed")) {
    return "delayed";
  }

  if (statuses.every((status) => status === "fallback")) {
    return "fallback";
  }

  if (statuses.every((status) => status === "unavailable")) {
    return "unavailable";
  }

  return "partial";
}

export function buildFcnPositionRiskSummary(input: {
  manualPrices?: FcnRiskManualPrices;
  position: FCNPosition;
  quotesBySymbol?: FcnRiskQuoteMap;
}): FcnPositionRiskSummary {
  const analyzedUnderlyings = input.position.underlyings.map((underlying) =>
    analyzeFcnUnderlying({
      manualPrices: input.manualPrices,
      quotesBySymbol: input.quotesBySymbol,
      underlying,
    }),
  );
  const worstOf = calculateWorstOf(analyzedUnderlyings);
  const underlyings = analyzedUnderlyings.map((underlying) => ({
    ...underlying,
    isWorstOf: Boolean(worstOf && underlying.symbol === worstOf.symbol),
  }));
  const nearestKiDistancePercent = getNearestDistance(
    underlyings.map((underlying) => underlying.distanceToKiPercent),
  );
  const nearestStrikeDistancePercent = getNearestDistance(
    underlyings.map((underlying) => underlying.distanceToStrikePercent),
  );
  const kiBreached = underlyings.some((underlying) => underlying.hasBreachedKi);
  const riskLevel = calculateFcnRiskLevel({
    hasBreachedKi: kiBreached,
    nearestKiDistancePercent,
    worstOfPerformancePercent: worstOf?.performancePercent ?? null,
  });
  const warnings = buildPositionWarnings(input.position, underlyings);
  const sourceStatus =
    riskLevel === "unavailable" || warnings.length > 0
      ? combineSourceStatus(["partial", ...underlyings.map((underlying) => underlying.sourceStatus)])
      : combineSourceStatus(underlyings.map((underlying) => underlying.sourceStatus));

  return {
    id: input.position.id,
    informationalOnlyDisclaimer: DISCLAIMER,
    kiBreached,
    koReady: calculateKoStatus(underlyings),
    name: input.position.name,
    nearestKiDistancePercent,
    nearestStrikeDistancePercent,
    riskLevel,
    sourceStatus,
    underlyings,
    updatedAt: new Date().toISOString(),
    warnings,
    worstOfPerformancePercent: worstOf?.performancePercent ?? null,
    worstOfSymbol: worstOf?.symbol ?? null,
  };
}

export function buildFcnPortfolioRiskSummary(input: {
  manualPrices?: FcnRiskManualPrices;
  positions: FCNPosition[];
  quotesBySymbol?: FcnRiskQuoteMap;
}): FcnPortfolioRiskSummary {
  const summaries = input.positions.map((position) =>
    buildFcnPositionRiskSummary({
      manualPrices: input.manualPrices,
      position,
      quotesBySymbol: input.quotesBySymbol,
    }),
  );
  const analyzedPositionCount = summaries.filter(
    (summary) => summary.riskLevel !== "unavailable",
  ).length;
  const topRiskPositions = summaries
    .toSorted((left, right) => {
      const riskDiff = RISK_LEVEL_RANK[right.riskLevel] - RISK_LEVEL_RANK[left.riskLevel];

      if (riskDiff !== 0) {
        return riskDiff;
      }

      const leftDistance = left.nearestKiDistancePercent ?? Number.POSITIVE_INFINITY;
      const rightDistance = right.nearestKiDistancePercent ?? Number.POSITIVE_INFINITY;

      if (leftDistance !== rightDistance) {
        return leftDistance - rightDistance;
      }

      return left.name.localeCompare(right.name);
    })
    .slice(0, 5);

  return {
    analyzedPositionCount,
    criticalRiskCount: summaries.filter((summary) => summary.riskLevel === "critical").length,
    highRiskCount: summaries.filter((summary) => summary.riskLevel === "high").length,
    informationalOnlyDisclaimer: DISCLAIMER,
    positionCount: input.positions.length,
    sourceStatus: combineSourceStatus(summaries.map((summary) => summary.sourceStatus)),
    summaries,
    topRiskPositions,
    unavailablePositionCount: summaries.filter(
      (summary) => summary.riskLevel === "unavailable",
    ).length,
    updatedAt: new Date().toISOString(),
  };
}

export function getRiskSourceStatusRank(status: FcnRiskSourceStatus) {
  return SOURCE_STATUS_RANK[status];
}
