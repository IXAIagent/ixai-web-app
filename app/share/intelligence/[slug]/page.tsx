import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen, CircleDot, Share2 } from "lucide-react";
import type { Metadata } from "next";
import { PublicIntelligenceEngine } from "@/components/intelligence/public-intelligence-engine";
import { PublicIntelligenceCta } from "@/components/intelligence/public-intelligence-cta";
import { ShareActions } from "@/components/share/share-actions";
import { ShareIntelligenceCard } from "@/components/share/share-intelligence-card";
import { ShareIntelligenceCtaRow } from "@/components/share/share-intelligence-cta-row";
import { ShareIntelligenceTracker } from "@/components/share/share-intelligence-tracker";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";
import {
  SHARE_INTELLIGENCE_ITEMS,
  buildShareIntelligenceCopy,
  buildShareIntelligenceUrl,
  getShareIntelligenceItem,
} from "@/src/lib/share/intelligence";

export function generateStaticParams() {
  return SHARE_INTELLIGENCE_ITEMS.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getShareIntelligenceItem(slug);

  if (!item) {
    return buildPublicMetadata({
      title: "IXAI Share Intelligence",
      description: "IXAI market intelligence share card.",
      canonical: "/share",
    });
  }

  return buildPublicMetadata({
    title: `${item.title} — IXAI`,
    description: item.description,
    canonical: `/share/intelligence/${item.slug}`,
  });
}

export default async function ShareIntelligencePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getShareIntelligenceItem(slug);

  if (!item) {
    notFound();
  }

  const Icon = item.icon;
  const shareCopy = buildShareIntelligenceCopy(item);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-5 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
      <ShareIntelligenceTracker category={item.category} slug={item.slug} />

      <section className="overflow-hidden rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)]">
        <div className="grid gap-5 p-4 sm:p-8 lg:grid-cols-[1.04fr_0.96fr] lg:p-10">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              {item.category}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-white/70">
              <span className="rounded-lg border border-white/12 px-2.5 py-1">
                Public Intelligence
              </span>
              <span className="rounded-lg border border-white/12 px-2.5 py-1">
                Sample / General Market Awareness
              </span>
            </div>
            <h1 className="mt-3 max-w-3xl font-serif text-3xl font-semibold leading-tight sm:text-5xl">
              {item.title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:text-base sm:leading-8">
              {item.summary}
            </p>
            <div className="mt-6">
              <ShareIntelligenceCtaRow slug={item.slug} />
            </div>
            <p className="mt-5 max-w-2xl text-xs leading-6 text-white/52">
              這是一張 IXAI intelligence share card。內容僅供市場資訊、教育內容與風險觀察參考，
              不構成投資建議、買賣指令或報酬承諾。
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4 sm:p-5">
            <div className="flex items-center gap-2 text-[var(--ixai-gold)]">
              <Icon className="h-5 w-5 stroke-current" aria-hidden="true" />
              <p className="font-mono text-[11px] uppercase tracking-[0.18em]">
                Intelligence Card
              </p>
            </div>
            <p className="mt-4 text-lg font-semibold leading-8 text-[var(--ixai-cream)]">
              {item.summary}
            </p>
            <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.035] p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                Share Link
              </p>
              <p className="mt-2 break-all text-xs leading-5 text-white/58">
                {buildShareIntelligenceUrl(item.slug)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-5">
        <div className="flex items-center gap-2 text-[var(--ixai-gold)]">
          <BookOpen className="h-4 w-4 stroke-current" aria-hidden="true" />
          <p className="font-mono text-[11px] uppercase tracking-[0.18em]">
            AI Context
          </p>
        </div>
        <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
          {item.aiContext}
        </p>
      </section>

      <section className="grid gap-3 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-5">
          <div className="flex items-center gap-2 text-[var(--ixai-gold)]">
            <CircleDot className="h-4 w-4 stroke-current" aria-hidden="true" />
            <p className="font-mono text-[11px] uppercase tracking-[0.18em]">
              Why It Matters
            </p>
          </div>
          <div className="mt-4 grid gap-2">
            {item.whyItMatters.map((copy) => (
              <p
                className="rounded-lg border border-[var(--ixai-border)] bg-white/48 p-3 text-sm leading-6 text-[var(--ixai-forest-soft)]"
                key={copy}
              >
                {copy}
              </p>
            ))}
          </div>
        </div>
        <ShareIntelligenceCard item={item} />
      </section>

      <section className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[var(--ixai-gold)]">
              <Share2 className="h-4 w-4 stroke-current" aria-hidden="true" />
              <p className="font-mono text-[11px] uppercase tracking-[0.18em]">
                Share This Intelligence
              </p>
            </div>
            <p className="mt-2 text-sm leading-6 text-white/62">
              分享這張 card，讓對方直接進入對應 intelligence page，而不是 generic 首頁。
            </p>
          </div>
          <ShareActions copy={shareCopy} surface="share" variant="dark" />
        </div>
      </section>

      <PublicIntelligenceEngine density="compact" surface={`share_detail_${item.slug}`} />

      <section className="grid gap-4 rounded-lg border border-[rgba(176,141,87,0.28)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
            Growth Funnel
          </p>
          <h2 className="mt-2 text-2xl font-semibold leading-tight text-[var(--ixai-forest)]">
            從一張 intelligence card，開始建立你的 AI Intelligence Layer。
          </h2>
          <p className="mt-2 text-sm leading-7 text-[var(--ixai-ink-muted)]">
            Share Page → Intelligence Education → Onboarding → Account → Future Intelligence Delivery。
          </p>
        </div>
        <Link
          className="ixai-cta-forest inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold"
          href="/onboarding"
        >
          開始 Onboarding
          <ArrowRight className="h-4 w-4 stroke-current text-[var(--ixai-cream)]" aria-hidden="true" />
        </Link>
      </section>

      <PublicIntelligenceCta surface={`share_intelligence_${item.slug}`} />
    </div>
  );
}
