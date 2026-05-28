"use client";

import { useEffect, useState } from "react";
import { BarChart3, CheckCircle2, Compass, ListChecks, Radio, TrendingUp } from "lucide-react";
import {
  ShellCard,
  ShellHeader,
  ShellMetricCard,
  ShellStatusPill,
} from "@/components/shell/shell-primitives";

type OnboardingSnapshotPayload = {
  completed: number;
  completionRate: number;
  mode: "analytics-ready" | "supabase" | "memory";
  started: number;
  topInterests: Array<{ count: number; label: string }>;
  topMarkets: Array<{ count: number; label: string }>;
  updatedAt: string;
};

type OnboardingSnapshotResponse = {
  note?: string;
  ok?: boolean;
  snapshot?: OnboardingSnapshotPayload;
};

const EMPTY_SNAPSHOT: OnboardingSnapshotPayload = {
  completed: 0,
  completionRate: 0,
  mode: "analytics-ready",
  started: 0,
  topInterests: [],
  topMarkets: [],
  updatedAt: "",
};

export function OnboardingSnapshot() {
  const [snapshot, setSnapshot] = useState<OnboardingSnapshotPayload>(EMPTY_SNAPSHOT);
  const [note, setNote] = useState("");
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let active = true;

    async function loadSnapshot() {
      try {
        const response = await fetch("/api/admin/onboarding/snapshot", {
          cache: "no-store",
        });
        const payload = (await response.json()) as OnboardingSnapshotResponse;

        if (!response.ok || !payload.ok || !payload.snapshot) {
          throw new Error("onboarding_snapshot_failed");
        }

        if (!active) {
          return;
        }

        setSnapshot(payload.snapshot);
        setNote(payload.note ?? "");
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

  return (
    <ShellCard className="border-[var(--ixai-border)] bg-[#0a2119] p-5 sm:p-6">
      <ShellHeader
        action={
          <ShellStatusPill icon={Radio}>
            {state === "loading" ? "Loading" : snapshot.mode}
          </ShellStatusPill>
        }
        eyebrow="Activation"
        subtitle="追蹤 investor profile、watchlist seed 與 intelligence preference 的啟動漏斗。此版本只顯示聚合狀態，不回傳個人資料。"
        title="Onboarding Snapshot"
      />

      {state === "error" ? (
        <div className="mt-5 rounded-lg border border-red-300/20 bg-red-950/20 p-4 text-sm leading-6 text-red-100/80">
          Onboarding 快照暫時無法取得。
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <ShellMetricCard icon={Compass} label="Started" value={snapshot.started} />
        <ShellMetricCard icon={CheckCircle2} label="Completed" value={snapshot.completed} />
        <ShellMetricCard icon={TrendingUp} label="Completion" suffix="%" value={snapshot.completionRate} />
        <ShellMetricCard icon={ListChecks} label="Top Signals" value={snapshot.topInterests.length + snapshot.topMarkets.length} />
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
            <BarChart3 className="h-3.5 w-3.5 stroke-current" aria-hidden="true" />
            Top Markets
          </div>
          <div className="mt-3 grid gap-2 text-sm text-zinc-400">
            {snapshot.topMarkets.length ? (
              snapshot.topMarkets.map((item) => (
                <p className="flex items-center justify-between gap-3" key={item.label}>
                  <span className="truncate">{item.label}</span>
                  <span className="font-mono text-[var(--ixai-cream)]">{item.count}</span>
                </p>
              ))
            ) : (
              <p>等待 onboarding analytics 聚合。</p>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
            <BarChart3 className="h-3.5 w-3.5 stroke-current" aria-hidden="true" />
            Top Interests
          </div>
          <div className="mt-3 grid gap-2 text-sm text-zinc-400">
            {snapshot.topInterests.length ? (
              snapshot.topInterests.map((item) => (
                <p className="flex items-center justify-between gap-3" key={item.label}>
                  <span className="truncate">{item.label}</span>
                  <span className="font-mono text-[var(--ixai-cream)]">{item.count}</span>
                </p>
              ))
            ) : (
              <p>等待 onboarding analytics 聚合。</p>
            )}
          </div>
        </div>
      </div>

      <p className="mt-4 rounded-lg border border-white/10 bg-white/[0.035] p-3 text-xs leading-5 text-[rgba(245,240,230,0.5)]">
        {note ||
          "Onboarding is local/session-first in v1.40. Future profile persistence can promote this into portfolio intelligence and alert delivery."}
      </p>
    </ShellCard>
  );
}
