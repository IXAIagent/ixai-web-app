"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  FileText,
  LineChart,
  MessageSquare,
  Radar,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import { trackEvent } from "@/src/lib/analytics/analytics";
import { useTranslation } from "@/src/lib/i18n";

const PAIN_POINTS = [
  {
    copy: "每天新聞很多，但真正會影響資產配置、FCN 或科技股風險的資訊不一定最醒目。",
    icon: FileText,
    title: "每天資訊太多，不知道真正重要的是什麼",
  },
  {
    copy: "FCN 不只看配息；Worst-of、KI / KO、觀察日與標的集中度才是風險核心。",
    icon: ShieldCheck,
    title: "FCN 風險容易被配息掩蓋",
  },
  {
    copy: "股票、ETF、Crypto 與 FCN 可能分散在不同商品裡，卻集中在同一個市場主題。",
    icon: BriefcaseBusiness,
    title: "投資組合風險常常分散在不同商品裡",
  },
  {
    copy: "高資產客戶需要穩定的檢查節奏，不是等市場大跌才開始整理曝險。",
    icon: Radar,
    title: "需要更穩定的風險追蹤流程",
  },
] as const;

const IXAI_LAYERS = [
  {
    copy: "每日晨報與每週情報，把市場事件整理成可閱讀的一玄觀點。",
    icon: CalendarDays,
    title: "每日 / 每週市場情報",
  },
  {
    copy: "用教育方式理解 Worst-of、KI / KO、觀察日與波動率，不把配息當作唯一焦點。",
    icon: BookOpen,
    title: "FCN 教育與風險觀念",
  },
  {
    copy: "未來把 FCN、投資組合與市場風險集中到 IXAI Pro 進階工作區。",
    icon: LineChart,
    title: "IXAI Pro 監控工作區",
  },
] as const;

const SPLIT_CARDS = [
  {
    cta: "閱讀每日晨報",
    href: "/daily-brief",
    icon: FileText,
    label: "App",
    title: "閱讀市場情報，建立投資理解",
  },
  {
    cta: "申請 Pro 測試",
    href: "/account",
    icon: Sparkles,
    label: "IXAI Pro",
    title: "監控 FCN、投資組合與風險變化",
  },
  {
    cta: "預約顧問諮詢",
    href: "/feedback?intent=consulting",
    icon: MessageSquare,
    label: "顧問服務",
    title: "做 FCN 健檢與投資組合診斷",
  },
] as const;

function trackLandingClick(
  event:
    | "landing_primary_cta_click"
    | "landing_preview_click"
    | "pro_cta_click",
  target: string,
) {
  trackEvent(event, {
    path: window.location.pathname,
    source: "home_conversion_v166",
    target,
  });
}

