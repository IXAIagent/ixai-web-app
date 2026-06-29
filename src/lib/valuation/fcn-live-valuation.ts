import type { YahooQuote, YahooQuoteSnapshot } from "@/src/lib/market-data/yahoo/yahoo-quote-types";
import type {
  FcnLivePositionStatus,
  FcnLiveUnderlyingSnapshot,
  FcnLiveUnderlyingStatus,
  LiveValuationSourceStatus,
} from "@/src/lib/valuation/live-valuation-types";
import type { FCNPosition, FCNUnderlying } from "@/src/types/fcn-position";

function finiteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeSymbol(value: string | null | undefined) {
  return (value ?? "").trim().toUpperCase();
}

function calculatePercentDistance(current: number | null, reference: number | null) {
  if (current === null || reference === null || reference === 0) return null;
  return ((current - reference) / reference) * 100;
}

function quoteMapFromSnapshot(snapshot: YahooQuoteSnapshot | null | undefined) {
  return new Map((snapshot?.quotes ?? []).map((quote) => [quote.symbol.toUpperCase(), quote]));
}

function quoteKeyForSymbol(symbol: string) {
  if (symbol === "BTC" || symbol === "ETH" || symbol === "BNB") {
    return `${symbol}USDT`;
  }

  return symbol;
}

function quoteStatus(quote: YahooQuote | null | undefined): LiveValuationSourceStatus | null {
  if (!quote) return null;
  if (quote.dataQuality === "live") return "live";
  if (quote.dataQuality === "stale") return "stale";
  return "unavailable";
}

function analyzeUnderlying(input: {
  fcnName: string;
  quote: YahooQuote | null | undefined;
  underlying: FCNUnderlying;
}): FcnLiveUnderlyingStatus {
  const symbol = normalizeSymbol(input.underlying.symbol);
  const quotePrice = finiteNumber(input.quote?.price);
  const manualPrice = finiteNumber(input.underlying.currentPrice);
  const currentPrice = quotePrice ?? manualPrice;
  const initialPrice = finiteNumber(input.underlying.initialPrice);
  const kiPrice = finiteNumber(input.underlying.kiPrice);
  const koPrice = finiteNumber(input.underlying.koPrice);
  const strikePrice = finiteNumber(input.underlying.strikePrice);
  const sourceStatus =
    quotePrice !== null
      ? quoteStatus(input.quote) ?? "live"
      : manualPrice !== null
        ? "manual_fallback"
        : "unavailable";

  return {
    currentPrice,
    dataQuality: sourceStatus,
    distanceToKiPercent: calculatePercentDistance(currentPrice, kiPrice),
    distanceToKoPercent: calculatePercentDistance(currentPrice, koPrice),
    distanceToStrikePercent: calculatePercentDistance(currentPrice, strikePrice),
    fcnName: input.fcnName,
    initialPrice,
    isWorstOf: false,
    kiPrice,
    koPrice,
    performancePercent: calculatePercentDistance(currentPrice, initialPrice),
    sourceStatus,
    strikePrice,
    symbol,
    warningMessage:
      sourceStatus === "manual_fallback"
        ? "Using stored/manual current price because Yahoo quote is unavailable."
        : sourceStatus === "unavailable"
          ? "Missing live quote and stored current price."
          : sourceStatus === "stale"
            ? "Using stale cached Yahoo quote after refresh failed."
            : undefined,
  };
}

function inferPositionDataQuality(underlyings: FcnLiveUnderlyingStatus[]): LiveValuationSourceStatus {
  if (underlyings.length === 0) return "unavailable";
  if (underlyings.every((underlying) => underlying.sourceStatus === "live")) return "live";
  if (underlyings.some((underlying) => underlying.sourceStatus === "unavailable")) return "partial";
  if (underlyings.some((underlying) => underlying.sourceStatus === "stale")) return "stale";
  if (underlyings.some((underlying) => underlying.sourceStatus === "manual_fallback")) {
    return "manual_fallback";
  }
  return "partial";
}

