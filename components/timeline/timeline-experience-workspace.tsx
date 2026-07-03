"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, CalendarClock, Clock3, ShieldAlert } from "lucide-react";

import { WorkspaceTimelineSummary } from "@/components/workspace/workspace-timeline-summary";
import {
  WorkspaceDiagnosticsPanel,
  WorkspaceKpiGrid,
  WorkspaceProductHero,
  WorkspaceProductSection,
} from "@/components/workspace/product";
import { getWorkspaceTimelineSummary, type WorkspaceTimelineEvent, type WorkspaceTimelineSummary as TimelineSummary } from "@/src/lib/workspace/timeline";
import { runWorkspaceSafe } from "@/src/lib/workspace/runtime-safety";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-TW", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}

function eventLabel(type: string) {
  if (type.includes("fcn")) return "FCN";
  if (type === "alert") return "提醒";
  if (type === "portfolio") return "資產";
  if (type === "watchlist") return "市場";
  return "事件";
}

function EventList({ events, empty }: { empty: string; events: WorkspaceTimelineEvent[] }) {
  if (events.length === 0) {
    return <p className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4 text-sm leading-6 text-[var(--ixai-forest-soft)]">{empty}</p>;
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {events.slice(0, 8).map((event) => (
        <article className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4" key={event.id}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-base font-semibold text-[var(--ixai-forest)]">{event.title}</p>
              <p className="mt-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
                {formatDate(event.date)} · {eventLabel(event.eventType)}
              </p>
            </div>
            <span className="rounded-full border border-[var(--ixai-border)] bg-white/70 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
              {event.daysUntil === 0 ? "今天" : `${event.daysUntil} 天`}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--ixai-forest-soft)]">{event.description}</p>
        </article>
      ))}
    </div>
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

  const todayEvents = useMemo(
    () => timeline?.groups.find((group) => group.key === "today")?.events ?? [],
    [timeline],
  );
  const next7Events = useMemo(
    () => timeline?.groups.find((group) => group.key === "next7Days")?.events ?? [],
    [timeline],
  );
  const allEvents = useMemo(() => timeline?.groups.flatMap((group) => group.events) ?? [], [timeline]);
  const fcnEvents = allEvents.filter((event) => event.eventType.includes("fcn"));
  const alertEvents = allEvents.filter((event) => event.eventType === "alert");

  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] text-[var(--ixai-forest)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-5 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
        <WorkspaceProductHero
          eyebrow="Timeline"
          kpis={[
            { description: "今天需要查看的事件。", icon: CalendarClock, label: "Today", value: String(todayEvents.length) },
            { description: "未來 7 天要留意的事件。", icon: Clock3, label: "Next 7 Days", value: String(next7Events.length) },
            { description: "FCN observation、coupon、maturity。", icon: ShieldAlert, label: "FCN Events", value: String(fcnEvents.length) },
            { description: "和提醒相關的日期事件。", icon: Bell, label: "Alerts", value: String(alertEvents.length) },
          ]}
          side={
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                今天 / 本週
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">{todayEvents.length + next7Events.length} 個近期事件</p>
              <p className="mt-3 text-sm leading-6 text-white/68">
                {allEvents.length > 0 ? "先看今天與本週，再往下看 FCN 與資產事件。" : "近期沒有重要事件。"}
              </p>
            </>
          }
          summary="把 FCN 觀察日、配息、到期與 dated alerts 整理成今天與本週要看的事件。"
          title="近期事件：今天和本週要注意什麼。"
        />

        <WorkspaceProductSection
          description="用 grouping 呈現，不像 raw timeline dump。"
          eyebrow="Today / This Week"
          title="今天與本週"
        >
          <EventList
            empty="近期沒有重要事件。新增 FCN、Portfolio 或提醒後，這裡會顯示接下來需要注意的日期。"
            events={[...todayEvents, ...next7Events]}
          />
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="保留 observation、coupon、maturity 與 alerts，但用產品事件卡呈現。"
          eyebrow="Upcoming Events"
          title="FCN / Portfolio 事件"
        >
          <WorkspaceKpiGrid
            items={[
              { description: "FCN observation、coupon、maturity。", icon: ShieldAlert, label: "FCN", value: String(fcnEvents.length) },
              { description: "與提醒相關的日期事件。", icon: Bell, label: "提醒", tone: alertEvents.length > 0 ? "warning" : "default", value: String(alertEvents.length) },
              { description: "所有近期事件數。", icon: CalendarClock, label: "全部", value: String(allEvents.length) },
              { description: "今天加未來七天。", icon: Clock3, label: "本週", value: String(todayEvents.length + next7Events.length) },
            ]}
          />
          <div className="mt-4">
            <EventList empty="目前沒有 FCN 或資產事件。" events={[...fcnEvents, ...alertEvents]} />
          </div>
        </WorkspaceProductSection>

        <WorkspaceDiagnosticsPanel description="timeline source、schedule source">
          <WorkspaceTimelineSummary />
          <p className="rounded-lg border border-[var(--ixai-border)] bg-white/62 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
            {timeline?.informationalOnlyDisclaimer ?? "Timeline uses existing FCN schedule and alert readback only."}
          </p>
        </WorkspaceDiagnosticsPanel>
      </section>
    </main>
  );
}
