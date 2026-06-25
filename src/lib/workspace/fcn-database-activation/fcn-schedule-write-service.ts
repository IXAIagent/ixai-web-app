"use client";

import type { FCNDraftScheduleItem } from "@/src/lib/portfolio/input/fcn-draft-store";

export type V14FcnApiObservationScheduleInput = {
  couponPaymentDate?: string;
  observationEnd?: string;
  periodLabel?: string;
  status?: "paid" | "pending" | "scheduled" | "skipped";
};

export function normalizeFcnDraftScheduleForPositionWrite(
  schedule: FCNDraftScheduleItem[],
): V14FcnApiObservationScheduleInput[] {
  return schedule
    .map((item) => ({
      couponPaymentDate: item.couponDate || undefined,
      observationEnd: item.observationDate || undefined,
      periodLabel: item.label?.trim() || undefined,
      status: "scheduled" as const,
    }))
    .filter((item) => item.couponPaymentDate || item.observationEnd || item.periodLabel);
}
