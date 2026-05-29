import Link from "next/link";
import { ArrowRight, Share2 } from "lucide-react";
import { PublicIntelligenceEngine } from "@/components/intelligence/public-intelligence-engine";
import { ShareIntelligenceCard } from "@/components/share/share-intelligence-card";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";
import { SHARE_INTELLIGENCE_ITEMS } from "@/src/lib/share/intelligence";

export const metadata = buildPublicMetadata({
  title: "IXAI Share Intelligence",
  description:
    "IXAI share intelligence cards for market pulse, FCN awareness, watchlist intelligence and AI risk monitor.",
  canonical: "/share",
});

export default function SharePage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-5 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
      <section className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] sm:p-7">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          Share Intelligence
        </p>
        <h1 className="mt-3 max-w-3xl font-serif text-3xl font-semibold leading-tight sm:text-5xl">
          分享一張 IXAI intelligence card。
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68 sm:text-base">
          每張卡片都是一個 acquisition entry：先理解一個市場脈絡，再進入 onboarding、
          Intelligence Preview 與未來 delivery relationship。
        </p>
        <Link
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)] transition hover:bg-white/8"
          href="/"
        >
          返回 IXAI Landing
          <ArrowRight className="h-4 w-4 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" />
        </Link>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {SHARE_INTELLIGENCE_ITEMS.map((item) => (
          <ShareIntelligenceCard compact item={item} key={item.slug} />
        ))}
      </section>

      <PublicIntelligenceEngine density="compact" surface="share_index" />

      <section className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-5">
        <div className="flex items-center gap-2 text-[var(--ixai-gold)]">
          <Share2 className="h-4 w-4 stroke-current" aria-hidden="true" />
          <p className="font-mono text-[11px] uppercase tracking-[0.18em]">
            Growth Funnel
          </p>
        </div>
        <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
          Share Page → Intelligence Education → Onboarding → Account → Future Personal Intelligence。
          此版本不做 dynamic image generation，也不接資料庫。
        </p>
      </section>
    </div>
  );
}
