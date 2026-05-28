import type { NextRequest } from "next/server";
import { isAdminRequestAuthorized } from "@/src/lib/admin/auth";
import { getLineConfigState } from "@/src/lib/line/config";
import { getDeliverySchedulerReadiness } from "@/src/lib/intelligence/delivery";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isAdminRequestAuthorized(request)) {
    return Response.json(
      {
        message: "Missing or invalid admin session.",
        status: "unauthorized",
      },
      { status: 401 },
    );
  }

  const line = getLineConfigState();
  const scheduler = getDeliverySchedulerReadiness();

  return Response.json({
    ok: true,
    snapshot: {
      deliveryTierDistribution: {
        preview: scheduler.schedules.filter((schedule) => schedule.tier === "preview").length,
        pro: scheduler.schedules.filter((schedule) => schedule.tier === "pro").length,
        public: scheduler.schedules.filter((schedule) => schedule.tier === "public").length,
      },
      lineReadiness: line.messagingReady && line.loginReady ? 100 : line.loginReady ? 50 : 0,
      mode: "foundation",
      onboardingToDeliveryConversion: 0,
      readinessScore: line.messagingReady ? 60 : 35,
      topInterests: [],
    },
    note:
      "Delivery foundation is configured as architecture only. Real push requires explicit opt-in persistence, queueing, and safe scheduling.",
  });
}
