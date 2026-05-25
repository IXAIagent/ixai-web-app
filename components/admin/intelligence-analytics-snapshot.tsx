"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  MousePointerClick,
  Radio,
  Share2,
  TrendingUp,
} from "lucide-react";

type SnapshotRow = {
  label: string;
  count: number;
};

type TrendRow = {
  date: string;
  count: number;
};

type AnalyticsSnapshot = {
  mode: "disabled" | "posthog";
  weeklyOpens: number;
  dailyOpens: number;
  marketOpens: number;
  shareClicks: number;
  ctaClicks: number;
  topSurfaces: SnapshotRow[];
  topReferrers: SnapshotRow[];
  topUtmSources: SnapshotRow[];
  trends: TrendRow[];
};

type SnapshotResponse = {
  ok: boolean;
  snapshot?: AnalyticsSnapshot;
  message?: string;
  note?: string;
};

const EMPTY_SNAPSHOT: AnalyticsSnapshot = {
  mode: "disabled",
  weeklyOpens: 0,
  dailyOpens: 0,
  marketOpens: 0,
  shareClicks: 0,
  ctaClicks: 0,
  topSurfaces: [],
  topReferrers: [],
  topUtmSources: [],
  trends: [],
};

type SnapshotMetricProps = {
  label: string;
  value: number;
  icon: typeof BarChart3;
};

function SnapshotMetric({ label, value, icon: Icon }: SnapshotMetricProps) {
  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
      <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </div>
      <p className="mt-2 font-mono text-2xl font-semibold text-[var(--ixai-cream)]">
        {value.toLocaleString()}
      </p>
    </article>
  );
}

function SnapshotList({
  emptyLabel,
  rows,
  title,
}: {
  emptyLabel: string;
  rows: SnapshotRow[];
  title: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
        {title}
      </p>
      <ul className="mt-2 grid gap-1.5">
        {rows.length ? (
          rows.map((row) => (
            <li
              className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.045] px-3 py-2 font-mono text-xs text-[rgba(245,240,230,0.78)]"
              key={row.label}
            >
              <span className="min-w-0 truncate">{row.label}</span>
              <span className="font-semibold text-[var(--ixai-cream)]">
                {row.count.toLocaleString()}
              </span>
            </li>
          ))
        ) : (
          <li className="rounded-md border border-white/10 bg-white/[0.035] px-3 py-2 text-xs text-[rgba(245,240,230,0.52)]">
            {emptyLabel}
          </li>
        )}
      </ul>
    </div>
  );
}

export function IntelligenceAnalyticsSnapshot() {
  const [snapshot, setSnapshot] = useState<AnalyticsSnapshot>(EMPTY_SNAPSHOT);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    let active = true;

    async function loadSnapshot() {
      setState("loading");

      try {
        const response = await fetch("/api/admin/analytics/snapshot", {
          cache: "no-store",
        });
        const payload = (await response.json()) as SnapshotResponse;

        if (!response.ok || !payload.ok || !payload.snapshot) {
          throw new Error(payload.message || "Unable to load analytics snapshot.");
        }

        if (!active) {
          return;
        }

        setSnapshot(payload.snapshot);
        setNote(payload.note || "");
        setState("ready");
      } catch (error) {
        if (!active) {
          return;
        }

        setSnapshot(EMPTY_SNAPSHOT);
        setNote(error instanceof Error ? error.message : "Unable to load analytics snapshot.");
        setState("error");
      }
    }

    void loadSnapshot();

    return () => {
      active = false;
    };
  }, []);

  const isDisabled = snapshot.mode === "disabled";

  return (
    <section className="rounded-lg border border-[var(--ixai-border)] bg-[#0a2119] p-5 text-[var(--ixai-cream)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Intelligence Analytics Snapshot
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-7">
            Public Intelligence usage overview
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[rgba(245,240,230,0.62)]">
            Real event aggregation for public intelligence usage. Raw events and
            user-level analytics are not exposed in the admin console.
          </p>
          {note ? (
            <p className="mt-2 text-xs leading-5 text-[rgba(245,240,230,0.5)]">
              {note}
            </p>
          ) : null}
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-md border border-white/10 bg-white/[0.06] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[rgba(245,240,230,0.66)]">
          <Radio className="h-3 w-3 text-[var(--ixai-gold)]" aria-hidden="true" />
          {state === "loading" ? "Loading" : isDisabled ? "Disabled" : "PostHog"}
        </span>
      </div>

      {state === "error" ? (
        <div className="mt-5 rounded-lg border border-red-300/20 bg-red-950/20 p-4 text-sm leading-6 text-red-100/80">
          Analytics snapshot is temporarily unavailable. Public app analytics
          continue to fail silently.
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <SnapshotMetric icon={BarChart3} label="Weekly opens" value={snapshot.weeklyOpens} />
        <SnapshotMetric icon={Activity} label="Daily opens" value={snapshot.dailyOpens} />
        <SnapshotMetric icon={TrendingUp} label="Market opens" value={snapshot.marketOpens} />
        <SnapshotMetric icon={Share2} label="Share clicks" value={snapshot.shareClicks} />
        <SnapshotMetric icon={MousePointerClick} label="CTA clicks" value={snapshot.ctaClicks} />
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        <SnapshotList
          emptyLabel={isDisabled ? "PostHog aggregation is not configured." : "No surfaces yet."}
          rows={snapshot.topSurfaces}
          title="Top surfaces"
        />
        <SnapshotList
          emptyLabel="No referrer data yet."
          rows={snapshot.topReferrers}
          title="Top referrers"
        />
        <SnapshotList
          emptyLabel="No UTM data yet."
          rows={snapshot.topUtmSources}
          title="Top UTM sources"
        />
      </div>

      <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.035] p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
          Last 7 days trend
        </p>
        <div className="mt-2 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-7">
          {snapshot.trends.length ? (
            snapshot.trends.map((row) => (
              <div
                className="rounded-md border border-white/10 bg-white/[0.045] px-3 py-2"
                key={row.date}
              >
                <p className="font-mono text-[10px] text-[rgba(245,240,230,0.48)]">
                  {row.date}
                </p>
                <p className="mt-1 font-mono text-sm font-semibold text-[var(--ixai-cream)]">
                  {row.count.toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p className="rounded-md border border-white/10 bg-white/[0.035] px-3 py-2 text-xs text-[rgba(245,240,230,0.52)] sm:col-span-2 lg:col-span-7">
              No trend data available yet.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
