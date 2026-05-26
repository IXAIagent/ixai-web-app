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
import {
  ShellCard,
  ShellHeader,
  ShellMetricCard,
  ShellStatusPill,
} from "@/components/shell/shell-primitives";

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
  knownSubscribers: number;
  anonymousVisitors: number;
  subscriberConversionRate: number;
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
  knownSubscribers: 0,
  anonymousVisitors: 0,
  subscriberConversionRate: 0,
  topSurfaces: [],
  topReferrers: [],
  topUtmSources: [],
  trends: [],
};

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
          throw new Error(payload.message || "無法載入分析快照。");
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
        setNote(error instanceof Error ? error.message : "無法載入分析快照。");
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
    <ShellCard className="border-[var(--ixai-border)] bg-[#0a2119] p-5 sm:p-6">
      <ShellHeader
        action={
          <ShellStatusPill icon={Radio}>
            {state === "loading" ? "載入中" : isDisabled ? "未啟用" : "PostHog"}
          </ShellStatusPill>
        }
        eyebrow="情報分析快照"
        title="Public Intelligence 使用概況"
      >
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Public Intelligence 使用行為的真實事件聚合。原始事件與個別使用者層級資料
            不會顯示在管理控制台。
          </p>
          {note ? (
            <p className="mt-2 text-xs leading-5 text-[rgba(245,240,230,0.5)]">
              {note}
            </p>
          ) : null}
      </ShellHeader>

      {state === "error" ? (
        <div className="mt-5 rounded-lg border border-red-300/20 bg-red-950/20 p-4 text-sm leading-6 text-red-100/80">
          分析快照暫時無法取得。Public App analytics 仍會以 silent fail 處理。
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <ShellMetricCard icon={BarChart3} label="每週開啟" value={snapshot.weeklyOpens} />
        <ShellMetricCard icon={Activity} label="每日開啟" value={snapshot.dailyOpens} />
        <ShellMetricCard icon={TrendingUp} label="市場開啟" value={snapshot.marketOpens} />
        <ShellMetricCard icon={Share2} label="分享點擊" value={snapshot.shareClicks} />
        <ShellMetricCard icon={MousePointerClick} label="CTA 點擊" value={snapshot.ctaClicks} />
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <ShellMetricCard
          icon={Activity}
          label="已識別訂閱者"
          value={snapshot.knownSubscribers}
        />
        <ShellMetricCard
          icon={Radio}
          label="匿名訪客"
          value={snapshot.anonymousVisitors}
        />
        <article className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
            <TrendingUp className="h-3.5 w-3.5 stroke-current" aria-hidden="true" />
            轉換率
          </div>
          <p className="mt-2 font-mono text-2xl font-semibold text-[var(--ixai-cream)]">
            {snapshot.subscriberConversionRate.toLocaleString(undefined, {
              maximumFractionDigits: 1,
              minimumFractionDigits: 0,
            })}
            %
          </p>
        </article>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        <SnapshotList
          emptyLabel={isDisabled ? "PostHog 聚合尚未設定。" : "尚無入口資料。"}
          rows={snapshot.topSurfaces}
          title="熱門入口"
        />
        <SnapshotList
          emptyLabel="尚無來源資料。"
          rows={snapshot.topReferrers}
          title="主要來源"
        />
        <SnapshotList
          emptyLabel="尚無 UTM 資料。"
          rows={snapshot.topUtmSources}
          title="主要 UTM 來源"
        />
      </div>

      <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.035] p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
          近 7 日趨勢
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
              尚無趨勢資料。
            </p>
          )}
        </div>
      </div>
    </ShellCard>
  );
}