export function IntelligenceLanding() {
  const { t } = useTranslation("common");

  useEffect(() => {
    trackEvent("landing_view", {
      path: window.location.pathname,
      surface: "home_conversion_v166",
    });
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-6 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <section className="overflow-hidden rounded-lg border border-[rgba(176,141,87,0.32)] bg-[var(--ixai-forest)] text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)]">
        <div className="grid gap-6 p-4 sm:p-8 lg:grid-cols-[1.08fr_0.92fr] lg:p-10">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
              {t("landingEyebrow")}
            </p>
            <h1 className="mt-3 max-w-4xl font-serif text-3xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              {t("landingTitle")}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/74 sm:text-base sm:leading-8">
              {t("landingBody")}
            </p>
            <div className="mt-4 grid gap-2 rounded-lg border border-white/12 bg-white/[0.045] p-3 text-xs leading-6 text-white/72 sm:grid-cols-2">
              <span>市場情報：每日晨報與每週情報</span>
              <span>FCN 風險：Worst-of、KI / KO、觀察日</span>
              <span>投資組合：配置、集中度、主題曝險</span>
              <span>顧問服務：FCN 健檢與投資組合診斷</span>
            </div>
            <div className="mt-6 grid gap-2 sm:flex sm:flex-wrap">
              <Link
                className="ixai-cta-cream inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-cream)] px-4 py-2.5 text-sm font-semibold"
                href="/daily-brief"
                onClick={() => trackLandingClick("landing_primary_cta_click", "/daily-brief")}
              >
                {t("landingCtaPrimary")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)] transition hover:bg-white/[0.12]"
                href="/fcn"
                onClick={() => trackLandingClick("landing_preview_click", "/fcn")}
              >
                {t("landingCtaFcn")}
                <ShieldCheck className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
              </Link>
              <Link
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[rgba(176,141,87,0.55)] bg-[rgba(176,141,87,0.18)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)] transition hover:bg-[rgba(176,141,87,0.28)]"
                href="/account"
                onClick={() => trackLandingClick("pro_cta_click", "/account")}
              >
                {t("landingCtaPro")}
                <Sparkles className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <aside className="rounded-lg border border-white/10 bg-white/[0.045] p-4 sm:p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ixai-gold)]">
              一玄投資經驗
            </p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight text-[var(--ixai-cream)]">
              IXAI 不是交易訊號，而是市場情報、風險監控與投資工作流。
            </h2>
            <div className="mt-4 grid gap-3">
              {["FCN 顧問與市場監控經驗", "每日晨報與跨市場觀察", "投資組合與風險工作流"].map((item) => (
                <div
                  className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.045] p-3 text-sm leading-6 text-white/70"
                  key={item}
                >
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[var(--ixai-gold)]" aria-hidden="true" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 rounded-lg border border-white/10 bg-white/[0.035] p-3 text-xs leading-6 text-white/52">
              IXAI 不提供自動下單、買賣指令、目標價或報酬承諾。個別化診斷保留在 Pro 與顧問服務中。
            </p>
          </aside>
        </div>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ixai-gold)]">
          投資人常見問題
        </p>
        <h2 className="mt-2 max-w-3xl text-2xl font-semibold leading-tight text-[var(--ixai-forest)] sm:text-3xl">
          不是資訊不夠，而是風險沒有被整理成可檢查的流程。
        </h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {PAIN_POINTS.map((item) => (
            <article
              className="rounded-lg border border-[var(--ixai-border)] bg-white/62 p-4"
              key={item.title}
            >
              <FeatureIcon icon={item.icon} />
              <h3 className="mt-3 text-base font-semibold leading-6 text-[var(--ixai-forest)]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                {item.copy}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 rounded-lg border border-[rgba(176,141,87,0.28)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-6 lg:grid-cols-[0.82fr_1.18fr]">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ixai-gold)]">
            IXAI 提供什麼
          </p>
          <h2 className="mt-2 text-2xl font-semibold leading-tight text-[var(--ixai-forest)] sm:text-3xl">
            從公開情報，到 Pro 監控，再到顧問診斷。
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
            IXAI 先幫你建立市場理解，再逐步把 FCN、投資組合與風險監控接到 Pro 工作區。
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {IXAI_LAYERS.map((item) => (
            <article
              className="rounded-lg border border-[var(--ixai-border)] bg-white/62 p-4"
              key={item.title}
            >
              <FeatureIcon icon={item.icon} />
              <h3 className="mt-3 text-base font-semibold leading-6 text-[var(--ixai-forest)]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                {item.copy}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-5 rounded-lg border border-[rgba(176,141,87,0.32)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] sm:p-7 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
            FCN 核心差異
          </p>
          <h2 className="mt-3 font-serif text-2xl font-semibold leading-tight sm:text-4xl">
            FCN 監控，是 IXAI Pro 的核心差異。
          </h2>
          <p className="mt-3 text-sm leading-7 text-white/72 sm:text-base sm:leading-8">
            多數投資人只看到配息；真正風險在 Worst-of、KI、KO、觀察日與標的集中度。
            IXAI App 提供教育，IXAI Pro 將這些風險集中成監控工作流。
          </p>
          <Link
            className="ixai-cta-cream mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-cream)] px-4 py-2.5 text-sm font-semibold"
            href="/fcn"
            onClick={() => trackLandingClick("landing_preview_click", "/fcn_moat")}
          >
            了解 FCN 風險
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid gap-3">
          {["Worst-of 決定多標的 FCN 的真正壓力來源。", "KI / KO 與觀察日會改變風險節奏。", "標的集中度會讓現股、ETF、FCN 指向同一風險。"].map((item) => (
            <div
              className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.045] p-4 text-sm leading-7 text-white/72"
              key={item}
            >
              <FeatureIcon icon={ShieldCheck} size="sm" shadow={false} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ixai-gold)]">
          App / Pro / Consulting
        </p>
        <h2 className="mt-2 text-2xl font-semibold leading-tight text-[var(--ixai-forest)] sm:text-3xl">
          依照你現在需要的深度，選擇下一步。
        </h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {SPLIT_CARDS.map((item) => (
            <article
              className="flex h-full flex-col rounded-lg border border-[var(--ixai-border)] bg-white/62 p-4"
              key={item.label}
            >
              <FeatureIcon icon={item.icon} />
              <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                {item.label}
              </p>
              <h3 className="mt-2 flex-1 text-lg font-semibold leading-7 text-[var(--ixai-forest)]">
                {item.title}
              </h3>
              <Link
                className="ixai-cta-forest mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold"
                href={item.href}
                onClick={() => {
                  const event =
                    item.label === "App"
                      ? "landing_primary_cta_click"
                      : item.label === "IXAI Pro"
                        ? "pro_cta_click"
                        : "landing_preview_click";
                  trackLandingClick(event, item.href);
                }}
              >
                {item.cta}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 rounded-lg border border-[rgba(176,141,87,0.28)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ixai-gold)]">
            最新情報入口
          </p>
          <h2 className="mt-2 text-2xl font-semibold leading-tight text-[var(--ixai-forest)]">
            先從每日晨報或每週情報開始。
          </h2>
          <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
            公開情報幫你建立市場理解；需要個人化監控時，再進入 Pro 或顧問服務。
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            className="rounded-lg border border-[var(--ixai-border)] bg-white/62 p-4 transition hover:border-[rgba(176,141,87,0.55)]"
            href="/daily-brief"
            onClick={() => trackLandingClick("landing_primary_cta_click", "/daily-brief_latest")}
          >
            <FeatureIcon icon={FileText} />
            <h3 className="mt-3 text-lg font-semibold text-[var(--ixai-forest)]">每日晨報</h3>
            <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              每天用一份短而清楚的市場情報，理解今日真正重要的訊號。
            </p>
          </Link>
          <Link
            className="rounded-lg border border-[var(--ixai-border)] bg-white/62 p-4 transition hover:border-[rgba(176,141,87,0.55)]"
            href="/weekly-brief"
          >
            <FeatureIcon icon={CalendarDays} />
            <h3 className="mt-3 text-lg font-semibold text-[var(--ixai-forest)]">每週情報</h3>
            <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              用週期視角回顧市場變化，整理下週需要觀察的事件。
            </p>
          </Link>
        </div>
      </section>

      <section className="rounded-lg border border-[rgba(176,141,87,0.32)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] sm:p-7">
        <h2 className="font-serif text-2xl font-semibold leading-tight sm:text-4xl">
          先從一份每日晨報開始，或直接預約 FCN 健檢。
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70">
          如果你想先了解市場，從每日晨報開始；如果你已經有 FCN 或複雜投資組合，可以申請 Pro 測試或預約顧問諮詢。
        </p>
        <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap">
          <Link
            className="ixai-cta-cream inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-cream)] px-4 py-2.5 text-sm font-semibold"
            href="/daily-brief"
            onClick={() => trackLandingClick("landing_primary_cta_click", "/daily-brief_final")}
          >
            閱讀每日晨報
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)] transition hover:bg-white/[0.08]"
            href="/fcn"
            onClick={() => trackLandingClick("landing_preview_click", "/fcn_final")}
          >
            了解 FCN
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)] transition hover:bg-white/[0.08]"
            href="/account"
            onClick={() => trackLandingClick("pro_cta_click", "/account_final")}
          >
            申請 Pro 測試
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[rgba(176,141,87,0.55)] bg-[rgba(176,141,87,0.18)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)] transition hover:bg-[rgba(176,141,87,0.28)]"
            href="/feedback?intent=consulting"
            onClick={() => trackLandingClick("landing_preview_click", "/feedback_final")}
          >
            預約顧問諮詢
          </Link>
        </div>
        <p className="mt-4 text-xs leading-6 text-white/52">
          IXAI 公開資訊僅供教育與市場理解，不構成個別投資建議、買賣指令或績效保證。
        </p>
      </section>
    </main>
  );
}
