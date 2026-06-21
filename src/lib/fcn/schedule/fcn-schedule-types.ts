export type FcnScheduleSourceStatus = "fallback" | "live" | "partial" | "unavailable";

export type FcnScheduleEventType =
  | "coupon"
  | "ko_observation"
  | "maturity"
  | "observation"
  | "unknown";

export type FcnScheduleUrgency =
  | "due_soon"
  | "future"
  | "overdue"
  | "unavailable"
  | "upcoming";

export interface FcnScheduleWarning {
  code: string;
  message: string;
}

export interface FcnCouponScheduleEvent {
  couponDate?: string;
  currency?: string;
  daysUntilEvent?: number;
  eventType: FcnScheduleEventType;
  expectedCouponAmount?: number;
  fcnId: string;
  fcnName: string;
  id: string;
  maturityDate?: string;
  observationEndDate?: string;
  observationStartDate?: string;
  paymentDate?: string;
  sourceStatus: FcnScheduleSourceStatus;
  urgency: FcnScheduleUrgency;
  warningMessage?: string;
}

export interface FcnMonthlyCashflow {
  currency: string;
  eventCount: number;
  events: FcnCouponScheduleEvent[];
  expectedCouponAmount: number | null;
  monthKey: string;
}

export interface FcnPositionScheduleSummary {
  id: string;
  informationalOnlyDisclaimer: string;
  monthlyCashflows: FcnMonthlyCashflow[];
  name: string;
  nextCouponEvent?: FcnCouponScheduleEvent;
  nextMaturityEvent?: FcnCouponScheduleEvent;
  nextObservationEvent?: FcnCouponScheduleEvent;
  sourceStatus: FcnScheduleSourceStatus;
  upcomingEvents: FcnCouponScheduleEvent[];
  updatedAt: string;
  warnings: FcnScheduleWarning[];
}

export interface FcnPortfolioScheduleSummary {
  dueSoonEventCount: number;
  informationalOnlyDisclaimer: string;
  monthlyCashflows: FcnMonthlyCashflow[];
  next30DayEvents: FcnCouponScheduleEvent[];
  overdueEventCount: number;
  positionCount: number;
  scheduledPositionCount: number;
  sourceStatus: FcnScheduleSourceStatus;
  summaries: FcnPositionScheduleSummary[];
  unavailablePositionCount: number;
  upcomingEventCount: number;
  updatedAt: string;
}
