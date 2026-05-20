import type { MarketDataStatus } from "@/src/lib/market-data/types";

export type FcnStatus = "active" | "knockedOut" | "matured" | "atRisk";

export type FcnRiskLevel = "safe" | "watch" | "highRisk" | "breached" | "unavailable";

export type FcnUnderlying = {
  symbol: string;
  name: string;
  initialPrice: number;
  strikePrice: number;
  knockInPrice: number;
  knockOutPrice: number;
};

export type FcnObservationSchedule = {
  periodLabel: string;
  observationStart: string;
  observationEnd: string;
  couponPaymentDate: string;
};

export type FcnPosition = {
  id: string;
  name: string;
  owner?: string;
  currency: "USD" | "TWD";
  underlyings: FcnUnderlying[];
  strikePercent: number;
  knockInPercent: number;
  knockOutPercent: number;
  observationSchedule: FcnObservationSchedule[];
  status: FcnStatus;
};

export type FcnUnderlyingSnapshot = FcnUnderlying & {
  currentPrice?: number;
  formattedCurrentPrice: string;
  priceChangePercent?: number;
  knockInDistancePercent?: number;
  knockOutDistancePercent?: number;
  quoteStatus: MarketDataStatus;
  quoteSourceLabel: string;
  updatedAt?: string;
  isQuoteUsable: boolean;
};

export type FcnPositionSnapshot = {
  position: FcnPosition;
  underlyings: FcnUnderlyingSnapshot[];
  worstOf?: FcnUnderlyingSnapshot;
  riskLevel: FcnRiskLevel;
  nextCouponDate?: string;
  nextObservation?: FcnObservationSchedule;
  unavailableCount: number;
};

export type FcnConcentrationExposure = {
  symbol: string;
  name: string;
  count: number;
  fcnNames: string[];
};

export type FcnPortfolioSnapshot = {
  positions: FcnPositionSnapshot[];
  concentration: FcnConcentrationExposure[];
  totalFcns: number;
  highRiskCount: number;
  breachedCount: number;
  nextCouponDate?: string;
  highestRiskPosition?: FcnPositionSnapshot;
  generatedAt: string;
};

export const FCN_MONITORING_DISCLAIMER =
  "FCN 監控僅用於風險觀察與資訊整理，不構成投資建議、買賣指令或報酬承諾。實際條款、價格與到期結果應以發行文件與交易對手資料為準。";
