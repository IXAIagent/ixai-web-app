"use client";

import { getWorkspaceAlertSummary } from "@/src/lib/alerts";
import { buildWorkspaceNotificationSummary } from "@/src/lib/notifications/notification-engine";
import type { WorkspaceNotificationSummary } from "@/src/lib/notifications/notification-types";

export async function getWorkspaceNotificationSummary(input?: {
  readIds?: string[];
}): Promise<WorkspaceNotificationSummary> {
  try {
    const alerts = await getWorkspaceAlertSummary();
    return buildWorkspaceNotificationSummary({
      alerts: alerts.alerts,
      readIds: input?.readIds,
    });
  } catch {
    return buildWorkspaceNotificationSummary({
      alerts: [],
      readIds: input?.readIds,
    });
  }
}
