import type { NextRequest } from "next/server";
import { isAdminRequestAuthorized } from "@/src/lib/admin/auth";
import {
  getLastGenerationSummary,
  isSchedulerConfigured,
} from "@/src/lib/editorial/scheduler";
import { buildDailyBriefPublishHealth } from "@/src/lib/editorial/brief-health";
import { getDraftsAsync } from "@/src/lib/editorial/repository";

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

  const drafts = await getDraftsAsync();

  return Response.json({
    health: buildDailyBriefPublishHealth({
      drafts,
      lastGeneration: getLastGenerationSummary(),
    }),
    schedulerConfigured: isSchedulerConfigured(),
    lastGeneration: getLastGenerationSummary(),
    note: "Scheduler creates review drafts only. Human publish remains required.",
  });
}
