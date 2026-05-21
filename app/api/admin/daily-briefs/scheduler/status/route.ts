import type { NextRequest } from "next/server";
import { isAdminRequestAuthorized } from "@/src/lib/admin/auth";
import {
  getLastGenerationSummary,
  isSchedulerConfigured,
} from "@/src/lib/editorial/scheduler";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isAdminRequestAuthorized(request)) {
    return Response.json(
      {
        status: "unauthorized",
        message: "Missing or invalid admin session.",
      },
      { status: 401 },
    );
  }

  return Response.json({
    schedulerConfigured: isSchedulerConfigured(),
    lastGeneration: getLastGenerationSummary(),
    note: "Scheduler creates review drafts only. Human publish remains required.",
  });
}
