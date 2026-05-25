"use client";

import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  Filter,
} from "lucide-react";

// v1.36.3 — Conversion funnel admin UI. Renders the funnel snapshot
// returned by `/api/admin/analytics/funnel`. Desktop renders horizontal
// stage cards with arrow separators; mobile collapses to a vertical
// stack with ArrowDown separators.

type FunnelStageKey =
  | "landing"
  | "article_open"
  | "read_depth_50"
  | "cta_click"
  | "subscribe"
  | "return_visit";

type FunnelStage = {
  key: FunnelStageKey;
  label: string;
  description: string;
  count: number;
  conversionFromPrevious: number;
  conversionFromLanding: number;
  dropoffFromPrevious: number;
};

type FunnelSnapshot = {
  mode: "disabled" | "posthog";
  windowDays: number;
  stages: FunnelStage[];
  totalSubscribers: number;
  totalReturningReaders: number;
  topCapturePaths: { path: string; count: number }[];
  generatedAt: string;
};

type Response = {
  ok: boolean;
  snapshot?: FunnelSnapshot;
  message?: string;
  note?: string;
};

const EMPTY_SNAPSHOT: FunnelSnapshot = {
  mode: "disabled",
  windowDays: 7,
  stages: [],
  totalSubscribers: 0,
  totalReturningReaders: 0,
  topCapturePaths: [],
  generatedAt: new Date().toISOString(),
};

const STAGE_LABELS: Record<FunnelStageKey, string> = {
  landing: "進站",
  article_open: "文章開啟",
  read_depth_50: "閱讀深度 50%+",
  cta_click: "CTA 點擊",
  subscribe: "訂閱",
  return_visit: "回訪",
};

function StageCard({ stage, isLast }: { stage: FunnelStage; isLast: boolean }) {
  const accent = isLast
    ? "border-emerald-200/30 bg-emerald-300/[0.06]"
    : "border-white/10 bg-white/[0.045]";

  return (
    <article className={`flex w-full flex-col gap-2 rounded-lg border p-4 ${accent}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
          {STAGE_LABELS[stage.key] ?? stage.label}
        </p>
        {isLast ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-200" aria-hidden="true" />
        ) : null}
      </div>
      <p className="font-mono text-2xl font-semibold text-[var(--ixai-cream)]">
        {stage.count.toLocaleString()}
      </p>
      <p className="text-xs leading-5 text-[rgba(245,240,230,0.62)]">{stage.description}</p>
      <div className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.16em] text-[rgba(245,240,230,0.54)]">
        <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 font-mono">
          {stage.conversionFromLanding.toFixed(1)}% 進站轉換
        </span>
        <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 font-mono">
          {stage.conversionFromPrevious.toFixed(1)}% 步驟轉換
        </span>
        <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 font-mono">
          {stage.dropoffFromPrevious.toFixed(1)}% 流失
        </span>
      </div>
    </article>
  );
}

export function ConversionFunnel() {
  const [snapshot, setSnapshot] = useState<FunnelSnapshot>(EMPTY_SNAPSHOT);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    let active = true;

    async function load() {
      setState("loading");
      try {
        const response = await fetch("/api/admin/analytics/funnel", {
          cache: "no-store",
        });
        const payload = (await response.json()) as Response;
        if (!response.ok || !payload.ok || !payload.snapshot) {
          throw new Error(payload.message || "無法載入轉換漏斗。");
        }
        if (!active) return;
        setSnapshot(payload.snapshot);
        setNote(payload.note || "");
        setState("ready");
      } catch (error) {
        if (!active) return;
        setSnapshot(EMPTY_SNAPSHOT);
        setNote(error instanceof Error ? error.message : "無法載入轉換漏斗。");
        setState("error");
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  const stages = snapshot.stages.length > 0 ? snapshot.stages : [];

  return (
    <section className="rounded-lg border border-[var(--ixai-border)] bg-[#0a2119] p-5 text-[var(--ixai-cream)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            轉換漏斗
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-7">
            進站 → 訂閱 → 回訪
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[rgba(245,240,230,0.62)]">
            近 {snapshot.windowDays} 日聚合轉換漏斗。Counts 來自 PostHog
            distinct_ids；訂閱總數會與 Supabase durable capture table 對齊。
          </p>
          {note ? (
            <p className="mt-2 text-xs leading-5 text-[rgba(245,240,230,0.5)]">
              {note}
            </p>
          ) : null}
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-md border border-white/10 bg-white/[0.06] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[rgba(245,240,230,0.66)]">
          <Filter className="h-3 w-3 text-[var(--ixai-gold)]" aria-hidden="true" />
          {state === "loading" ? "載入中" : snapshot.mode === "posthog" ? "PostHog" : "未啟用"}
        </span>
      </div>

      {state === "error" ? (
        <div className="mt-5 rounded-lg border border-red-300/20 bg-red-950/20 p-4 text-sm leading-6 text-red-100/80">
          轉換漏斗暫時無法取得。下一次載入 Admin 時會重新嘗試聚合。
        </div>
      ) : null}

      {/* Mobile: vertical stack with ArrowDown separators */}
      <div className="mt-5 flex flex-col gap-3 sm:hidden">
        {stages.map((stage, index) => (
          <div key={`mobile-${stage.key}`} className="flex flex-col items-center gap-2">
            <StageCard stage={stage} isLast={index === stages.length - 1} />
            {index < stages.length - 1 ? (
              <ArrowDown
                aria-hidden="true"
                className="h-4 w-4 text-[var(--ixai-gold)]"
              />
            ) : null}
          </div>
        ))}
      </div>

      {/* Desktop: horizontal cards with ArrowRight separators */}
      <div className="mt-5 hidden gap-3 sm:flex sm:flex-wrap sm:items-stretch">
        {stages.map((stage, index) => (
          <div className="flex flex-1 min-w-[180px] items-center gap-3" key={`desktop-${stage.key}`}>
            <StageCard stage={stage} isLast={index === stages.length - 1} />
            {index < stages.length - 1 ? (
              <ArrowRight
                aria-hidden="true"
                className="hidden h-4 w-4 shrink-0 text-[var(--ixai-gold)] lg:inline"
              />
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
            主要捕捉入口
          </p>
          <ul className="mt-2 grid gap-1.5">
            {snapshot.topCapturePaths.length > 0 ? (
              snapshot.topCapturePaths.map((row) => (
                <li
                  className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.045] px-3 py-2 font-mono text-xs text-[rgba(245,240,230,0.78)]"
                  key={row.path}
                >
                  <span className="min-w-0 truncate">{row.path}</span>
                  <span className="font-semibold text-[var(--ixai-cream)]">
                    {row.count.toLocaleString()}
                  </span>
                </li>
              ))
            ) : (
              <li className="rounded-md border border-white/10 bg-white/[0.035] px-3 py-2 text-xs text-[rgba(245,240,230,0.52)]">
                此期間尚無訂閱事件。
              </li>
            )}
          </ul>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
            總計
          </p>
          <div className="mt-2 grid gap-1.5 font-mono text-xs text-[rgba(245,240,230,0.78)]">
            <div className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.045] px-3 py-2">
              <span>持久化訂閱者</span>
              <span className="font-semibold text-[var(--ixai-cream)]">
                {snapshot.totalSubscribers.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.045] px-3 py-2">
              <span>回訪讀者（≥2 天）</span>
              <span className="font-semibold text-[var(--ixai-cream)]">
                {snapshot.totalReturningReaders.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
