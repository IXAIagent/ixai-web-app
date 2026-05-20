import {
  getLastGenerationSummary,
  isSchedulerConfigured,
} from "@/src/lib/editorial/scheduler";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    schedulerConfigured: isSchedulerConfigured(),
    lastGeneration: getLastGenerationSummary(),
    note: "Scheduler creates review drafts only. Human publish remains required.",
  });
}
