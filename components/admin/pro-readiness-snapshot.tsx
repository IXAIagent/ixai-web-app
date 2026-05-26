"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, BarChart3, Eye, MessageCircle, Sparkles, Users } from "lucide-react";
import {
  ShellCard,
  ShellHeader,
  ShellMetricCard,
  ShellStatusPill,
} from "@/components/shell/shell-primitives";

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
    <ShellCard className="border-[var(--ixai-border)] bg-[#0a2119] p-5 sm:p-6">
      <ShellHeader
        action={<ShellStatusPill>{state === "loading" ? "載入中" : state === "error" ? "部分資料不可用" : "Ready"}</ShellStatusPill>}
        eyebrow="Pro Readiness Snapshot"
        subtitle="匯總既有 membership、audience graph 與 analytics 訊號，不顯示個別 email 或原始事件。"
        title="Pro 轉換準備狀態"
      />

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <ShellMetricCard icon={Sparkles} label="Pro 等候名單" value={membership.proWaitlistCount} />
        <ShellMetricCard icon={Users} label="Pro 候選" value={membership.proCandidates} />
        <ShellMetricCard icon={Activity} label="回訪讀者" value={audience.returningReaderCount} />
        <ShellMetricCard icon={BarChart3} label="高互動使用者" value={audience.highEngagementCount} />
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <ShellMetricCard icon={MessageCircle} label="LINE 已連接" value={audience.lineConnectedCount} />
        <ShellMetricCard icon={Eye} label="Pro 預覽開啟" value={proPreviewOpens} />
        <ShellMetricCard icon={Sparkles} label="Upgrade CTA 點擊" value={analytics.ctaClicks} />
      </div>
    </ShellCard>
  );
}
