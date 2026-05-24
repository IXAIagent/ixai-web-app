import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, CalendarDays, ShieldCheck } from "lucide-react";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";
import {
  getAllWeeklyBriefs,
  getWeeklyBriefBySlug,
} from "@/src/lib/weeklyBriefs";
import { ixaiEcosystem } from "@/src/lib/ixai/ecosystem";
import type { WeeklyBriefSource } from "@/content/weekly-briefs";

const sourceTypeLabels: Record<WeeklyBriefSource["type"], string> = {
  official_data: "官方資料",
  earnings_calendar: "財報行事曆",
  market_news: "市場新聞",
  crypto_market: "Crypto 市場資料",
  company_ir: "公司 IR",
  editorial_review: "一玄人工審閱",
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllWeeklyBriefs().map((brief) => ({ slug: brief.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const brief = getWeeklyBriefBySlug(slug);

  if (!brief) {
    return {
      title: "Weekly Brief Not Found | IXAI",
    };
  }

  return buildPublicMetadata({
    title: `${brief.title} | IXAI Weekly Brief`,
    description: brief.executiveSummary,
  });
}

export default async function WeeklyBriefDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const brief = getWeeklyBriefBySlug(slug);

  if (!brief) {
    notFound();
  }

  return (
    <article className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-3 py-3 sm:gap-6 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
      <section className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] shadow-[0_18px_56px_rgba(9,41,31,0.14)] sm:p-7 sm:shadow-[0_24px_80px_rgba(9,41,31,0.16)]">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--ixai-gold)]">
          Weekly Intelligence
        </p>
        <h1 className="mt-2 max-w-3xl text-xl font-semibold leading-7 sm:mt-3 sm:text-4xl sm:leading-snug">
          {brief.title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/72 sm:mt-4 sm:text-base sm:leading-8">
          {brief.executiveSummary}
        </p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/74">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 px-2.5 py-1">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            發布時間：{brief.publishedAt}
          </span>
          <span className="rounded-lg border border-white/12 px-2.5 py-1">
            市場回顧期間：{brief.coveragePeriod}
          </span>
          <span className="rounded-lg border border-white/12 px-2.5 py-1">
            下週市場焦點：{brief.upcomingPeriod}
          </span>
        </div>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          編輯觀察
        </p>
        <p className="mt-2.5 text-sm leading-7 text-[var(--ixai-forest-soft)] sm:mt-3 sm:text-base sm:leading-8">
          {brief.editorialNote}
        </p>
      </section>

      <section className="rounded-lg border border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.86)]">
        <div className="border-b border-[var(--ixai-border)] px-4 py-3.5 sm:px-5 sm:py-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            IXAI Intelligence Summary
          </p>
          <h2 className="mt-1 text-base font-semibold text-[var(--ixai-forest)]">
            市場目前正在 pricing 什麼
          </h2>
        </div>
        <div className="grid gap-3 p-4 sm:p-5 lg:grid-cols-3">
          {[
            ["Pricing", brief.intelligenceSummary.pricing],
            ["Risk Tone", brief.intelligenceSummary.riskTone],
            ["What Changed", brief.intelligenceSummary.whatChanged],
          ].map(([label, text]) => (
            <article className="rounded-lg border border-[var(--ixai-border)] bg-white/45 p-4" key={label}>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                {label}
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.8)]">
        <div className="border-b border-[var(--ixai-border)] px-4 py-3.5 sm:px-5 sm:py-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            本週市場重點
          </p>
          <h2 className="mt-1 text-base font-semibold text-[var(--ixai-forest)]">
            美股、台股、AI 科技、利率與 Crypto
          </h2>
        </div>
        <div className="grid gap-0 md:grid-cols-2">
          {brief.marketHighlights.map((highlight) => (
            <article
              className="border-b border-[var(--ixai-border)] p-4 sm:p-5 md:border-r"
              key={highlight.label}
            >
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                {highlight.label}
              </p>
              <h3 className="mt-2 text-base font-semibold leading-6 text-[var(--ixai-forest)]">
                {highlight.headline}
              </h3>
              <p className="mt-2 text-sm leading-7 text-[var(--ixai-ink-muted)]">
                {highlight.summary}
              </p>
              <p className="mt-3 rounded-lg border border-[rgba(176,141,87,0.24)] bg-[rgba(176,141,87,0.08)] p-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                {highlight.ixaiView}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.8)]">
        <div className="border-b border-[var(--ixai-border)] px-4 py-3.5 sm:px-5 sm:py-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            重大事件
          </p>
          <h2 className="mt-1 text-base font-semibold text-[var(--ixai-forest)]">
            本週市場定價來源
          </h2>
        </div>
        <div className="divide-y divide-[var(--ixai-border)]">
          {brief.majorEvents.map((event) => (
            <section
              className="grid gap-3 px-4 py-4 sm:px-5 sm:py-5 md:grid-cols-[10rem_1fr]"
              key={event.headline}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ixai-forest)]">
                {event.category}
              </p>
              <div>
                <h3 className="text-base font-semibold leading-6 text-[var(--ixai-forest)] sm:text-lg sm:leading-7">
                  {event.headline}
                </h3>
                <p className="mt-2 text-sm leading-7 text-[var(--ixai-ink-muted)]">
                  {event.summary}
                </p>
                <div className="mt-3 rounded-lg border border-[rgba(176,141,87,0.26)] bg-[rgba(176,141,87,0.08)] p-3.5 sm:mt-4 sm:p-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                    一玄觀點
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                    {event.ixuanView}
                  </p>
                </div>
              </div>
            </section>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.82)]">
        <div className="border-b border-[var(--ixai-border)] px-4 py-3.5 sm:px-5 sm:py-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            FCN 市場觀察
          </p>
          <h2 className="mt-1 text-base font-semibold text-[var(--ixai-forest)]">
            教育型觀察：波動率、AI basket、worst-of 與 sentiment
          </h2>
        </div>
        <div className="grid gap-3 p-4 sm:p-5 md:grid-cols-2">
          {[
            ["Volatility", brief.fcnMarketObservation.volatility],
            ["AI Basket", brief.fcnMarketObservation.aiBasket],
            ["Worst-of", brief.fcnMarketObservation.worstOf],
            ["FCN Sentiment", brief.fcnMarketObservation.sentiment],
          ].map(([label, text]) => (
            <article className="rounded-lg border border-[var(--ixai-border)] bg-white/45 p-4" key={label}>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                {label}
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--ixai-ink-muted)]">{text}</p>
            </article>
          ))}
        </div>
        <p className="border-t border-[var(--ixai-border)] px-4 py-3 text-xs leading-6 text-[var(--ixai-ink-muted)] sm:px-5">
          本區塊僅為 FCN 教育與市場風險觀察，不包含個人化 KI / KO 監控或真實 FCN intelligence engine。
        </p>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.78)]">
        <div className="border-b border-[var(--ixai-border)] px-4 py-3.5 sm:px-5 sm:py-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            資產觀察
          </p>
        </div>
        <div className="grid gap-0 md:grid-cols-2">
          {brief.assetObservations.map((asset) => (
            <article
              className="border-b border-[var(--ixai-border)] p-4 sm:p-5 md:border-r"
              key={asset.label}
            >
              <h3 className="font-mono text-sm font-semibold text-[var(--ixai-forest)]">
                {asset.label}
              </h3>
              <p className="mt-2 text-sm leading-7 text-[var(--ixai-ink-muted)]">
                {asset.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.8)]">
        <div className="border-b border-[var(--ixai-border)] px-4 py-3.5 sm:px-5 sm:py-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            下週市場焦點
          </p>
          <h2 className="mt-1 text-base font-semibold text-[var(--ixai-forest)]">
            觀察期間：{brief.upcomingPeriod}
          </h2>
        </div>
        <div className="divide-y divide-[var(--ixai-border)]">
          {brief.upcomingFocus.map((item) => (
            <article
              className="grid gap-3 px-4 py-3.5 sm:px-5 sm:py-4 lg:grid-cols-[8rem_1fr_1fr]"
              key={`${item.date}-${item.event}`}
            >
              <p className="font-mono text-xs text-[var(--ixai-gold)]">
                {item.date}
              </p>
              <div>
                <h3 className="text-sm font-semibold leading-6 text-[var(--ixai-forest)]">
                  {item.event}
                </h3>
                <p className="mt-1 text-sm leading-7 text-[var(--ixai-ink-muted)]">
                  {item.whyItMatters}
                </p>
              </div>
              <p className="text-sm leading-7 text-[var(--ixai-forest-soft)]">
                {item.marketImpact}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.78)] p-4 sm:p-6">
        <div className="flex items-center gap-2 text-[var(--ixai-forest)]">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            風險提醒
          </p>
        </div>
        <div className="mt-3 grid gap-3">
          {brief.riskNotes.map((note) => (
            <p
              className="text-sm leading-7 text-[var(--ixai-forest-soft)]"
              key={note}
            >
              {note}
            </p>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(9,41,31,0.035)]">
        <div className="border-b border-[var(--ixai-border)] px-4 py-3.5 sm:px-5 sm:py-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            資料來源 / 信任層
          </p>
          <h2 className="mt-1 text-base font-semibold text-[var(--ixai-forest)]">
            公開資訊、人工審閱與風險脈絡
          </h2>
        </div>
        <div className="grid gap-3 p-4 sm:p-5 md:grid-cols-2">
          {brief.sources.map((source) => (
            <div
              className="rounded-lg border border-[var(--ixai-border)] bg-[var(--ixai-paper)] p-4"
              key={`${source.type}-${source.label}`}
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                {sourceTypeLabels[source.type]}
              </p>
              {source.url ? (
                <a
                  className="mt-2 block text-sm font-semibold text-[var(--ixai-forest)]"
                  href={source.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  {source.label}
                </a>
              ) : (
                <p className="mt-2 text-sm font-semibold text-[var(--ixai-forest)]">
                  {source.label}
                </p>
              )}
              {source.note ? (
                <p className="mt-2 text-sm leading-7 text-[var(--ixai-ink-muted)]">
                  {source.note}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
          回到 IXAI
        </p>
        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              將週報脈絡接回每日監控。
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-white/68">
              將 Weekly Brief 與每日簡報、IXAI Pro 產品教育放在同一個 App 工作區中閱讀。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="ixai-cta-cream inline-flex items-center gap-2 rounded-lg bg-[var(--ixai-cream)] px-4 py-2 text-sm font-medium"
              href="/daily-brief"
            >
              每日簡報
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a
              className="inline-flex items-center gap-2 rounded-lg border border-white/12 px-4 py-2 text-sm font-medium text-white/78"
              href={ixaiEcosystem.proDashboardUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              {ixaiEcosystem.cta.enterPro}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </article>
  );
}
