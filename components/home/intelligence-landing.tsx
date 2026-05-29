"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  ArrowRight,
  BellRing,
  Brain,
  CalendarClock,
  LineChart,
  MessageCircle,
  Radar,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { MorningIntelligencePreview } from "@/components/intelligence/morning-intelligence-preview";
import { PublicProDeliveryComparison } from "@/components/intelligence/public-pro-delivery-comparison";
import { trackEvent } from "@/src/lib/analytics/analytics";
import { LINE_CONSULTATION_URL } from "@/src/lib/line/public-links";

const PREVIEW_CARDS = [
  {
    copy: "美股風險偏好轉弱，AI supply chain names 仍是觀察核心。",
    icon: LineChart,
    label: "Market Pulse",
  },
  {
    copy: "Watchlist memory 將根據使用者偏好建立個人 intelligence layer。",
    icon: Brain,
    label: "Watchlist Alert",
  },
  {
    copy: "FCN worst-of exposure 需觀察高波動標的與 KI buffer。",
    icon: ShieldCheck,
    label: "FCN Risk Awareness",
  },
  {
    copy: "BTC / ETH 波動升高，crypto liquidity 進入 watch state。",
    icon: Radar,
    label: "AI Risk Monitor",
  },
] as const;

const DIFFERENCE_ITEMS = [
  {
    copy: "每個人看到一樣的新聞，需要自己判斷是否與自己有關。",
    title: "一般市場資訊",
  },
  {
    copy: "IXAI 逐步建立 Watchlist memory，追蹤 FCN / market / AI risk relevance。",
    title: "IXAI Intelligence Layer",
  },
  {
    copy: "未來透過 LINE 主動推送 intelligence。目標是 decision support，不是交易指令。",
    title: "Daily Habit Loop",
  },
] as const;

const DELIVERY_CARDS = [
  ["Morning Intelligence", "每天早上把市場結構、風險偏好與今日焦點整理成一張 briefing。"],
  ["Watchlist Alert", "把你的觀察名單變成 intelligence seed，而不是單純價格列表。"],
  ["FCN Intelligence", "以教育型方式提示波動、worst-of 與 buffer 概念。"],
  ["Macro Risk", "追蹤利率、美元、VIX 與市場風險偏好對科技與台股的影響。"],
] as const;

const PRODUCT_FLOW = [
  ["Public Landing", "先理解 IXAI 的 intelligence value。"],
  ["Onboarding", "建立市場偏好、風險偏好與 Watchlist seed。"],
  ["AI Intelligence Workspace", "在 Account / LINE / delivery surfaces 形成每日關係。"],
  ["Future Pro Interest", "完成基礎輪廓後，再判斷是否加入 Pro 等候名單。"],
  ["Intelligence Preview", "需要更深 context 時，再查看 sample-only Pro preview。"],
  ["Future Pro Intelligence", "未來接上 portfolio、FCN 與個人化風險工作流。"],
] as const;

function trackLandingClick(event: "landing_primary_cta_click" | "landing_preview_click" | "landing_line_cta_click", target: string) {
  trackEvent(event, {
    path: window.location.pathname,
    source: "home_landing",
    target,
  });
}

