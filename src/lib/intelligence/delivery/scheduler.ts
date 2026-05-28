import type { DeliveryScheduleDefinition } from "@/src/lib/intelligence/delivery/types";

export const DELIVERY_SCHEDULES: DeliveryScheduleDefinition[] = [
  {
    cadence: "daily",
    category: "morning_intelligence",
    channel: "line",
    localTime: "08:00",
    tier: "public",
  },
  {
    cadence: "event_driven",
    category: "market_volatility_alert",
    channel: "app",
    tier: "preview",
  },
  {
    cadence: "event_driven",
    category: "watchlist_alert",
    channel: "line",
    tier: "pro",
  },
  {
    cadence: "event_driven",
    category: "fcn_intelligence_preview",
    channel: "line",
    tier: "pro",
  },
];

export function getDeliverySchedulerReadiness() {
  return {
    cronConfigured: false,
    eventDrivenReady: true,
    nextFoundationStep: "Add opt-in persistence and a server-side delivery queue before sending real pushes.",
    schedules: DELIVERY_SCHEDULES,
  };
}
