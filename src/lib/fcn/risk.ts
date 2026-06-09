import type {
  FCNPosition,
  FCNUnderlying,
  FCNUnderlyingWorstOfReturn,
  FCNWorstOfStatus,
  FCNWorstOfSummary,
} from "@/src/types/fcn-position";

const RISK_ENGINE_VERSION = "v1.82.1" as const;

function isFiniteNumber(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function calculateUnderlyingReturn(underlying: FCNUnderlying): FCNUnderlyingWorstOfReturn {
  const initialPrice = underlying.initialPrice;
  const currentPrice = underlying.currentPrice;
  const hasValidInitialPrice = isFiniteNumber(initialPrice) && initialPrice > 0;
  const hasCurrentPrice = isFiniteNumber(currentPrice);
  let status: Exclude<FCNWorstOfStatus, "missing_underlyings"> = "ready";
  let underlyingReturnPct: number | null = null;

  if (!hasValidInitialPrice) {
    status = "invalid_initial_price";
  } else if (!hasCurrentPrice) {
    status = "missing_current_price";
  } else {
    underlyingReturnPct = ((currentPrice - initialPrice) / initialPrice) * 100;
  }

  return {
    currentPrice: underlying.currentPrice,
    initialPrice: underlying.initialPrice,
    name: underlying.name,
    status,
    symbol: underlying.symbol,
    underlyingId: underlying.id,
    underlyingReturnPct,
  };
}

function getSummaryStatus(underlyings: FCNUnderlyingWorstOfReturn[]): FCNWorstOfStatus {
  if (underlyings.length === 0) {
    return "missing_underlyings";
  }

  if (underlyings.some((underlying) => underlying.status === "invalid_initial_price")) {
    return "invalid_initial_price";
  }

  if (underlyings.some((underlying) => underlying.status === "missing_current_price")) {
    return "missing_current_price";
  }

  return "ready";
}

function findWorstUnderlying(underlyings: FCNUnderlyingWorstOfReturn[]) {
  return underlyings
    .filter((underlying) => isFiniteNumber(underlying.underlyingReturnPct))
    .toSorted((a, b) => (a.underlyingReturnPct ?? 0) - (b.underlyingReturnPct ?? 0))[0];
}

export function calculateFcnWorstOf(
  position: Pick<FCNPosition, "underlyings"> | { underlyings?: FCNUnderlying[] | null },
): FCNWorstOfSummary {
  const underlyings = Array.isArray(position.underlyings) ? position.underlyings : [];
  const underlyingReturns = underlyings.map(calculateUnderlyingReturn);
  const status = getSummaryStatus(underlyingReturns);
  const worstUnderlying = status === "ready" ? findWorstUnderlying(underlyingReturns) : null;

  return {
    riskEngineVersion: RISK_ENGINE_VERSION,
    status,
    underlyings: underlyingReturns,
    worstUnderlyingCurrentPrice: worstUnderlying?.currentPrice ?? null,
    worstUnderlyingInitialPrice: worstUnderlying?.initialPrice ?? null,
    worstUnderlyingName: worstUnderlying?.name ?? null,
    worstUnderlyingReturnPct: worstUnderlying?.underlyingReturnPct ?? null,
    worstUnderlyingSymbol: worstUnderlying?.symbol ?? null,
  };
}
