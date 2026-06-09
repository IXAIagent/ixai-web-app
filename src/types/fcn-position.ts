export const FCN_CURRENCIES = ["USD", "TWD", "USDT"] as const;
export const FCN_STATUSES = ["active", "matured", "called", "archived"] as const;

export type FCNCurrency = (typeof FCN_CURRENCIES)[number];
export type FCNStatus = (typeof FCN_STATUSES)[number];

export type FCNObservationScheduleItem = {
  periodLabel?: string;
  observationStart?: string;
  observationEnd?: string;
  couponPaymentDate?: string;
  status?: string;
};

export type FCNUnderlying = {
  id: string;
  userId: string;
  fcnPositionId: string;
  symbol: string;
  name: string | null;
  market: string | null;
  initialPrice: number | null;
  currentPrice: number | null;
  kiPrice: number | null;
  koPrice: number | null;
  strikePrice: number | null;
  weightPct: number | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type FCNPosition = {
  id: string;
  userId: string;
  portfolioId: string;
  name: string;
  issuer: string | null;
  currency: FCNCurrency;
  notionalAmount: number | null;
  couponRatePct: number | null;
  koPct: number | null;
  kiPct: number | null;
  strikePct: number | null;
  startDate: string | null;
  maturityDate: string | null;
  status: FCNStatus;
  observationSchedule: FCNObservationScheduleItem[];
  metadata: Record<string, unknown>;
  underlyings: FCNUnderlying[];
  createdAt: string;
  updatedAt: string;
};

export type FCNUnderlyingInput = {
  symbol: string;
  name?: string | null;
  market?: string | null;
  initialPrice?: number | null;
  currentPrice?: number | null;
  kiPrice?: number | null;
  koPrice?: number | null;
  strikePrice?: number | null;
  weightPct?: number | null;
  metadata?: Record<string, unknown>;
};

export type FCNPositionCreateInput = {
  portfolioId: string;
  name: string;
  issuer?: string | null;
  currency?: FCNCurrency;
  notionalAmount?: number | null;
  couponRatePct?: number | null;
  koPct?: number | null;
  kiPct?: number | null;
  strikePct?: number | null;
  startDate?: string | null;
  maturityDate?: string | null;
  observationSchedule?: FCNObservationScheduleItem[];
  metadata?: Record<string, unknown>;
  underlyings?: FCNUnderlyingInput[];
};

export type FCNPositionUpdateInput = {
  name?: string;
  issuer?: string | null;
  currency?: FCNCurrency;
  notionalAmount?: number | null;
  couponRatePct?: number | null;
  koPct?: number | null;
  kiPct?: number | null;
  strikePct?: number | null;
  startDate?: string | null;
  maturityDate?: string | null;
  status?: FCNStatus;
  observationSchedule?: FCNObservationScheduleItem[];
  metadata?: Record<string, unknown>;
};

export type FCNPositionRow = {
  id: string;
  user_id: string;
  portfolio_id: string;
  name: string;
  issuer: string | null;
  currency: FCNCurrency;
  notional_amount: number | null;
  coupon_rate_pct: number | null;
  ko_pct: number | null;
  ki_pct: number | null;
  strike_pct: number | null;
  start_date: string | null;
  maturity_date: string | null;
  status: FCNStatus;
  observation_schedule: FCNObservationScheduleItem[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type FCNUnderlyingRow = {
  id: string;
  user_id: string;
  fcn_position_id: string;
  symbol: string;
  name: string | null;
  market: string | null;
  initial_price: number | null;
  current_price: number | null;
  ki_price: number | null;
  ko_price: number | null;
  strike_price: number | null;
  weight_pct: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};
