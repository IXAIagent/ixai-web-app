import type { YahooQuoteSnapshot } from "@/src/lib/market-data/yahoo";

export type LiveValuationSourceStatus =
  | "live"
  | "manual_fallback"
  | "partial"
  | "stale"
  | "unavailable";

export type LiveValuationAssetClass = "stock" | "crypto" | "fcn";

export type LivePositionValuation = {
  assetClass: LiveValuationAssetClass;
  costBasis: number | null;
  currency: string | null;
  currentValue: number | null;
  name: string;
  price: number | null;
  quantity: number | null;
  sourceStatus: LiveValuationSourceStatus;
  symbol: string;
  unrealizedPnl: number | null;
  unrealizedPnlPercent: number | null;
  warningMessage?: string;
};

export type PortfolioLiveValuationSnapshot = {
  costBasis: number | null;
  currentValue: number | null;
  dataQuality: LiveValuationSourceStatus;
  generatedAt: string;
  informationalOnlyDisclaimer: string;
  manualFallbackSymbols: string[];
  missingQuoteSymbols: string[];
  positionCount: number;
  positions: LivePositionValuation[];
  quoteSnapshot: Pick<
    YahooQuoteSnapshot,
    "cacheStatus" | "dataQuality" | "generatedAt" | "source" | "staleQuoteSymbols"
  > | null;
  readOnly: true;
  source: "yahoo_live_preview";
  staleQuoteSymbols: string[];
  unrealizedPnl: number | null;
  unrealizedPnlPercent: number | null;
};

export type FcnLiveUnderlyingStatus = {
  currentPrice: number | null;
  dataQuality: LiveValuationSourceStatus;
  distanceToKiPercent: number | null;
  distanceToKoPercent: number | null;
  distanceToStrikePercent: number | null;
  fcnName: string;
  initialPrice: number | null;
  isWorstOf: boolean;
  kiPrice: number | null;
  koPrice: number | null;
  performancePercent: number | null;
  sourceStatus: LiveValuationSourceStatus;
  strikePrice: number | null;
  symbol: string;
  warningMessage?: string;
};

export type FcnLivePositionStatus = {
  dataQuality: LiveValuationSourceStatus;
  id: string;
  name: string;
  underlyings: FcnLiveUnderlyingStatus[];
  warningMessages: string[];
  worstOfPerformancePercent: number | null;
  worstOfSymbol: string | null;
};

export type FcnLiveUnderlyingSnapshot = {
  dataQuality: LiveValuationSourceStatus;
  generatedAt: string;
  informationalOnlyDisclaimer: string;
  missingQuoteSymbols: string[];
  positionCount: number;
  positions: FcnLivePositionStatus[];
  quoteSnapshot: Pick<
    YahooQuoteSnapshot,
    "cacheStatus" | "dataQuality" | "generatedAt" | "source" | "staleQuoteSymbols"
  > | null;
  readOnly: true;
  source: "yahoo_live_preview";
  staleQuoteSymbols: string[];
  topWorstOf: FcnLivePositionStatus | null;
};

export type LiveProductValuationPreview = {
  fcn: FcnLiveUnderlyingSnapshot;
  generatedAt: string;
  portfolio: PortfolioLiveValuationSnapshot;
  quoteSnapshot: YahooQuoteSnapshot | null;
  readOnly: true;
};
