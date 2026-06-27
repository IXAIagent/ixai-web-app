import type { YahooQuote, YahooQuoteSnapshot } from "@/src/lib/market-data/yahoo/yahoo-quote-types";
import type { PortfolioTruthReadback } from "@/src/lib/portfolio/truth/portfolio-truth-types";
import type {
  LivePositionValuation,
  LiveValuationSourceStatus,
  PortfolioLiveValuationSnapshot,
} from "@/src/lib/valuation/live-valuation-types";
import type { CryptoPosition } from "@/src/types/crypto-position";
import type { StockPosition } from "@/src/types/stock-position";

function finiteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeSymbol(value: string | null | undefined) {
  return (value ?? "").trim().toUpperCase();
}

function sumKnown(values: Array<number | null>) {
  const known = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (known.length === 0) return null;
  return known.reduce((total, value) => total + value, 0);
}

function calculatePercent(numerator: number | null, denominator: number | null) {
  if (numerator === null || denominator === null || denominator === 0) return null;
  return (numerator / denominator) * 100;
}

function quoteMapFromSnapshot(snapshot: YahooQuoteSnapshot | null | undefined) {
  return new Map((snapshot?.quotes ?? []).map((quote) => [quote.symbol.toUpperCase(), quote]));
}

function quoteStatus(quote: YahooQuote | null | undefined): LiveValuationSourceStatus | null {
  if (!quote) return null;
  if (quote.dataQuality === "live") return "live";
  if (quote.dataQuality === "stale") return "stale";
  return "unavailable";
}

function buildPositionValuation(input: {
  assetClass: "crypto" | "stock";
  averageCost: number | null;
  currentPrice: number | null;
  currency: string | null | undefined;
  name: string | null | undefined;
  quantity: number | null;
  quote: YahooQuote | null | undefined;
  symbol: string;
}): LivePositionValuation {
  const quotePrice = finiteNumber(input.quote?.price);
  const manualPrice = finiteNumber(input.currentPrice);
  const price = quotePrice ?? manualPrice;
  const quantity = finiteNumber(input.quantity);
  const costBasis =
    quantity !== null && input.averageCost !== null ? quantity * input.averageCost : null;
  const currentValue = quantity !== null && price !== null ? quantity * price : null;
  const unrealizedPnl =
    currentValue !== null && costBasis !== null ? currentValue - costBasis : null;
  const status =
    quotePrice !== null
      ? quoteStatus(input.quote) ?? "live"
      : manualPrice !== null
        ? "manual_fallback"
        : "unavailable";

  return {
    assetClass: input.assetClass,
    costBasis,
    currency: input.quote?.currency ?? input.currency ?? null,
    currentValue,
    name: input.name || input.symbol,
    price,
    quantity,
    sourceStatus: status,
    symbol: input.symbol,
    unrealizedPnl,
    unrealizedPnlPercent: calculatePercent(unrealizedPnl, costBasis),
    warningMessage:
      status === "manual_fallback"
        ? "Using stored/manual current price because Yahoo quote is unavailable."
        : status === "unavailable"
          ? "Missing live quote and manual current price."
          : status === "stale"
            ? "Using stale cached Yahoo quote after refresh failed."
            : undefined,
  };
}

function stockToValuation(stock: StockPosition, quoteMap: Map<string, YahooQuote>) {
  const symbol = normalizeSymbol(stock.symbol);
  return buildPositionValuation({
    assetClass: "stock",
    averageCost: finiteNumber(stock.averageCost),
    currentPrice: finiteNumber(stock.currentPrice),
    currency: stock.currency,
    name: stock.name,
    quantity: finiteNumber(stock.quantity),
    quote: quoteMap.get(symbol),
    symbol,
  });
}

function cryptoToValuation(crypto: CryptoPosition, quoteMap: Map<string, YahooQuote>) {
  const symbol = normalizeSymbol(crypto.symbol);
  return buildPositionValuation({
    assetClass: "crypto",
    averageCost: finiteNumber(crypto.averageCost),
    currentPrice: finiteNumber(crypto.currentPrice),
    currency: crypto.currency,
    name: crypto.name,
    quantity: finiteNumber(crypto.quantity),
    quote: quoteMap.get(symbol),
    symbol,
  });
}

function inferPortfolioDataQuality(
  positions: LivePositionValuation[],
): LiveValuationSourceStatus {
  if (positions.length === 0) return "unavailable";
  if (positions.every((position) => position.sourceStatus === "live")) return "live";
  if (positions.some((position) => position.sourceStatus === "unavailable")) return "partial";
  if (positions.some((position) => position.sourceStatus === "stale")) return "stale";
  if (positions.some((position) => position.sourceStatus === "manual_fallback")) {
    return "manual_fallback";
  }
  return "partial";
}

export function buildPortfolioLiveValuationSnapshot(input: {
  quoteSnapshot?: YahooQuoteSnapshot | null;
  truth: PortfolioTruthReadback | null;
}): PortfolioLiveValuationSnapshot {
  const quoteMap = quoteMapFromSnapshot(input.quoteSnapshot);
  const positions = [
    ...(input.truth?.positions.stock ?? []).map((stock) => stockToValuation(stock, quoteMap)),
    ...(input.truth?.positions.crypto ?? []).map((crypto) => cryptoToValuation(crypto, quoteMap)),
  ].filter((position) => position.symbol.length > 0);
  const currentValue = sumKnown(positions.map((position) => position.currentValue));
  const costBasis = sumKnown(positions.map((position) => position.costBasis));
  const unrealizedPnl =
    currentValue !== null && costBasis !== null ? currentValue - costBasis : null;

  return {
    costBasis,
    currentValue,
    dataQuality: inferPortfolioDataQuality(positions),
    generatedAt: new Date().toISOString(),
    informationalOnlyDisclaimer:
      "Live valuation preview is informational only. It is not investment advice, a recommendation, or an order instruction.",
    manualFallbackSymbols: positions
      .filter((position) => position.sourceStatus === "manual_fallback")
      .map((position) => position.symbol),
    missingQuoteSymbols: positions
      .filter((position) => position.sourceStatus === "unavailable")
      .map((position) => position.symbol),
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
    source: "yahoo_live_preview",
    staleQuoteSymbols: positions
      .filter((position) => position.sourceStatus === "stale")
      .map((position) => position.symbol),
    unrealizedPnl,
    unrealizedPnlPercent: calculatePercent(unrealizedPnl, costBasis),
  };
}
