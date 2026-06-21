export type FcnRiskLevel = "critical" | "high" | "low" | "medium" | "unavailable";

export type FcnRiskSourceStatus =
  | "delayed"
  | "fallback"
  | "live"
  | "partial"
  | "unavailable";

export interface FcnRiskWarning {
  code: string;
  message: string;
  symbol?: string;
}

export interface FcnUnderlyingRisk {
  currentPrice: number | null;
  distanceToKiPercent: number | null;
  distanceToKoPercent: number | null;
  distanceToStrikePercent: number | null;
  hasBreachedKi: boolean;
  hasReachedKo: boolean;
  initialPrice: number | null;
  isBelowStrike: boolean;
  isWorstOf: boolean;
  kiPrice: number | null;
  koPrice: number | null;
  performancePercent: number | null;
  sourceStatus: FcnRiskSourceStatus;
  strikePrice: number | null;
  symbol: string;
  warningMessage?: string;
}

export interface FcnPositionRiskSummary {
  id: string;
  informationalOnlyDisclaimer: string;
  kiBreached: boolean;
  koReady: boolean;
  name: string;
  nearestKiDistancePercent: number | null;
  nearestStrikeDistancePercent: number | null;
  riskLevel: FcnRiskLevel;
  sourceStatus: FcnRiskSourceStatus;
  underlyings: FcnUnderlyingRisk[];
  updatedAt: string;
  warnings: FcnRiskWarning[];
  worstOfPerformancePercent: number | null;
  worstOfSymbol: string | null;
}

export interface FcnPortfolioRiskSummary {
  analyzedPositionCount: number;
  criticalRiskCount: number;
  highRiskCount: number;
  informationalOnlyDisclaimer: string;
  positionCount: number;
  sourceStatus: FcnRiskSourceStatus;
  summaries: FcnPositionRiskSummary[];
  topRiskPositions: FcnPositionRiskSummary[];
  unavailablePositionCount: number;
  updatedAt: string;
}
