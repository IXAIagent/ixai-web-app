"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  BookOpenCheck,
  MessageCircle,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

// v1.36.2 — Aggregated audience snapshot on /admin. Loads
// /api/admin/audience/snapshot and renders read-depth + segment counts.
// Never displays emails or per-user rows.

type AudienceSurface = "weekly" | "daily" | "market" | "fcn";

type Snapshot = {
  mode: "supabase" | "memory";
  configured: boolean;
  totalProfiles: number;
  activeProfiles: number;
  highEngagementCount: number;
  proCandidateCount: number;
  returningReaderCount: number;
  lineConnectedCount: number;
  avgReadDepth: number;
  favoriteSurfaceDistribution: { surface: AudienceSurface; count: number }[];
  topSegments: { label: string; count: number }[];
  recentlyActiveCount: number;
};

type LineSummary = {
  mode: "supabase" | "memory";
  configured: boolean;
  linkedCount: number;
  recentlyActiveCount: number;
  uniqueEmailsLinked: number;
  connectionRate: number;
};

type Response = {
  ok: boolean;
  snapshot?: Snapshot;
  line?: LineSummary;
  note?: string;
  message?: string;
};

const EMPTY_LINE: LineSummary = {
  mode: "memory",
  configured: false,
  linkedCount: 0,
  recentlyActiveCount: 0,
  uniqueEmailsLinked: 0,
  connectionRate: 0,
};

const EMPTY: Snapshot = {
  mode: "memory",
  configured: false,
  totalProfiles: 0,
  activeProfiles: 0,
  highEngagementCount: 0,
  proCandidateCount: 0,
  returningReaderCount: 0,
  lineConnectedCount: 0,
  avgReadDepth: 0,
  favoriteSurfaceDistribution: [
    { surface: "weekly", count: 0 },
    { surface: "daily", count: 0 },
    { surface: "market", count: 0 },
    { surface: "fcn", count: 0 },
  ],
  topSegments: [],
  recentlyActiveCount: 0,
};

const SURFACE_LABELS: Record<AudienceSurface, string> = {
  weekly: "Weekly Intelligence",
  daily: "Daily Brief",
  market: "Market Overview",
  fcn: "FCN Education",
};

const TAG_LABELS: Record<string, string> = {
  line_connected: "LINE connected",
  high_engagement: "High engagement",
  pro_candidate: "Pro candidate",
  crypto_reader: "Crypto reader",
  fcn_reader: "FCN reader",
  macro_reader: "Macro reader",
};

type MetricProps = {
  label: string;
  value: number | string;
  icon: typeof Users;
};

function Metric({ label, value, icon: Icon }: MetricProps) {
  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
      <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </div>
      <p className="mt-2 font-mono text-2xl font-semibold text-[var(--ixai-cream)]">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </article>
  );
}

function ListBlock({
  title,
  rows,
  emptyLabel,
}: {
  title: string;
  rows: { label: string; count: number }[];
  emptyLabel: string;
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

export function AudienceSnapshot() {
  const [snapshot, setSnapshot] = useState<Snapshot>(EMPTY);
  const [line, setLine] = useState<LineSummary>(EMPTY_LINE);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    let active = true;

    async function load() {
      setState("loading");
      try {
        const response = await fetch("/api/admin/audience/snapshot", {
          cache: "no-store",
        });
        const payload = (await response.json()) as Response;
        if (!response.ok || !payload.ok || !payload.snapshot) {
          throw new Error(payload.message || "Unable to load audience snapshot.");
        }
        if (!active) return;
        setSnapshot(payload.snapshot);
        setLine(payload.line ?? EMPTY_LINE);
        setNote(payload.note || "");
        setState("ready");
      } catch (error) {
        if (!active) return;
        setSnapshot(EMPTY);
        setNote(error instanceof Error ? error.message : "Unable to load audience snapshot.");
        setState("error");
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  const surfaceRows = snapshot.favoriteSurfaceDistribution.map((row) => ({
    label: SURFACE_LABELS[row.surface] ?? row.surface,
    count: row.count,
  }));

  const segmentRows = snapshot.topSegments.map((row) => ({
    label: TAG_LABELS[row.label] ?? row.label,
    count: row.count,
  }));

  return (
    <section className="rounded-lg border border-[var(--ixai-border)] bg-[#0a2119] p-5 text-[var(--ixai-cream)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Audience Snapshot
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-7">
            Subscriber engagement graph
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[rgba(245,240,230,0.62)]">
            Aggregated counts from the IXAI subscriber profile layer. Raw rows
            and email addresses stay in the database.
          </p>
          {note ? (
            <p className="mt-2 text-xs leading-5 text-[rgba(245,240,230,0.5)]">
              {note}
            </p>
          ) : null}
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-md border border-white/10 bg-white/[0.06] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[rgba(245,240,230,0.66)]">
          {state === "loading"
            ? "Loading"
            : snapshot.mode === "supabase"
              ? "Supabase"
              : "Memory"}
        </span>
      </div>

      {state === "error" ? (
        <div className="mt-5 rounded-lg border border-red-300/20 bg-red-950/20 p-4 text-sm leading-6 text-red-100/80">
          Audience snapshot is temporarily unavailable. Subscriber capture continues to write durably.
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Users} label="Total profiles" value={snapshot.totalProfiles} />
        <Metric icon={Sparkles} label="High engagement" value={snapshot.highEngagementCount} />
        <Metric icon={TrendingUp} label="Pro candidates" value={snapshot.proCandidateCount} />
        <Metric icon={Activity} label="Returning readers" value={snapshot.returningReaderCount} />
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric icon={BookOpenCheck} label="Avg read depth %" value={snapshot.avgReadDepth} />
        <Metric icon={Activity} label="Active (7d)" value={snapshot.recentlyActiveCount} />
        <Metric icon={MessageCircle} label="LINE connected" value={line.linkedCount || snapshot.lineConnectedCount} />
        <Metric icon={Users} label="Active subscribers" value={snapshot.activeProfiles} />
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <ListBlock
          emptyLabel="No favorite surface yet — readers will appear here once profile reads accumulate."
          rows={surfaceRows}
          title="Favorite surface distribution"
        />
        <ListBlock
          emptyLabel="No segments assigned yet."
          rows={segmentRows}
          title="Top audience segments"
        />
      </div>

      <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.035] p-4">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
          <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
          LINE Identity Bridge
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-white/10 bg-white/[0.045] p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[rgba(245,240,230,0.62)]">
              Linked accounts
            </p>
            <p className="mt-1.5 font-mono text-xl font-semibold text-[var(--ixai-cream)]">
              {line.linkedCount.toLocaleString()}
            </p>
          </div>
          <div className="rounded-md border border-white/10 bg-white/[0.045] p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[rgba(245,240,230,0.62)]">
              Connection rate
            </p>
            <p className="mt-1.5 font-mono text-xl font-semibold text-[var(--ixai-cream)]">
              {line.connectionRate.toFixed(1)}%
            </p>
          </div>
          <div className="rounded-md border border-white/10 bg-white/[0.045] p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[rgba(245,240,230,0.62)]">
              Active (7d)
            </p>
            <p className="mt-1.5 font-mono text-xl font-semibold text-[var(--ixai-cream)]">
              {line.recentlyActiveCount.toLocaleString()}
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-[rgba(245,240,230,0.5)]">
          LINE bridge is a foundation — real LIFF / OAuth wiring will land in a follow-up. The endpoint is gated by IXAI_LINE_LINK_SECRET; no client OAuth is exposed.
        </p>
      </div>
    </section>
  );
}
