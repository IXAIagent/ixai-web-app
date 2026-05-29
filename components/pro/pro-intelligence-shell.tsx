"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight, Brain, CalendarClock, ChartNoAxesCombined, Radar, ShieldCheck } from "lucide-react";
import { IdentifySessionCard } from "@/components/auth/identify-session-card";
import { useIdentitySession } from "@/components/auth/identity-provider";
import { IntelligenceDeliveryCard } from "@/components/intelligence/intelligence-delivery-card";
import { MorningIntelligencePreview } from "@/components/intelligence/morning-intelligence-preview";
import { ConnectLineCard } from "@/components/line/connect-line-card";
import { GatedSurface } from "@/components/pro/gated-surface";
import { PreviewBadge } from "@/components/pro/preview-badge";
import { ProLockCard } from "@/components/pro/pro-lock-card";
import { UpgradeIntelligenceCta } from "@/components/pro/upgrade-intelligence-cta";
import { trackEvent } from "@/src/lib/analytics/analytics";
import type { MembershipPlan } from "@/src/lib/membership/memberships";

const SAMPLE_MODULES = [
  {
    icon: Brain,
    note: "整合個人 Watchlist、閱讀記憶與市場 regime，形成每日優先觀察順序。",
    surface: "pro_watchlist" as const,
    title: "Personal Intelligence",
  },
  {
    icon: ChartNoAxesCombined,
    note: "示意集中度、資產配置與風險曝險分類；不使用真實個人資料。",
    surface: "pro_portfolio" as const,
    title: "Portfolio Intelligence",
  },
  {
    icon: ShieldCheck,
    note: "未來用於 Worst-of、KI distance、KO / coupon calendar 與波動敏感度監控。",
    surface: "pro_fcn_risk" as const,
    title: "FCN Intelligence",
  },
  {
    icon: Radar,
    note: "以總經、AI supply chain、crypto liquidity 與 FCN threshold 建立警示層。",
    surface: "pro_ai_alerts" as const,
    title: "AI Alert Layer",
  },
  {
    icon: CalendarClock,
    note: "把利率、美元、VIX、財報與關鍵事件轉為個人化市場記憶。",
    surface: "pro_macro_intelligence" as const,
    title: "Macro Memory Layer",
  },
];

export function ProIntelligenceShell({ membership = "free" }: { membership?: MembershipPlan }) {
  const { membership: sessionMembership } = useIdentitySession();
  const activeMembership = sessionMembership?.plan ?? membership;

  useEffect(() => {
    trackEvent("pro_intelligence_open", {
      membership: activeMembership,
      path: window.location.pathname,
      source: "pro_intelligence_route",
      surface: "pro_intelligence",
    });
    trackEvent("pro_preview_flow_view", {
      membership: activeMembership,
      path: window.location.pathname,
      source: "pro_intelligence_route",
      surface: "pro_intelligence",
    });
  }, [activeMembership]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-6 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
      <section className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)] sm:p-7">
        <PreviewBadge label="Future Pro Intelligence" surface="pro_portfolio" />
        <h1 className="mt-3 font-serif text-2xl font-semibold leading-tight sm:text-5xl">
          Future Pro Intelligence Layer
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68 sm:text-base">
          這是未來 personalized intelligence 的入口示意。現階段不啟用個人資料、不做
          paywall，也不提供投資建議；僅展示 entitlement-aware intelligence workflow。
        </p>
        <UpgradeIntelligenceCta
          className="mt-5"
          membership={activeMembership}
          source="pro_intelligence_hero"
          surface="pro_portfolio"
        />
      </section>

      <IdentifySessionCard
        source="pro_intelligence"
        title="連接你的 AI Intelligence Workspace"
      />

      <ConnectLineCard source="pro_intelligence" />

      <IntelligenceDeliveryCard source="pro_intelligence" tier="pro" />

      <MorningIntelligencePreview source="pro_intelligence" tier="pro" />

      <GatedSurface
        membership={activeMembership}
        source="pro_intelligence_page"
        surface="pro_portfolio"
      >
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {SAMPLE_MODULES.map((module) => {
            const Icon = module.icon;

            return (
              <article
                className="flex h-full min-w-0 flex-col rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.84)] p-4 sm:p-5"
                key={module.title}
              >
                <div className="flex items-center gap-2 text-[var(--ixai-gold)]">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <PreviewBadge label="Sample-only" surface={module.surface} />
                </div>
                <h2 className="mt-3 text-base font-semibold leading-6 text-[var(--ixai-forest)]">
                  {module.title}
                </h2>
                <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                  {module.note}
                </p>
              </article>
            );
          })}
        </section>
      </GatedSurface>

      <section className="grid gap-3 lg:grid-cols-3">
        <ProLockCard
          note="從 public market intelligence 延伸為 personal portfolio relevance 與 risk map。"
          surface="pro_portfolio"
          title="Portfolio Intelligence"
        />
        <ProLockCard
          note="把 FCN 教育層升級為個人化 Worst-of、KI / KO 與 coupon calendar 監控。"
          surface="pro_fcn_risk"
          title="FCN Risk Intelligence"
        />
        <ProLockCard
          note="將 macro regime、AI supply chain、crypto liquidity 轉為個人化 alert workflow。"
          surface="pro_ai_alerts"
          title="AI Alert Layer"
        />
      </section>

      <section className="grid gap-4 rounded-lg border border-[rgba(176,141,87,0.28)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ixai-gold)]">
            Workspace Exit
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-tight text-[var(--ixai-forest)]">
            這裡是未來 Pro shell，日常 intelligence 先回到 Account。
          </h2>
          <p className="mt-2 text-sm leading-7 text-[var(--ixai-ink-muted)]">
            Account 是目前的 AI Intelligence Workspace，用於管理 identity、LINE readiness 與未來 Pro intent。
          </p>
        </div>
        <Link
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-forest)]"
          href="/account"
        >
          回到 AI Intelligence Workspace
          <ArrowRight className="h-4 w-4 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
