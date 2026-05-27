"use client";

import { useEffect } from "react";
import { Brain, CalendarClock, ChartNoAxesCombined, Radar, ShieldCheck } from "lucide-react";
import { IdentifySessionCard } from "@/components/auth/identify-session-card";
import { useIdentitySession } from "@/components/auth/identity-provider";
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
  }, [activeMembership]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-6 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
      <section className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)] sm:p-7">
        <PreviewBadge label="Future Pro Intelligence" surface="pro_portfolio" />
        <h1 className="mt-3 font-serif text-2xl font-semibold leading-tight sm:text-5xl">
          IXAI Pro Intelligence Layer
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68 sm:text-base">
          這是未來真正的 Pro Intelligence route。現階段不啟用個人資料、不做
          paywall，也不提供投資建議；僅展示 entitlement-aware intelligence shell。
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
        title="連接你的 Pro Intelligence context"
      />

      <ConnectLineCard source="pro_intelligence" />

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
                className="min-w-0 rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.84)] p-4 sm:p-5"
                key={module.title}
              >
                <div className="flex items-center gap-2 text-[var(--ixai-gold)]">
                  <Icon className="h-4 w-4 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" fill="none" />
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
    </div>
  );
}
