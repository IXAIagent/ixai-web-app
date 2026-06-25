import type { ProgramBSafetyFlags } from "@/src/lib/market-data/live-provider-readiness";

export type ValuationQuoteStatus =
  | "manual_fallback"
  | "missing_quote"
  | "stale_quote"
  | "unavailable";

export interface ValuationInputModel {
  assetClass: "stock" | "crypto" | "fcn" | "cash" | "unknown";
  currency: string | null;
  quantity: number | null;
  symbol: string | null;
}

export interface PortfolioValuationSnapshotModel {
  generatedAt: string;
  inputCount: number;
  phase: "V22_PORTFOLIO_LIVE_VALUATION_READINESS";
  quoteStatus: ValuationQuoteStatus;
  safetyFlags: ProgramBSafetyFlags;
  sourceStatus: "readiness_only";
}

export interface FcnUnderlyingValuationReadiness {
  missingQuoteHandling: ValuationQuoteStatus;
  staleQuoteHandling: ValuationQuoteStatus;
  supported: true;
  warningMessage: string;
}
