"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, CalendarClock, Clock3, ShieldAlert } from "lucide-react";

import { WorkspaceTimelineSummary } from "@/components/workspace/workspace-timeline-summary";
import {
  WorkspaceDiagnosticsPanel,
  WorkspaceEmptyState,
  WorkspaceKpiGrid,
  WorkspaceProductHero,
  WorkspaceProductSection,
} from "@/components/workspace/product";
import {
  getWorkspaceTimelineSummary,
  type WorkspaceTimelineEvent,
  type WorkspaceTimelineSummary as TimelineSummary,
} from "@/src/lib/workspace/timeline";
import { runWorkspaceSafe } from "@/src/lib/workspace/runtime-safety";

function formatEventTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "時間待確認";
  return new Intl.DateTimeFormat("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function eventLabel(type: string) {
  if (type === "fcn_coupon") return "Coupon Date";
  if (type === "fcn_maturity") return "Maturity";
  if (type.includes("observation")) return "FCN Observation";
  if (type === "alert") return "Reminder";
  if (type === "portfolio") return "Portfolio";
  if (type === "watchlist") return "Market";
  return "Event";
}

function sortEvents(events: WorkspaceTimelineEvent[]) {
  return [...events]
    .filter((event) => event.eventType !== "system")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function EventGroup({
  empty,
  events,
  title,
}: {
  empty: string;
  events: WorkspaceTimelineEvent[];
  title: string;
}) {
  return (
    <section className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4">
      <h3 className="text-lg font-semibold text-[var(--ixai-forest)]">{title}</h3>
      <div className="mt-4 grid gap-3">
        {events.length > 0 ? (
          events.map((event) => (
            <article className="grid gap-3 rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.68)] p-4 sm:grid-cols-[5rem_1fr]" key={event.id}>
              <div className="font-mono text-sm font-semibold text-[var(--ixai-gold)]">
                {formatEventTime(event.date)}
              </div>
              <div>
                <p className="text-base font-semibold text-[var(--ixai-forest)]">
                  {event.title}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ixai-forest-soft)]">
                  {eventLabel(event.eventType)}
                  {event.relatedSymbol ? ` · ${event.relatedSymbol}` : ""}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                  {event.description}
                </p>
              </div>
            </article>
          ))
        ) : (
          <p className="rounded-lg border border-[var(--ixai-border)] bg-white/62 p-4 text-sm leading-6 text-[var(--ixai-forest-soft)]">
            {empty}
          </p>
        )}
      </div>
    </section>
  );
}

export function TimelineExperienceWorkspace() {
  const [timeline, setTimeline] = useState<TimelineSummary | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    async function load() {
      const result = await runWorkspaceSafe("timeline-experience-summary", getWorkspaceTimelineSummary, null);
      if (!mountedRef.current) return;
      setTimeline(result.data);
    }

    queueMicrotask(() => void load());

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const allEvents = useMemo(
    () => sortEvents(timeline?.groups.flatMap((group) => group.events) ?? []),
    [timeline],
  );
  const todayEvents = useMemo(() => allEvents.filter((event) => event.daysUntil === 0), [allEvents]);
  const tomorrowEvents = useMemo(() => allEvents.filter((event) => event.daysUntil === 1), [allEvents]);
  const thisWeekEvents = useMemo(
    () => allEvents.filter((event) => event.daysUntil > 1 && event.daysUntil <= 7),
    [allEvents],
  );
  const fcnEvents = useMemo(() => allEvents.filter((event) => event.eventType.includes("fcn")), [allEvents]);
  const alertEvents = useMemo(() => allEvents.filter((event) => event.eventType === "alert"), [allEvents]);
  const nextEvent = allEvents[0];

  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] text-[var(--ixai-forest)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-5 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
        <WorkspaceProductHero
          eyebrow="Timeline"
          kpis={[
            { description: "Events happening today.", icon: CalendarClock, label: "Today", value: String(todayEvents.length) },
            { description: "Events happening tomorrow.", icon: Clock3, label: "Tomorrow", value: String(tomorrowEvents.length) },
            { description: "Events in the next seven days.", icon: ShieldAlert, label: "This Week", value: String(thisWeekEvents.length) },
            { description: "Reminders connected to dated events.", icon: Bell, label: "Reminders", value: String(alertEvents.length) },
          ]}
          side={
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                What is happening next?
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">
                {nextEvent ? nextEvent.title : "No upcoming events."}
              </p>
              <p className="mt-3 text-sm leading-6 text-white/68">
                Timeline is for real dated events only. System, provider, and quote issues live in Advanced.
              </p>
            </>
          }
          summary="Timeline answers one question: what is happening next? It is not a system log, provider log, or runtime log."
          title="Timeline: next events in order."
        />

        <WorkspaceProductSection
          description="Only real date-based user events appear here."
          eyebrow="Upcoming"
          title="Today, Tomorrow, This Week"
        >
          <div className="grid gap-4">
            <EventGroup
              empty="No important events today. You are all caught up."
              events={todayEvents}
              title="Today"
            />
            <EventGroup
              empty="No important events tomorrow."
              events={tomorrowEvents}
              title="Tomorrow"
            />
            <EventGroup
              empty="No important events later this week."
              events={thisWeekEvents}
              title="This Week"
            />
          </div>
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="A compact view of event types. Full technical source details stay in Advanced."
          eyebrow="Event Types"
          title="What kind of events are coming?"
        >
          <WorkspaceKpiGrid
            items={[
              { description: "Observation, coupon, or maturity events.", icon: ShieldAlert, label: "FCN", value: String(fcnEvents.length) },
              { description: "User-facing reminders with dates.", icon: Bell, label: "Reminders", tone: alertEvents.length > 0 ? "warning" : "default", value: String(alertEvents.length) },
              { description: "All real upcoming events.", icon: CalendarClock, label: "All Events", value: String(allEvents.length) },
              { description: "Events today through the next seven days.", icon: Clock3, label: "This Week", value: String(todayEvents.length + tomorrowEvents.length + thisWeekEvents.length) },
            ]}
          />
        </WorkspaceProductSection>

        {allEvents.length === 0 ? (
          <WorkspaceEmptyState
            body="No upcoming events. Add FCN positions, reminders, or watched assets and IXAI will show what is happening next."
            icon={CalendarClock}
            title="No upcoming events."
          />
        ) : null}

        <WorkspaceDiagnosticsPanel description="event readback, schedule source, advanced details">
          <WorkspaceTimelineSummary />
          <p className="rounded-lg border border-[var(--ixai-border)] bg-white/62 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
            {timeline?.informationalOnlyDisclaimer ?? "Timeline uses existing FCN schedule and alert readback only."}
          </p>
        </WorkspaceDiagnosticsPanel>
      </section>
    </main>
  );
}
