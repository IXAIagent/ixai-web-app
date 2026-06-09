import Link from "next/link";
import {
  AlertTriangle,
  BriefcaseBusiness,
  CalendarCheck,
  Layers3,
  LineChart,
  MessageSquare,
  Radar,
  ShieldCheck,
} from "lucide-react";
import { PortfolioReadbackSummary } from "@/components/portfolio/portfolio-readback-summary";
import { ProSsoLaunchButton } from "@/components/pro/pro-sso-launch-button";
import { FeatureIcon } from "@/components/ui/feature-icon";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  title: "IXAI Pro — 進階投資監控工作區",
  description:
    "IXAI Pro 為需要持續監控風險的投資人打造，整合 FCN 監控、投資組合分析與風險中心。",
  canonical: "/pro",
});

const painPoints = [
  {
    copy: "配息只是結果，真正需要追蹤的是 KI / KO、Worst-of、觀察日、波動率與標的集中度。",
    icon: ShieldCheck,
    title: "FCN 不只看配息",
  },
  {
    copy: "股票、ETF、Crypto、FCN 看起來是不同商品，但風險可能集中在同一主題或同一標的。",
    icon: Layers3,
    title: "投資組合風險會集中",
  },
  {
    copy: "市場事件、財報、利率、觀察日與風險訊號分散在不同地方，人工追蹤很容易漏掉。",
    icon: AlertTriangle,
    title: "人工追蹤容易漏掉",
  },
];

const modules = [
  {
    copy: "追蹤 KI / KO、Worst-of、配息觀察日、標的集中度與風險變化。這是 IXAI Pro 的主打模組。",
    href: "/fcn",
    icon: ShieldCheck,
    title: "FCN 監控",
  },
  {
    copy: "整理資產配置、部位重疊、主題曝險與集中度，協助你看見整體投資組合輪廓。",
    href: "/portfolio",
    icon: BriefcaseBusiness,
    title: "投資組合分析",
  },
  {
    copy: "把市場 regime、重大事件、情境監控與 AI 風險摘要集中到同一個風險工作區。",
    href: "/risk",
    icon: Radar,
    title: "風險中心",
  },
];

export default function ProPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-6 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <section className="rounded-lg border border-[rgba(176,141,87,0.32)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)] sm:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
          IXAI Pro
        </p>
        <h1 className="mt-3 max-w-4xl font-serif text-2xl font-semibold leading-tight sm:text-5xl sm:leading-snug">
          IXAI Pro：為需要持續監控風險的投資人打造。
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/74 sm:text-base sm:leading-8">
          把 FCN、投資組合與市場風險集中到一個進階工作區，協助你更早看見風險變化。
        </p>
        <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap">
          <ProSsoLaunchButton className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-cream)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-forest)] disabled:cursor-wait disabled:opacity-75" />
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-[var(--ixai-cream)] transition hover:bg-white/[0.12]"
            href="/fcn"
          >
            了解 FCN 監控
            <CalendarCheck className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[rgba(176,141,87,0.55)] bg-[rgba(176,141,87,0.18)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)] transition hover:bg-[rgba(176,141,87,0.28)]"
            href="/feedback?intent=consulting"
          >
            預約顧問諮詢
            <MessageSquare className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <PortfolioReadbackSummary variant="pro" />

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.88)] p-4 sm:p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ixai-gold)]">
          為什麼需要 Pro
        </p>
        <h2 className="mt-2 max-w-3xl text-xl font-semibold leading-7 text-[var(--ixai-forest)] sm:text-2xl">
          市場資訊變多，不代表風險變清楚。Pro 的任務是把分散訊號整理成可監控的工作流。
        </h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {painPoints.map((point) => (
            <article
              className="rounded-lg border border-[var(--ixai-border)] bg-white/60 p-4"
              key={point.title}
            >
              <FeatureIcon icon={point.icon} />
              <h3 className="mt-3 text-base font-semibold leading-6 text-[var(--ixai-forest)]">
                {point.title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                {point.copy}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-[1.35fr_1fr_1fr]">
        {modules.map((module, index) => (
          <article
            className={`flex h-full flex-col rounded-lg border p-4 sm:p-5 ${
              index === 0
                ? "border-[rgba(176,141,87,0.55)] bg-[rgba(176,141,87,0.13)] shadow-[0_18px_56px_rgba(9,41,31,0.10)]"
                : "border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)]"
            }`}
            key={module.title}
          >
            <div className="flex items-start justify-between gap-3">
              <FeatureIcon icon={module.icon} />
              {index === 0 ? (
                <span className="rounded border border-[rgba(176,141,87,0.38)] bg-white/60 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ixai-forest)]">
                  Pro 主打
                </span>
              ) : null}
            </div>
            <h2 className="mt-4 text-lg font-semibold leading-7 text-[var(--ixai-forest)]">
              {module.title}
            </h2>
            <p className="mt-2 flex-1 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              {module.copy}
            </p>
            <Link
              className="ixai-cta-forest mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold"
              href={module.href}
            >
              了解 {module.title}
            </Link>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.78)] p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <FeatureIcon icon={LineChart} shadow={false} />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ixai-gold)]">
              App vs Pro
            </p>
            <h2 className="mt-2 text-xl font-semibold leading-7 text-[var(--ixai-forest)]">
              App 提供市場教育與公開情報；Pro 提供進階監控與工作區。
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              目前 Pro 仍在測試與整合階段，不含付款、券商串接、真實部位資料或投資建議。
              若需要人為審視，可透過一玄投資顧問服務預約 FCN 健檢或投資組合診斷。
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