export function IntelligenceLanding() {
  useEffect(() => {
    trackEvent("landing_view", {
      path: window.location.pathname,
      surface: "home_landing",
    });
    trackEvent("intelligence_landing_preview_view", {
      path: window.location.pathname,
      surface: "home_landing",
    });
    trackEvent("ux_cohesion_preview_view", {
      path: window.location.pathname,
      surface: "home_landing",
    });
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-5 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
      <section className="overflow-hidden rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)]">
        <div className="grid gap-5 p-4 sm:gap-6 sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
              IXAI Intelligence Layer
            </p>
            <h1 className="mt-3 max-w-3xl font-serif text-3xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              讓 AI 開始理解你的投資世界
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:text-base sm:leading-8">
              IXAI 將市場情報、Watchlist、FCN 風險與 LINE intelligence delivery
              整合成一個 AI-native investment intelligence layer。
            </p>
            <div className="mt-6 grid gap-2 sm:flex sm:flex-wrap">
              <Link
                className="ixai-cta-cream inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-cream)] px-4 py-2.5 text-sm font-semibold"
                href="/onboarding"
                onClick={() => trackLandingClick("landing_primary_cta_click", "/onboarding")}
              >
                開始 Onboarding
                <ArrowRight className="h-4 w-4 stroke-current text-[var(--ixai-forest)]" aria-hidden="true" />
              </Link>
              <Link
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)] transition hover:bg-white/8"
                href="/pro-preview"
                onClick={() => trackLandingClick("landing_preview_click", "/pro-preview")}
              >
                查看 Intelligence Preview
                <Sparkles className="h-4 w-4 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" />
              </Link>
            </div>
            <p className="mt-5 max-w-2xl text-xs leading-6 text-white/52">
              IXAI 不是券商、自動下單工具、報牌工具、投顧或一般新聞網站。IXAI 的核心是
              intelligence、workflow 與 risk awareness。
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4 sm:p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ixai-gold)]">
              Today Intelligence Preview
            </p>
            <div className="mt-4 grid gap-3">
              {PREVIEW_CARDS.map(({ copy, icon: Icon, label }) => (
                <article className="rounded-lg border border-white/10 bg-white/[0.045] p-4" key={label}>
                  <div className="flex items-center gap-2 text-[var(--ixai-gold)]">
                    <Icon className="h-4 w-4 stroke-current" aria-hidden="true" />
                    <h2 className="text-sm font-semibold text-[var(--ixai-cream)]">{label}</h2>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/66">{copy}</p>
                </article>
              ))}
            </div>
            <p className="mt-4 rounded-lg border border-white/10 bg-white/[0.035] p-3 text-xs leading-5 text-white/48">
              Sample only。內容僅供市場資訊與風險觀察參考，不構成投資建議、買賣指令或報酬承諾。
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ixai-gold)]">
          Product Flow
        </p>
        <div className="mt-3 grid gap-2 md:grid-cols-5">
          {PRODUCT_FLOW.map(([title, copy], index) => (
            <article className="rounded-lg border border-[var(--ixai-border)] bg-white/48 p-3" key={title}>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ixai-gold)]">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-2 text-sm font-semibold leading-5 text-[var(--ixai-forest)]">{title}</h2>
              <p className="mt-1 text-xs leading-5 text-[var(--ixai-ink-muted)]">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-3 rounded-lg border border-[rgba(176,141,87,0.28)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Why IXAI
          </p>
          <h2 className="mt-2 font-serif text-2xl font-semibold leading-tight text-[var(--ixai-forest)] sm:text-4xl">
            不只是看新聞，而是建立市場 relevance。
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--ixai-ink-muted)]">
            IXAI 的目標不是讓你追逐更多資訊，而是逐步建立 AI 能理解的投資世界：
            市場偏好、Watchlist memory、FCN risk awareness、portfolio relevance foundation。
          </p>
        </div>
        <div className="grid gap-3">
          {DIFFERENCE_ITEMS.map((item) => (
            <article className="rounded-lg border border-[var(--ixai-border)] bg-white/50 p-4" key={item.title}>
              <h3 className="text-base font-semibold text-[var(--ixai-forest)]">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] sm:p-6 lg:grid-cols-[0.88fr_1.12fr]">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Intelligence Delivery
          </p>
          <h2 className="mt-2 font-serif text-2xl font-semibold leading-tight sm:text-4xl">
            每天早上，讓 IXAI 主動出現在你面前。
          </h2>
          <p className="mt-3 text-sm leading-7 text-white/66">
            v1.40.1 已建立 delivery foundation。這裡展示產品願景與 preview，
            不會真正啟動 LINE push 或自動化推播。
          </p>
          <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap">
            <Link
              className="ixai-cta-cream inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-cream)] px-4 py-2.5 text-sm font-semibold"
              href="/onboarding"
              onClick={() => trackLandingClick("landing_primary_cta_click", "/onboarding")}
            >
              設定我的 Intelligence Preferences
              <BellRing className="h-4 w-4 stroke-current text-[var(--ixai-forest)]" aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {DELIVERY_CARDS.map(([title, copy]) => (
            <article className="rounded-lg border border-white/10 bg-white/[0.045] p-4" key={title}>
              <div className="flex items-center gap-2 text-[var(--ixai-gold)]">
                <CalendarClock className="h-4 w-4 stroke-current" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-[var(--ixai-cream)]">{title}</h3>
              </div>
              <p className="mt-2 text-sm leading-6 text-white/62">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 rounded-lg border border-[rgba(176,141,87,0.28)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ixai-gold)]">
            LINE Intelligence
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-tight text-[var(--ixai-forest)] sm:text-2xl">
            需要真人諮詢或未來情報推送，可先連接 LINE。
          </h2>
          <p className="mt-2 text-sm leading-7 text-[var(--ixai-ink-muted)]">
            LINE 是未來 intelligence delivery 的入口；目前以諮詢與連接準備為主，不會自動推播或提供交易指令。
          </p>
        </div>
        <Link
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-forest)]"
          href={LINE_CONSULTATION_URL}
          onClick={() => {
            trackLandingClick("landing_line_cta_click", "line_oa_single");
            trackEvent("line_intelligence_cta_click", {
              path: window.location.pathname,
              source: "home_line_section",
            });
          }}
          rel="noopener noreferrer"
          target="_blank"
        >
          連接 LINE 接收情報
          <MessageCircle className="h-4 w-4 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" />
        </Link>
      </section>

      <MorningIntelligencePreview source="home_landing" tier="public" />

      <PublicProDeliveryComparison />

      <section className="grid gap-4 rounded-lg border border-[rgba(176,141,87,0.28)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Activation
          </p>
          <h2 className="mt-2 text-2xl font-semibold leading-tight text-[var(--ixai-forest)]">
            開始建立你的 AI Intelligence Layer
          </h2>
          <p className="mt-2 text-sm leading-7 text-[var(--ixai-ink-muted)]">
            從 onboarding 開始，IXAI 會先理解你關注的市場、投資風格、風險偏好與 Watchlist seed。
            Share layer 與更深的 delivery workflow 會在後續版本加入。
          </p>
        </div>
        <div className="grid gap-2 sm:flex">
          <Link
            className="ixai-cta-forest inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold"
            href="/onboarding"
            onClick={() => trackLandingClick("landing_primary_cta_click", "/onboarding_bottom")}
          >
            進入 Onboarding
            <Zap className="h-4 w-4 stroke-current text-[var(--ixai-cream)]" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
