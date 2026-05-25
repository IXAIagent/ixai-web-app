"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, BarChart3, Eye, MessageCircle, Sparkles, Users } from "lucide-react";

type MembershipSnapshot = {
  activePro: number;
  conversionCandidates: number;
  freeMembers: number;
  proCandidates: number;
  proWaitlistCount: number;
  totalMembers: number;
};

type AudienceSnapshot = {
  highEngagementCount: number;
  lineConnectedCount: number;
  returningReaderCount: number;
};

type LineSummary = {
  linkedCount: number;
};

type AnalyticsSnapshot = {
  ctaClicks: number;
  topSurfaces: { label: string; count: number }[];
};

const EMPTY_MEMBERSHIP: MembershipSnapshot = {
  activePro: 0,
  conversionCandidates: 0,
  freeMembers: 0,
  proCandidates: 0,
  proWaitlistCount: 0,
  totalMembers: 0,
};

const EMPTY_AUDIENCE: AudienceSnapshot = {
  highEngagementCount: 0,
  lineConnectedCount: 0,
  returningReaderCount: 0,
};

const EMPTY_ANALYTICS: AnalyticsSnapshot = {
  ctaClicks: 0,
  topSurfaces: [],
};

type MetricProps = {
  icon: typeof Users;
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

async function fetchSnapshot<T>(path: string, fallback: T): Promise<T> {
  const response = await fetch(path, { cache: "no-store" });
  const payload = (await response.json()) as { ok?: boolean; snapshot?: T; line?: LineSummary };

  if (!response.ok || !payload.ok || !payload.snapshot) {
    return fallback;
  }

  if (path.includes("/audience/")) {
    const audienceSnapshot = payload.snapshot as unknown as AudienceSnapshot;

    return {
      ...payload.snapshot,
      lineConnectedCount:
        payload.line?.linkedCount ?? audienceSnapshot.lineConnectedCount,
    } as T;
  }

  return payload.snapshot;
}

export function ProReadinessSnapshot() {
  const [membership, setMembership] = useState<MembershipSnapshot>(EMPTY_MEMBERSHIP);
  const [audience, setAudience] = useState<AudienceSnapshot>(EMPTY_AUDIENCE);
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot>(EMPTY_ANALYTICS);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let active = true;

    async function load() {
      setState("loading");

      try {
        const [membershipSnapshot, audienceSnapshot, analyticsSnapshot] = await Promise.all([
          fetchSnapshot<MembershipSnapshot>("/api/admin/membership/snapshot", EMPTY_MEMBERSHIP),
          fetchSnapshot<AudienceSnapshot>("/api/admin/audience/snapshot", EMPTY_AUDIENCE),
          fetchSnapshot<AnalyticsSnapshot>("/api/admin/analytics/snapshot", EMPTY_ANALYTICS),
        ]);

        if (!active) return;
        setMembership(membershipSnapshot);
        setAudience(audienceSnapshot);
        setAnalytics(analyticsSnapshot);
        setState("ready");
      } catch {
        if (!active) return;
        setState("error");
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  const proPreviewOpens = useMemo(() => {
    return analytics.topSurfaces
      .filter((row) => row.label === "pro_preview" || row.label === "pro_intelligence")
      .reduce((sum, row) => sum + row.count, 0);
  }, [analytics.topSurfaces]);

  return (
    <section className="rounded-lg border border-[var(--ixai-border)] bg-[#0a2119] p-5 text-[var(--ixai-cream)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Pro Readiness Snapshot
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-7">
            Pro 轉換準備狀態
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[rgba(245,240,230,0.62)]">
            匯總既有 membership、audience graph 與 analytics 訊號，不顯示個別 email
            或原始事件。
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-md border border-white/10 bg-white/[0.06] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[rgba(245,240,230,0.66)]">
          {state === "loading" ? "載入中" : state === "error" ? "部分資料不可用" : "Ready"}
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Sparkles} label="Pro 等候名單" value={membership.proWaitlistCount} />
        <Metric icon={Users} label="Pro 候選" value={membership.proCandidates} />
        <Metric icon={Activity} label="回訪讀者" value={audience.returningReaderCount} />
        <Metric icon={BarChart3} label="高互動使用者" value={audience.highEngagementCount} />
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <Metric icon={MessageCircle} label="LINE 已連接" value={audience.lineConnectedCount} />
        <Metric icon={Eye} label="Pro 預覽開啟" value={proPreviewOpens} />
        <Metric icon={Sparkles} label="Upgrade CTA 點擊" value={analytics.ctaClicks} />
      </div>
    </section>
  );
}
