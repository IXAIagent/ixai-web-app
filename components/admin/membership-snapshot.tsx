"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, BarChart3, Clock, Database, Sparkles, Users } from "lucide-react";

type MembershipSnapshot = {
  persistence: "supabase" | "memory";
  configured: boolean;
  totalMembers: number;
  activePro: number;
  trials: number;
  expired: number;
  conversionCandidates: number;
  freeMembers: number;
  proWaitlistCount: number;
  proCandidates: number;
  proConversionRate: number;
  topPlans: { label: string; count: number }[];
  topRequestedProFeatures: { label: string; count: number }[];
};

type SnapshotResponse = {
  ok?: boolean;
  snapshot?: MembershipSnapshot;
  message?: string;
};

const EMPTY_SNAPSHOT: MembershipSnapshot = {
  persistence: "memory",
  configured: false,
  totalMembers: 0,
  activePro: 0,
  trials: 0,
  expired: 0,
  conversionCandidates: 0,
  freeMembers: 0,
  proWaitlistCount: 0,
  proCandidates: 0,
  proConversionRate: 0,
  topPlans: [],
  topRequestedProFeatures: [],
};

type MetricProps = {
  icon: typeof BarChart3;
  label: string;
  value: number;
};

function Metric({ icon: Icon, label, value }: MetricProps) {
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

export function MembershipSnapshot() {
  const [snapshot, setSnapshot] = useState<MembershipSnapshot>(EMPTY_SNAPSHOT);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let active = true;

    async function loadSnapshot() {
      try {
        const response = await fetch("/api/admin/membership/snapshot", {
          cache: "no-store",
        });
        const payload = (await response.json()) as SnapshotResponse;

        if (!response.ok || !payload.ok || !payload.snapshot) {
          throw new Error(payload.message || "Unable to load membership snapshot.");
        }

        if (!active) {
          return;
        }

        setSnapshot(payload.snapshot);
        setState("ready");
      } catch {
        if (!active) {
          return;
        }

        setSnapshot(EMPTY_SNAPSHOT);
        setState("error");
      }
    }

    void loadSnapshot();

    return () => {
      active = false;
    };
  }, []);

  const persistenceLabel =
    state === "loading"
      ? "Loading"
      : snapshot.persistence === "supabase"
        ? "Supabase"
        : snapshot.configured
          ? "Memory fallback"
          : "Memory / not configured";

  return (
    <section className="rounded-lg border border-[var(--ixai-border)] bg-[#0a2119] p-5 text-[var(--ixai-cream)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Membership Snapshot
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-7">
            Pro entitlement foundation
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[rgba(245,240,230,0.62)]">
            Aggregated membership and conversion readiness only. Raw emails and
            member records are not exposed in this admin surface.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-md border border-white/10 bg-white/[0.06] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[rgba(245,240,230,0.66)]">
          <Database className="h-3 w-3 text-[var(--ixai-gold)]" aria-hidden="true" />
          {persistenceLabel}
        </span>
      </div>

      {state === "error" ? (
        <div className="mt-5 rounded-lg border border-red-300/20 bg-red-950/20 p-4 text-sm leading-6 text-red-100/80">
          Membership snapshot is temporarily unavailable.
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <Metric icon={Users} label="Total members" value={snapshot.totalMembers} />
        <Metric icon={Users} label="Free members" value={snapshot.freeMembers} />
        <Metric icon={BadgeCheck} label="Active Pro" value={snapshot.activePro} />
        <Metric icon={Sparkles} label="Trials" value={snapshot.trials} />
        <Metric icon={Sparkles} label="Pro waitlist" value={snapshot.proWaitlistCount} />
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric icon={BarChart3} label="Pro candidates" value={snapshot.proCandidates} />
        <Metric
          icon={BarChart3}
          label="Conversion candidates"
          value={snapshot.conversionCandidates}
        />
        <Metric icon={Clock} label="Expired" value={snapshot.expired} />
        <article className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
            <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
            Pro conversion rate
          </div>
          <p className="mt-2 font-mono text-2xl font-semibold text-[var(--ixai-cream)]">
            {snapshot.proConversionRate.toLocaleString(undefined, {
              maximumFractionDigits: 1,
              minimumFractionDigits: 0,
            })}
            %
          </p>
        </article>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {[
          ["Top plans", snapshot.topPlans, "No membership records yet."],
          [
            "Top requested Pro features",
            snapshot.topRequestedProFeatures,
            "No Pro waitlist feature requests yet.",
          ],
        ].map(([title, rows, emptyLabel]) => (
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4" key={title as string}>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              {title as string}
            </p>
            <ul className="mt-2 grid gap-1.5">
              {(rows as { label: string; count: number }[]).length ? (
                (rows as { label: string; count: number }[]).map((row) => (
                  <li
                    className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.045] px-3 py-2 font-mono text-xs text-[rgba(245,240,230,0.78)]"
                    key={row.label}
                  >
                    <span>{row.label}</span>
                    <span className="font-semibold text-[var(--ixai-cream)]">{row.count}</span>
                  </li>
                ))
              ) : (
                <li className="rounded-md border border-white/10 bg-white/[0.045] px-3 py-2 text-xs text-[rgba(245,240,230,0.52)]">
                  {emptyLabel as string}
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