function buildPositionStatus(position: FCNPosition, quoteMap: Map<string, YahooQuote>): FcnLivePositionStatus {
  const analyzed = position.underlyings
    .map((underlying) =>
      analyzeUnderlying({
        fcnName: position.name,
        quote:
          quoteMap.get(normalizeSymbol(underlying.symbol)) ??
          quoteMap.get(quoteKeyForSymbol(normalizeSymbol(underlying.symbol))),
        underlying,
      }),
    )
    .filter((underlying) => underlying.symbol.length > 0);
  const worst = analyzed
    .filter((underlying) => typeof underlying.performancePercent === "number")
    .toSorted((a, b) => (a.performancePercent ?? 0) - (b.performancePercent ?? 0))[0] ?? null;
  const underlyings = analyzed.map((underlying) => ({
    ...underlying,
    isWorstOf: Boolean(worst && underlying.symbol === worst.symbol),
  }));

  return {
    dataQuality: inferPositionDataQuality(underlyings),
    id: position.id,
    name: position.name,
    underlyings,
    warningMessages: underlyings
      .map((underlying) => underlying.warningMessage)
      .filter((message): message is string => Boolean(message)),
    worstOfPerformancePercent: worst?.performancePercent ?? null,
    worstOfSymbol: worst?.symbol ?? null,
  };
}

function inferSnapshotDataQuality(positions: FcnLivePositionStatus[]): LiveValuationSourceStatus {
  if (positions.length === 0) return "unavailable";
  if (positions.every((position) => position.dataQuality === "live")) return "live";
  if (positions.some((position) => position.dataQuality === "partial" || position.dataQuality === "unavailable")) {
    return "partial";
  }
  if (positions.some((position) => position.dataQuality === "stale")) return "stale";
  if (positions.some((position) => position.dataQuality === "manual_fallback")) {
    return "manual_fallback";
  }
  return "partial";
}

export function buildFcnLiveUnderlyingSnapshot(input: {
  fcnPositions: FCNPosition[];
  quoteSnapshot?: YahooQuoteSnapshot | null;
}): FcnLiveUnderlyingSnapshot {
  const quoteMap = quoteMapFromSnapshot(input.quoteSnapshot);
  const positions = input.fcnPositions.map((position) => buildPositionStatus(position, quoteMap));
  const topWorstOf =
    positions
      .filter((position) => typeof position.worstOfPerformancePercent === "number")
      .toSorted(
        (a, b) => (a.worstOfPerformancePercent ?? 0) - (b.worstOfPerformancePercent ?? 0),
      )[0] ?? null;
  const allUnderlyings = positions.flatMap((position) => position.underlyings);

  return {
    dataQuality: inferSnapshotDataQuality(positions),
    generatedAt: new Date().toISOString(),
    informationalOnlyDisclaimer:
      "FCN live underlying status is monitoring only and is not a full FCN pricing engine.",
    missingQuoteSymbols: Array.from(
      new Set(
        allUnderlyings
          .filter((underlying) => underlying.sourceStatus === "unavailable")
          .map((underlying) => underlying.symbol),
      ),
    ),
    positionCount: positions.length,
    positions,
    quoteSnapshot: input.quoteSnapshot
      ? {
          cacheStatus: input.quoteSnapshot.cacheStatus,
          dataQuality: input.quoteSnapshot.dataQuality,
          generatedAt: input.quoteSnapshot.generatedAt,
          source: input.quoteSnapshot.source,
          staleQuoteSymbols: input.quoteSnapshot.staleQuoteSymbols,
        }
      : null,
    readOnly: true,
    source: "live_market_preview",
    staleQuoteSymbols: Array.from(
      new Set(
        allUnderlyings
          .filter((underlying) => underlying.sourceStatus === "stale")
          .map((underlying) => underlying.symbol),
      ),
    ),
    topWorstOf,
  };
}
