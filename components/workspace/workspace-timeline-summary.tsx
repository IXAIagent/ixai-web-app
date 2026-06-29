"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarClock, RefreshCw } from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import { getWorkspaceTimelineSummary } from "@/src/lib/workspace/timeline";
import type { WorkspaceTimelineSummary } from "@/src/lib/workspace/timeline";
import { runWorkspaceSafe } from "@/src/lib/workspace/runtime-safety";

const GROUP_LABEL: Record<string, string> = {
  later: "Later",
  next7Days: "Next 7 Days",
  overdue: "Overdue",
  today: "Today",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-TW", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function WorkspaceTimelineSummary() {
  const [timeline, setTimeline] = useState<WorkspaceTimelineSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(false);

  async function refresh() {
    setIsLoading(true);
    const result = await runWorkspaceSafe(
      "workspace-timeline-summary",
      getWorkspaceTimelineSummary,
      null,
    );
    if (!mountedRef.current) return;
    setTimeline(result.data);
    setIsLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    mountedRef.current = true;

    queueMicrotask(() => {
      if (!cancelled) void refresh();
    });

    return () => {
      cancelled = true;
      mountedRef.current = false;
    };
  }, []);

  return (
    <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <FeatureIcon icon={CalendarClock} shadow={false} />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              Timeline Engine
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
              Unified future events
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
              Aggregates FCN schedule events and dated alert cards. No fake dates are generated.
            </p>
          </div>
        </div>
        <button
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)] disabled:opacity-60"
          disabled={isLoading}
          onClick={() => void refresh()}
          type="button"
        >
          <RefreshCw className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          {isLoading ? "讀取中" : "重新整理"}
        </button>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {timeline?.groups.map((group) => (
          <article
            className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
            key={group.key}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[var(--ixai-forest)]">
                {GROUP_LABEL[group.key]}
              </p>
              <p className="font-mono text-sm font-semibold text-[var(--ixai-forest-soft)]">
                {group.events.length}
              </p>
            </div>
            <div className="mt-3 grid gap-2">
              {group.events.slice(0, 5).map((event) => (
                <div
                  className="rounded-lg border border-[var(--ixai-border)] bg-white/70 p-3"
                  key={event.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-[var(--ixai-forest)]">
                      {event.title}
                    </p>
                    <span className="rounded-full border border-[var(--ixai-border)] bg-white/70 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
                      {event.daysUntil}d
                    </span>
                  </div>
                  <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[var(--ixai-forest-soft)]">
                    {formatDate(event.date)} · {event.eventType}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                    {event.description}
                  </p>
                </div>
              ))}
              {group.events.length === 0 ? (
                <p className="rounded-lg border border-[var(--ixai-border)] bg-white/70 p-3 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                  No events in this bucket.
                </p>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      {timeline ? (
        <p className="mt-5 rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
          {timeline.informationalOnlyDisclaimer}
        </p>
      ) : null}
    </section>
  );
}
