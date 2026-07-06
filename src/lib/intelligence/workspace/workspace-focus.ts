import { buildTodayFocus } from "@/src/lib/intelligence/monitoring";
import type { MonitoringEvent, TodayFocusItem } from "@/src/lib/intelligence/monitoring";
import type { WorkspaceFocusItem } from "@/src/lib/intelligence/workspace/workspace-types";

export function buildWorkspaceTodayFocus(
  monitoringEvents: MonitoringEvent[],
  focusItems?: TodayFocusItem[],
): WorkspaceFocusItem[] {
  const sourceItems = focusItems ?? buildTodayFocus(monitoringEvents);

  return sourceItems
    .map((item) => ({
      ...item,
      presentationRank: Math.round(item.confidence * 100),
    }))
    .sort((a, b) => b.presentationRank - a.presentationRank)
    .slice(0, 3);
}
