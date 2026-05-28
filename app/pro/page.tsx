import Link from "next/link";
import { ArrowRight, FileText, Sparkles } from "lucide-react";
import { IdentifySessionCard } from "@/components/auth/identify-session-card";
import { ProComparison } from "@/components/pro/pro-comparison";
import { ProFeatureGrid } from "@/components/pro/pro-feature-grid";
import { ProWaitlistCta } from "@/components/pro/pro-waitlist-cta";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  title: "IXAI Pro — Personal Intelligence Layer",
  description:
    "IXAI Pro is the upcoming personal intelligence layer for portfolio intelligence, FCN risk intelligence, and AI market memory.",
});

export default function ProPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-7 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
      <section className="overflow-hidden rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)]">
        <div className="grid gap-5 p-4 sm:gap-8 sm:p-8 lg:grid-cols-[1.08fr_0.92fr] lg:p-10">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--ixai-gold)] sm:text-[11px] sm:tracking-[0.3em]">
              IXAI Pro 預覽
            </p>
            <h1 className="mt-3 font-serif text-2xl font-semibold leading-tight sm:mt-4 sm:text-5xl">
              IXAI Pro — Personal Intelligence Layer
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72 sm:mt-6 sm:text-base sm:leading-8">
              Public Intelligence 告訴你市場正在 pricing 什麼。IXAI Pro
              將把這些情報連接到投資組合、FCN exposure、Watchlist memory
              與個人風險工作流。
            </p>
            <p className="mt-3 max-w-2xl text-xs leading-6 text-zinc-400/90 sm:text-sm">
              IXAI Pro 目前處於等候名單 / 預覽階段。此頁不收費，也不提供投資建議、
              目標價、買賣訊號或報酬承諾。
            </p>
            <div className="mt-5 grid gap-2 sm:mt-7 sm:flex sm:flex-wrap sm:gap-3">
              <a
                className="ixai-cta-cream inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-cream)] px-4 py-2.5 text-center text-sm font-semibold"
                href="#pro-waitlist"
              >
                <Sparkles className="ixai-force-icon-gold h-4 w-4 stroke-current text-[var(--ixai-gold)] opacity-100" aria-hidden="true" strokeWidth={2.25} />
                <span className="translate-y-px">加入 Pro 等候名單</span>
              </a>
              <Link
                className="ixai-cta-outline-dark inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium transition hover:bg-white/8 hover:text-white"
                href="/daily-brief"
              >
                <FileText className="ixai-force-icon-gold h-4 w-4 stroke-current text-[var(--ixai-gold)] opacity-100" aria-hidden="true" strokeWidth={2.25} />
                <span className="translate-y-px">繼續使用 Public Intelligence</span>
              </Link>
              <Link
                className="ixai-cta-outline-dark inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium transition hover:bg-white/8 hover:text-white"
                href="/pro-preview"
              >
                查看 Pro 預覽控制台
              </Link>
              <Link
                className="ixai-cta-outline-dark inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium transition hover:bg-white/8 hover:text-white"
                href="/pro-intelligence"
              >
                Upgrade Intelligence
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4 sm:p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
              升級邏輯
            </p>
            <div className="mt-4 grid gap-3">
              {[
                ["Public", "Daily / Weekly Intelligence、Market Signals、FCN 教育。"],
                ["Subscriber", "Email capture、identity stitching、membership foundation。"],
                ["Pro", "Personal portfolio intelligence、FCN 監控、AI alerts。"],
              ].map(([label, copy]) => (
                <article className="rounded-lg border border-white/10 bg-white/[0.045] p-4" key={label}>
                  <p className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-400/80">
                    {label}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-white/72">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ProFeatureGrid />

      <ProComparison />

      <IdentifySessionCard
        source="pro_page"
        title="建立你的 IXAI intelligence identity"
      />

      <section
        className="grid gap-4 rounded-lg border border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center"
        id="pro-waitlist"
      >
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--ixai-gold)] sm:text-[11px] sm:tracking-[0.22em]">
            等候名單 / 預覽
          </p>
          <h2 className="mt-2 font-serif text-2xl font-semibold leading-tight text-[var(--ixai-forest)] sm:text-3xl">
            IXAI Pro 開放時，優先取得通知。
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
            加入 Pro 等候名單後，你會成為 IXAI membership foundation 中的
            conversion candidate。系統會建立 free member record，並將 Pro intent
            連接到同一個 subscriber identity graph。
          </p>
        </div>
        <ProWaitlistCta requestedFeature="portfolio_intelligence" />
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.78)] p-4 text-sm leading-7 text-[var(--ixai-ink-muted)] sm:p-5">
        IXAI Pro 將聚焦於 intelligence、risk awareness 與 workflow support。
        不提供保證報酬、買賣指令、目標價或個別化投資建議。
        <Link
          className="ml-1 inline-flex items-center gap-1 font-semibold text-[var(--ixai-forest)]"
          href="/daily-brief"
        >
          返回 Public Intelligence
          <ArrowRight className="ixai-force-icon-forest h-3.5 w-3.5 stroke-current text-[var(--ixai-forest)] opacity-100" aria-hidden="true" strokeWidth={2.25} />
        </Link>
      </section>
    </div>
  );
}
