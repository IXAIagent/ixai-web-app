import type { FCNPosition, FCNUnderlying } from "@/src/types/fcn-position";

export type FCNRiskLevel = "clear" | "watch" | "elevated" | "critical" | "unavailable";

export type FCNKiDistanceResult = {
  currentPrice: number | null;
  distanceToKiPct: number | null;
  initialPrice: number | null;
  kiPrice: number | null;
  name: string | null;
  riskLevel: FCNRiskLevel;
  symbol: string;
  underlyingId: string;
};

export type FCNExposureSummary = {
  count: number;
  underlyingName: string | null;
  underlyingSymbol: string;
};

export type FCNWorstOfRankingItem = {
  fcnId: string;
  fcnName: string;
  returnPct: number | null;
  riskLevel: FCNRiskLevel;
  underlyingName: string | null;
  underlyingSymbol: string | null;
};

function isFiniteNumber(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function calculateKiDistance(underlying: FCNUnderlying): FCNKiDistanceResult {
  const currentPrice = underlying.currentPrice;
  const kiPrice = underlying.kiPrice;
  let distanceToKiPct: number | null = null;

  if (isFiniteNumber(currentPrice) && isFiniteNumber(kiPrice) && kiPrice > 0) {
    distanceToKiPct = ((currentPrice - kiPrice) / kiPrice) * 100;
  }

  return {
    currentPrice,
    distanceToKiPct,
    initialPrice: underlying.initialPrice,
    kiPrice,
    name: underlying.name,
    riskLevel: calculateRiskLevel({ distanceToKiPct }),
    symbol: underlying.symbol,
    underlyingId: underlying.id,
  };
}

export function calculateRiskLevel(input: {
  distanceToKiPct?: number | null;
  worstOfReturnPct?: number | null;
}): FCNRiskLevel {
  const distanceToKiPct = input.distanceToKiPct;
  const worstOfReturnPct = input.worstOfReturnPct;

  if (!isFiniteNumber(distanceToKiPct) && !isFiniteNumber(worstOfReturnPct)) {
    return "unavailable";
  }

  if (
    (isFiniteNumber(distanceToKiPct) && distanceToKiPct <= 0) ||
    (isFiniteNumber(worstOfReturnPct) && worstOfReturnPct <= -35)
  ) {
    return "critical";
  }

  if (
    (isFiniteNumber(distanceToKiPct) && distanceToKiPct <= 10) ||
    (isFiniteNumber(worstOfReturnPct) && worstOfReturnPct <= -25)
  ) {
    return "elevated";
  }

  if (
    (isFiniteNumber(distanceToKiPct) && distanceToKiPct <= 20) ||
    (isFiniteNumber(worstOfReturnPct) && worstOfReturnPct <= -15)
  ) {
    return "watch";
  }

  return "clear";
}

export function buildConcentrationExposureSummary(positions: FCNPosition[]): FCNExposureSummary[] {
  const exposure = new Map<string, FCNExposureSummary>();

  positions.forEach((position) => {
    position.underlyings.forEach((underlying) => {
      const symbol = underlying.symbol.trim().toUpperCase();

      if (!symbol) {
        return;
      }

      const existing = exposure.get(symbol);

      if (existing) {
        existing.count += 1;
        return;
      }

      exposure.set(symbol, {
        count: 1,
        underlyingName: underlying.name,
        underlyingSymbol: symbol,
      });
    });
  });

  return [...exposure.values()].toSorted(
    (a, b) => b.count - a.count || a.underlyingSymbol.localeCompare(b.underlyingSymbol),
  );
}

export function buildWorstOfRanking(positions: FCNPosition[]): FCNWorstOfRankingItem[] {
  return positions
    .map((position) => {
      const worstOf = position.worstOfSummary;

      return {
        fcnId: position.id,
        fcnName: position.name,
        returnPct: worstOf.worstUnderlyingReturnPct,
        riskLevel: calculateRiskLevel({ worstOfReturnPct: worstOf.worstUnderlyingReturnPct }),
        underlyingName: worstOf.worstUnderlyingName,
        underlyingSymbol: worstOf.worstUnderlyingSymbol,
      };
    })
    .filter((item) => isFiniteNumber(item.returnPct))
    .toSorted((a, b) => (a.returnPct ?? 0) - (b.returnPct ?? 0));
}

export function calculatePortfolioRiskScore(input: {
  exposureSummary: FCNExposureSummary[];
  kiDistances: FCNKiDistanceResult[];
  worstOfRanking: FCNWorstOfRankingItem[];
}) {
  const nearKiCount = input.kiDistances.filter(
    (item) => isFiniteNumber(item.distanceToKiPct) && item.distanceToKiPct <= 10,
  ).length;
  const criticalKiCount = input.kiDistances.filter(
    (item) => isFiniteNumber(item.distanceToKiPct) && item.distanceToKiPct <= 0,
  ).length;
  const worstOfPenalty = input.worstOfRanking.reduce((score, item) => {
    if (!isFiniteNumber(item.returnPct)) {
      return score;
    }

    if (item.returnPct <= -35) return score + 18;
    if (item.returnPct <= -25) return score + 12;
    if (item.returnPct <= -15) return score + 7;
    return score;
  }, 0);
  const concentrationPenalty = input.exposureSummary.reduce(
    (score, item) => score + Math.max(0, item.count - 1) * 6,
    0,
  );

  return Math.min(
    100,
    Math.round(criticalKiCount * 20 + nearKiCount * 10 + worstOfPenalty + concentrationPenalty),
  );
}
