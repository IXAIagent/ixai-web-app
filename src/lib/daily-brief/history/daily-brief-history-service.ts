"use client";

import { getWorkspaceDailyBrief } from "@/src/lib/daily-brief";
import type { DailyBriefHistorySummary } from "@/src/lib/daily-brief/history/daily-brief-history-types";

export async function getDailyBriefHistorySummary(): Promise<DailyBriefHistorySummary> {
  try {
    const brief = await getWorkspaceDailyBrief();

    return {
      entries: [
        {
          brief,
          id: `workspace-daily-brief-${brief.generatedAt}`,
          sourceStatus: "local",
        },
      ],
      generatedAt: new Date().toISOString(),
      informationalOnlyDisclaimer:
        "Daily Brief history is a readback foundation only. No scheduled job, external news fetching, or AI model call is implemented.",
      sourceStatus: "local",
      totalEntries: 1,
      warnings: [
        "Future daily_briefs storage is planned, but no schema is required in V6.40.",
      ],
    };
  } catch {
    return {
      entries: [],
      generatedAt: new Date().toISOString(),
      informationalOnlyDisclaimer:
        "Daily Brief history is a readback foundation only. No scheduled job, external news fetching, or AI model call is implemented.",
      sourceStatus: "unavailable",
      totalEntries: 0,
      warnings: ["Daily Brief history readback is unavailable."],
    };
  }
}
