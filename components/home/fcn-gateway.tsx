import Link from "next/link";
import { ArrowRight, BookOpen, ShieldCheck, Sparkles } from "lucide-react";

// v1.32.2 — FCN education gateway, intelligence-styled. Pure education
// surface; no individualized FCN risk monitoring (that remains a Pro
// feature). Two CTAs: Learn FCN (/fcn) and IXAI Pro Preview (/pro).

export function FcnGateway() {
  return (
    <section className="rounded-2xl border border-[rgba(176,141,87,0.30)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] shadow-[0_18px_56px_rgba(9,41,31,0.16)] sm:p-7">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-md border border-white/12 bg-[rgba(176,141,87,0.18)] text-[var(--ixai-gold)]">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        </span>
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          FCN Education Hub
        </p>
      </div>
      <h2 className="mt-3 font-serif text-xl font-semibold leading-8 sm:text-2xl">
        FCN 不只是 coupon — worst-of / KI / volatility 才是真正風險核心。
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-white/72 sm:text-base sm:leading-8">
        IXAI Public 只做教育型 FCN intelligence；個人化 FCN risk monitoring 與 basket 風控保留在未來 IXAI Pro。
      </p>

      <div className="mt-5 grid gap-3 sm:gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-white/12 bg-white/[0.045] p-3.5 text-sm leading-7 text-[rgba(245,240,230,0.72)] sm:p-4">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            Worst-of
          </div>
          <p className="mt-2">
            多標的 FCN 的最終風險由「最弱的那一檔」主導，配息再高也無法翻轉這個結構。
          </p>
        </article>
        <article className="rounded-xl border border-white/12 bg-white/[0.045] p-3.5 text-sm leading-7 text-[rgba(245,240,230,0.72)] sm:p-4">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            KI / KO
          </div>
          <p className="mt-2">
            KI 是風險觸發，KO 是條件出場；理解這兩個障礙就理解 FCN 的兩面性。
          </p>
        </article>
        <article className="rounded-xl border border-white/12 bg-white/[0.045] p-3.5 text-sm leading-7 text-[rgba(245,240,230,0.72)] sm:p-4">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            Volatility
          </div>
          <p className="mt-2">
            高 coupon 是高波動的對價；理解波動率定價，才能看清 FCN 的真正風險樣貌。
          </p>
        </article>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:gap-3">
        <Link
          className="ixai-cta-cream inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-cream)] px-4 py-2.5 text-sm font-semibold"
          href="/fcn"
        >
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          Learn FCN
        </Link>
        <Link
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-[var(--ixai-cream)] transition hover:bg-white/[0.06]"
          href="/pro"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          IXAI Pro Preview
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
