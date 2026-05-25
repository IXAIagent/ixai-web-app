"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  Database,
  Mail,
  MessageCircle,
  MousePointerClick,
} from "lucide-react";

type SubscriberStats = {
  persistence: "supabase" | "memory";
  configured: boolean;
  activeSubscribers: number;
  totalCaptured: number;
  last7DaysCaptures: number;
  topSurfaces: { label: string; count: number }[];
  topUtmSources: { label: string; count: number }[];
};

type MetricProps = {
  label: string;
  value: number;
  icon: typeof BarChart3;
};

function Metric({ label, value, icon: Icon }: MetricProps) {
  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
      <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </div>
      <p className="mt-2 font-mono text-2xl font-semibold text-[var(--ixai-cream)]">
        {value}
      </p>
    </article>
  );
}

function Rows({
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
              className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.045] px-3 py-2 font-mono text-xs text-[rgba(245,240,230,0.78)]"
              key={row.label}
            >
              <span>{row.label}</span>
              <span className="font-semibold text-[var(--ixai-cream)]">{row.count}</span>
            </li>
          ))
        ) : (
          <li className="rounded-md border border-white/10 bg-white/[0.045] px-3 py-2 text-xs text-[rgba(245,240,230,0.52)]">
            {emptyLabel}
          </li>
        )}
      </ul>
    </div>
  );
}

export function DistributionSnapshot() {
  const [stats, setStats] = useState<SubscriberStats | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let ignore = false;

    async function loadStats() {
      try {
        const response = await fetch("/api/admin/distribution/subscribers", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("無法載入訂閱者統計。");
        }

        const payload = (await response.json()) as {
          ok?: boolean;
          stats?: SubscriberStats;
        };

        if (!payload.ok || !payload.stats) {
          throw new Error("訂閱者統計回應格式不正確。");
        }

        if (!ignore) {
          setStats(payload.stats);
          setState("ready");
        }
      } catch {
        if (!ignore) {
          setState("error");
        }
      }
    }

    void loadStats();

    return () => {
      ignore = true;
    };
  }, []);

  const persistenceLabel = stats
    ? stats.persistence === "supabase"
      ? "Supabase"
      : stats.configured
        ? "Memory fallback"
        : "Memory / 未設定"
    : "載入中";

  return (
    <section className="rounded-lg border border-[var(--ixai-border)] bg-[#0a2119] p-5 text-[var(--ixai-cream)] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            分發快照
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-7">
            訂閱者 · Email 捕捉 · 來源歸因
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[rgba(245,240,230,0.62)]">
            {state === "loading"
              ? "正在從分發 repository 載入訂閱者 telemetry。"
              : state === "error"
                ? "訂閱者 telemetry 暫時無法取得。"
                : "僅顯示聚合後的訂閱者 telemetry。原始 email 不會出現在 Admin 快照。"}
          </p>
        </div>
        <span className="hidden rounded-md border border-white/10 bg-white/[0.06] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[rgba(245,240,230,0.66)] sm:inline-flex">
          {persistenceLabel}
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Metric icon={BarChart3} label="訂閱者" value={stats?.activeSubscribers ?? 0} />
        <Metric icon={Mail} label="Email 捕捉" value={stats?.totalCaptured ?? 0} />
        <Metric icon={Database} label="近 7 日" value={stats?.last7DaysCaptures ?? 0} />
        <Metric icon={MessageCircle} label="LINE OA 點擊" value={0} />
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <Rows
          emptyLabel="尚無捕捉入口資料。"
          rows={stats?.topSurfaces ?? []}
          title="熱門入口"
        />
        <Rows
          emptyLabel="尚無 UTM 來源資料。"
          rows={stats?.topUtmSources ?? []}
          title="主要 UTM 來源"
        />
      </div>

      <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-[rgba(245,240,230,0.62)]">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
          <MousePointerClick className="h-3.5 w-3.5" aria-hidden="true" />
          持久化模式
        </div>
        <p className="mt-2">
          {persistenceLabel}。Subscribe writes 會在設定完成時使用 Supabase service role；
          本機開發或未設定時會回落到 memory mode。
        </p>
      </div>
    </section>
  );
}
