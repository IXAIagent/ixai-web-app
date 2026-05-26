"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, BarChart3, Clock, Database, Sparkles, Users } from "lucide-react";
import {
  ShellCard,
  ShellHeader,
  ShellMetricCard,
  ShellStatusPill,
} from "@/components/shell/shell-primitives";

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
          throw new Error(payload.message || "無法載入會員快照。");
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
      ? "載入中"
      : snapshot.persistence === "supabase"
        ? "Supabase"
        : snapshot.configured
          ? "Memory fallback"
          : "Memory / 未設定";

  return (
    <ShellCard className="border-[var(--ixai-border)] bg-[#0a2119] p-5 sm:p-6">
      <ShellHeader
        action={<ShellStatusPill icon={Database}>{persistenceLabel}</ShellStatusPill>}
        eyebrow="會員系統快照"
        subtitle="僅顯示聚合後的會員與轉換準備狀態。原始 email 與會員 records 不會出現在此 Admin 介面。"
        title="Pro 權限基礎"
      />

      {state === "error" ? (
        <div className="mt-5 rounded-lg border border-red-300/20 bg-red-950/20 p-4 text-sm leading-6 text-red-100/80">
          會員快照暫時無法取得。
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <ShellMetricCard icon={Users} label="總會員" value={snapshot.totalMembers} />
        <ShellMetricCard icon={Users} label="Free 會員" value={snapshot.freeMembers} />
        <ShellMetricCard icon={BadgeCheck} label="Active Pro" value={snapshot.activePro} />
        <ShellMetricCard icon={Sparkles} label="試用" value={snapshot.trials} />
        <ShellMetricCard icon={Sparkles} label="Pro 等候名單" value={snapshot.proWaitlistCount} />
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <ShellMetricCard icon={BarChart3} label="Pro 候選" value={snapshot.proCandidates} />
        <ShellMetricCard
          icon={BarChart3}
          label="轉換候選"
          value={snapshot.conversionCandidates}
        />
        <ShellMetricCard icon={Clock} label="已過期" value={snapshot.expired} />
        <article className="min-w-0 rounded-lg border border-white/10 bg-white/[0.045] p-4">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--ixai-gold)]">
            <BarChart3 className="h-3.5 w-3.5 stroke-current" aria-hidden="true" />
            Pro 轉換率
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
          ["主要方案", snapshot.topPlans, "尚無會員紀錄。"],
          [
            "主要 Pro 功能需求",
            snapshot.topRequestedProFeatures,
            "尚無 Pro 等候名單功能需求。",
          ],
        ].map(([title, rows, emptyLabel]) => (
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4" key={title as string}>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--ixai-gold)]">
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
    </ShellCard>
  );
}
