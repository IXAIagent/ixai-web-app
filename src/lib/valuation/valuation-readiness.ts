import { programBSafetyFlags } from "@/src/lib/market-data/live-provider-readiness";
import type {
  FcnUnderlyingValuationReadiness,
  PortfolioValuationSnapshotModel,
  ValuationInputModel,
} from "@/src/lib/valuation/valuation-readiness-types";

export function buildValuationInputModel(input: Partial<ValuationInputModel>): ValuationInputModel {
  return {
    assetClass: input.assetClass ?? "unknown",
    currency: input.currency ?? null,
    quantity: input.quantity ?? null,
    symbol: input.symbol ?? null,
  };
}

export function buildPortfolioLiveValuationReadiness(): PortfolioValuationSnapshotModel {
  return {
    generatedAt: new Date().toISOString(),
    inputCount: 0,
    phase: "V22_PORTFOLIO_LIVE_VALUATION_READINESS",
    quoteStatus: "manual_fallback",
    safetyFlags: programBSafetyFlags,
    sourceStatus: "readiness_only",
  };
}

export function buildFcnUnderlyingValuationReadiness(): FcnUnderlyingValuationReadiness {
  return {
    missingQuoteHandling: "missing_quote",
    staleQuoteHandling: "stale_quote",
    supported: true,
    warningMessage:
      "FCN underlying valuation readiness accepts future quote snapshots, but Program B does not fetch or price FCNs.",
  };
}
