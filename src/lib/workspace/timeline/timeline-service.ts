"use client";

import { getWorkspaceAlertSummary } from "@/src/lib/alerts";
import { getWorkspaceFcnScheduleSummary } from "@/src/lib/fcn/schedule";
import { buildWorkspaceTimelineSummary } from "@/src/lib/workspace/timeline/timeline-engine";
import type { WorkspaceTimelineSummary } from "@/src/lib/workspace/timeline/timeline-types";

export async function getWorkspaceTimelineSummary(): Promise<WorkspaceTimelineSummary> {
  try {
    const [alerts, fcnSchedule] = await Promise.all([
      getWorkspaceAlertSummary(),
      getWorkspaceFcnScheduleSummary(),
    ]);

    return buildWorkspaceTimelineSummary({
      alerts,
      fcnSchedule,
    });
  } catch {
    return buildWorkspaceTimelineSummary({
      alerts: {
        alertCount: 0,
        alerts: [],
        criticalCount: 0,
        generatedAt: new Date().toISOString(),
        highCount: 0,
        informationalOnlyDisclaimer: "",
        warningCount: 0,
      },
      fcnSchedule: {
        dueSoonEventCount: 0,
        informationalOnlyDisclaimer: "",
        monthlyCashflows: [],
        next30DayEvents: [],
        overdueEventCount: 0,
        positionCount: 0,
        scheduledPositionCount: 0,
        sourceStatus: "unavailable",
        summaries: [],
        unavailablePositionCount: 0,
        upcomingEventCount: 0,
        updatedAt: new Date().toISOString(),
      },
    });
  }
}
