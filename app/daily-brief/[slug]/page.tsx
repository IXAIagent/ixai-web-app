import Link from "next/link";
import { AlertTriangle, ArrowLeft, ArrowUpRight, Eye } from "lucide-react";
import { DailyBriefLocalDetail } from "@/components/daily-brief/daily-brief-local-detail";
import type { DailyBrief } from "@/content/daily-briefs";
import {
  getAllDailyBriefs,
  getDailyBriefBySlug,
} from "@/src/lib/dailyBriefs";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";
import { ixaiEcosystem } from "@/src/lib/ixai/ecosystem";
import { getPublishedBriefBySlugAsync } from "@/src/lib/editorial/repository";

export const dynamic = "force-dynamic";

const categoryLabels: Record<DailyBrief["sections"][number]["category"], string> =
  {
    us_market: "美股",
    taiwan_market: "台股",
    crypto: "Crypto",
    rates: "利率",
    ai_market: "AI 科技",
  };

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllDailyBriefs().map((brief) => ({ slug: brief.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const brief = (await getPublishedBriefBySlugAsync(slug)) ?? getDailyBriefBySlug(slug);

  if (!brief) {
    return {
      title: "Daily Brief Not Found | IXAI",
    };
  }

  return buildPublicMetadata({
    title: `${brief.title} | IXAI Daily Brief`,
    description: brief.marketSummary,
  });
}

export default async function DailyBriefDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const persistedBrief = await getPublishedBriefBySlugAsync(slug);

  if (persistedBrief) {
    return <DailyBriefLocalDetail slug={slug} />;
  }

  const brief = getDailyBriefBySlug(slug);

  if (!brief) {
    return <DailyBriefLocalDetail slug={slug} />;
  }

  return (
    <article className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-3 py-3 sm:gap-6 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
      <section className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] shadow-[0_18px_56px_rgba(9,41,31,0.14)] sm:p-7 sm:shadow-[0_24px_80px_rgba(9,41,31,0.16)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--ixai-gold)]">
              Daily Brief / {brief.publishedAt}
            </p>
            <h1 className="mt-2 max-w-3xl text-xl font-semibold leading-7 sm:mt-3 sm:text-4xl sm:leading-snug">
              {brief.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/72 sm:mt-4 sm:text-base sm:leading-8">
              {brief.marketSummary}
            </p>
          </div>
          <Link
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-white/12 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/8 hover:text-white sm:w-fit"
            href="/daily-brief"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            回到封存
          </Link>
        </div>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          一玄觀點
        </p>
        <p className="mt-2.5 text-sm leading-7 text-[var(--ixai-forest-soft)] sm:mt-3 sm:text-base sm:leading-8">
          {brief.editorialNote}
        </p>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.8)]">
        <div className="border-b border-[var(--ixai-border)] px-4 py-3.5 sm:px-5 sm:py-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            市場摘要
          </p>
          <h2 className="mt-1 text-base font-semibold text-[var(--ixai-forest)]">
            今日市場觀察
          </h2>
        </div>
        <div className="divide-y divide-[var(--ixai-border)]">
          {brief.sections.map((section) => (
            <section
              className="grid gap-3 px-4 py-4 sm:px-5 sm:py-5 md:grid-cols-[10rem_1fr]"
              key={section.category}
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ixai-forest)]">
                  {categoryLabels[section.category]}
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold leading-6 text-[var(--ixai-forest)] sm:text-lg sm:leading-7">
                  {section.headline}
                </h3>
                <p className="mt-2 text-sm leading-7 text-[var(--ixai-ink-muted)]">
                  {section.summary}
                </p>
                <div className="mt-3 rounded-lg border border-[rgba(176,141,87,0.26)] bg-[rgba(176,141,87,0.08)] p-3.5 sm:mt-4 sm:p-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                    一玄觀點
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                    {section.ixaiView}
                  </p>
                </div>
              </div>
            </section>
          ))}
        </div>
      </section>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-[#9f5530]/24 bg-[#9f5530]/[0.08]">
          <div className="border-b border-[var(--ixai-border)] px-4 py-3.5 sm:px-5 sm:py-4">
            <div className="flex items-center gap-2 text-[#6f351f]">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em]">
                風險焦點
              </p>
            </div>
            <p className="mt-2 text-xs leading-6 text-[var(--ixai-ink-muted)]">
              今日需要優先警覺的市場壓力與下行風險。
            </p>
          </div>
          <ul className="divide-y divide-[var(--ixai-border)]">
            {brief.riskFocus.map((risk) => (
              <li
                className="px-4 py-3.5 text-sm leading-6 text-[#5f2e1c] sm:px-5 sm:py-4 sm:leading-7"
                key={risk}
              >
                {risk}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border border-[rgba(9,41,31,0.16)] bg-[rgba(9,41,31,0.045)]">
          <div className="border-b border-[var(--ixai-border)] px-4 py-3.5 sm:px-5 sm:py-4">
            <div className="flex items-center gap-2 text-[var(--ixai-forest)]">
              <Eye className="h-4 w-4" aria-hidden="true" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em]">
                自選觀察重點
              </p>
            </div>
            <p className="mt-2 text-xs leading-6 text-[var(--ixai-ink-muted)]">
              可放回 Watchlist 持續追蹤的標的與觀察理由。
            </p>
          </div>
          <div className="divide-y divide-[var(--ixai-border)]">
            {brief.watchlistNotes.map((item) => (
              <div className="px-4 py-3.5 sm:px-5 sm:py-4" key={item.symbol}>
                <p className="font-mono text-sm font-semibold text-[var(--ixai-forest)]">
                  {item.symbol}
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--ixai-ink-muted)]">
                  {item.note}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
          IXAI Pro
        </p>
        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              將每日簡報延伸為持續監控。
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-white/68">
              未來 IXAI Pro 將延伸至 FCN、投資組合風險、Crypto 曝險與 AI 風險提醒。
            </p>
          </div>
          <a
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--ixai-cream)] px-4 py-2 text-sm font-medium text-[var(--ixai-forest)] sm:w-fit"
            href={ixaiEcosystem.proDashboardUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            {ixaiEcosystem.cta.enterPro}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </section>
    </article>
  );
}
