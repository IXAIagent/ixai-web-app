import { getMarketQuotes } from "@/src/lib/market/providers";
import { getDemoFcnPositions } from "@/src/lib/fcn/positions";
import type { MarketQuote } from "@/src/lib/market-data/types";
import type {
  FcnConcentrationExposure,
  FcnPortfolioSnapshot,
  FcnPosition,
  FcnPositionSnapshot,
  FcnRiskLevel,
  FcnUnderlyingSnapshot,
} from "@/src/types/fcn";

const usableQuoteStatuses = new Set(["real", "realtime", "delayed"]);

function uniqueSymbols(positions: FcnPosition[]) {
  return [
    ...new Set(
      positions.flatMap((position) =>
        position.underlyings.map((underlying) => underlying.symbol),
      ),
    ),
  ];
}

function parseQuotePrice(price: string) {
  const numeric = Number(price.replace(/[^\d.-]/g, ""));
  return Number.isFinite(numeric) ? numeric : undefined;
}

function formatPercent(value?: number) {
  if (typeof value !== "number") {
    return "--";
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function getRiskRank(level: FcnRiskLevel) {
  return {
    breached: 4,
    highRisk: 3,
    watch: 2,
    safe: 1,
    unavailable: 0,
  }[level];
}

function calculateRiskLevel(worstOf?: FcnUnderlyingSnapshot): FcnRiskLevel {
  if (!worstOf?.isQuoteUsable || typeof worstOf.knockInDistancePercent !== "number") {
    return "unavailable";
  }

  if (typeof worstOf.currentPrice === "number" && worstOf.currentPrice <= worstOf.knockInPrice) {
    return "breached";
  }

  if (worstOf.knockInDistancePercent <= 5) {
    return "highRisk";
  }

  if (worstOf.knockInDistancePercent <= 15) {
    return "watch";
  }

  if (typeof worstOf.priceChangePercent === "number" && worstOf.priceChangePercent <= -20) {
    return "watch";
  }

  return "safe";
}

function findNextObservation(position: FcnPosition, now: Date) {
  const nowTime = now.getTime();

  return position.observationSchedule.find(
    (item) => new Date(item.couponPaymentDate).getTime() >= nowTime,
  );
}

function buildUnderlyingSnapshot(
  underlying: FcnPosition["underlyings"][number],
  quote?: MarketQuote,
): FcnUnderlyingSnapshot {
  const isQuoteUsable = Boolean(quote && usableQuoteStatuses.has(quote.status));
  const currentPrice = isQuoteUsable && quote ? parseQuotePrice(quote.price) : undefined;
  const priceChangePercent =
    typeof currentPrice === "number"
      ? ((currentPrice - underlying.initialPrice) / underlying.initialPrice) * 100
      : undefined;
  const knockInDistancePercent =
    typeof currentPrice === "number"
      ? ((currentPrice - underlying.knockInPrice) / currentPrice) * 100
      : undefined;
  const knockOutDistancePercent =
    typeof currentPrice === "number"
      ? ((underlying.knockOutPrice - currentPrice) / currentPrice) * 100
      : undefined;

  return {
    ...underlying,
    currentPrice,
    formattedCurrentPrice: quote?.price ?? "資料不可用",
    isQuoteUsable: Boolean(isQuoteUsable && typeof currentPrice === "number"),
    knockInDistancePercent,
    knockOutDistancePercent,
    priceChangePercent,
    quoteSourceLabel: quote?.sourceLabel ?? "資料來源待確認",
    quoteStatus: quote?.status ?? "unavailable",
    updatedAt: quote?.updatedAt,
  };
}

function calculatePositionSnapshot(
  position: FcnPosition,
  quotesBySymbol: Map<string, MarketQuote>,
  now: Date,
): FcnPositionSnapshot {
  const underlyings = position.underlyings.map((underlying) =>
    buildUnderlyingSnapshot(underlying, quotesBySymbol.get(underlying.symbol)),
  );
  const usableUnderlyings = underlyings.filter(
    (underlying) => underlying.isQuoteUsable && typeof underlying.priceChangePercent === "number",
  );
  const worstOf = usableUnderlyings.toSorted(
    (a, b) => (a.priceChangePercent ?? 0) - (b.priceChangePercent ?? 0),
  )[0];
  const riskLevel = calculateRiskLevel(worstOf);
  const nextObservation = findNextObservation(position, now);

  return {
    position,
    underlyings,
    worstOf,
    riskLevel,
    nextCouponDate: nextObservation?.couponPaymentDate,
    nextObservation,
    unavailableCount: underlyings.filter((underlying) => !underlying.isQuoteUsable).length,
  };
}

function calculateConcentration(positions: FcnPosition[]): FcnConcentrationExposure[] {
  const exposure = new Map<string, FcnConcentrationExposure>();

  positions.forEach((position) => {
    position.underlyings.forEach((underlying) => {
      const existing = exposure.get(underlying.symbol);

      if (existing) {
        existing.count += 1;
        existing.fcnNames.push(position.name);
        return;
      }

      exposure.set(underlying.symbol, {
        symbol: underlying.symbol,
        name: underlying.name,
        count: 1,
        fcnNames: [position.name],
      });
    });
  });

  return [...exposure.values()].toSorted((a, b) => b.count - a.count || a.symbol.localeCompare(b.symbol));
}

export function formatFcnPercent(value?: number) {
  return formatPercent(value);
}

export function formatFcnDate(value?: string) {
  if (!value) {
    return "尚未排定";
  }

  return new Intl.DateTimeFormat("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function getFcnRiskLabel(level: FcnRiskLevel) {
  return {
    breached: "KI Breached",
    highRisk: "High Risk",
    safe: "Safe",
    unavailable: "等待市場資料",
    watch: "Watch",
  }[level];
}

export async function getFcnPortfolioSnapshot(
  positions: FcnPosition[] = getDemoFcnPositions(),
  now = new Date(),
): Promise<FcnPortfolioSnapshot> {
  const quotes = await getMarketQuotes(uniqueSymbols(positions));
  const quotesBySymbol = new Map(quotes.map((quote) => [quote.symbol, quote]));
  const snapshots = positions.map((position) =>
    calculatePositionSnapshot(position, quotesBySymbol, now),
  );
  const highestRiskPosition = snapshots.toSorted(
    (a, b) => getRiskRank(b.riskLevel) - getRiskRank(a.riskLevel),
  )[0];
  const upcomingCouponDates = snapshots
    .map((snapshot) => snapshot.nextCouponDate)
    .filter((date): date is string => Boolean(date))
    .toSorted((a, b) => new Date(a).getTime() - new Date(b).getTime());

  return {
    positions: snapshots,
    concentration: calculateConcentration(positions),
    totalFcns: positions.length,
    highRiskCount: snapshots.filter((snapshot) =>
      snapshot.riskLevel === "highRisk" || snapshot.riskLevel === "breached",
    ).length,
    breachedCount: snapshots.filter((snapshot) => snapshot.riskLevel === "breached").length,
    nextCouponDate: upcomingCouponDates[0],
    highestRiskPosition,
    generatedAt: now.toISOString(),
  };
}
