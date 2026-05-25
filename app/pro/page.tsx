import Link from "next/link";
import { ArrowRight, FileText, Sparkles } from "lucide-react";
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
            <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--ixai-gold)]">
              IXAI Pro Preview
            </p>
            <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight sm:mt-4 sm:text-5xl">
              IXAI Pro — Personal Intelligence Layer
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72 sm:mt-6 sm:text-base sm:leading-8">
              Public Intelligence tells you what matters in the market. IXAI Pro
              will connect that intelligence to your portfolio, FCN exposure,
              watchlist memory and personal risk workflow.
            </p>
            <p className="mt-3 max-w-2xl text-xs leading-6 text-white/52 sm:text-sm">
              IXAI Pro is currently in waitlist / preview stage. No payment is
              required, and this page does not provide investment advice,
              targets, signals or guaranteed returns.
            </p>
            <div className="mt-5 grid gap-2 sm:mt-7 sm:flex sm:flex-wrap sm:gap-3">
              <a
                className="ixai-cta-cream inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-cream)] px-4 py-2.5 text-sm font-semibold"
                href="#pro-waitlist"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Join Pro Waitlist
              </a>
              <Link
                className="ixai-cta-outline-dark inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium transition hover:bg-white/8 hover:text-white"
                href="/daily-brief"
              >
                <FileText className="h-4 w-4" aria-hidden="true" />
                Continue with Public Intelligence
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4 sm:p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
              Upgrade logic
            </p>
            <div className="mt-4 grid gap-3">
              {[
                ["Public", "Daily / Weekly Intelligence, Market Signals, FCN education."],
                ["Subscriber", "Email capture, identity stitching, membership foundation."],
                ["Pro", "Personal portfolio intelligence, FCN monitoring, AI alerts."],
              ].map(([label, copy]) => (
                <article className="rounded-lg border border-white/10 bg-white/[0.045] p-4" key={label}>
                  <p className="font-mono text-xs uppercase tracking-[0.14em] text-white/42">
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

      <section
        className="grid gap-4 rounded-lg border border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center"
        id="pro-waitlist"
      >
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Waitlist / Preview
          </p>
          <h2 className="mt-2 font-serif text-3xl font-semibold leading-tight text-[var(--ixai-forest)]">
            Be first when IXAI Pro opens.
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
            Join the Pro waitlist to become a conversion candidate in the IXAI
            membership foundation. This creates a free member record and keeps
            your Pro intent connected to the same subscriber identity graph.
          </p>
        </div>
        <ProWaitlistCta requestedFeature="portfolio_intelligence" />
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.78)] p-4 text-sm leading-7 text-[var(--ixai-ink-muted)] sm:p-5">
        IXAI Pro will focus on intelligence, risk awareness and workflow support.
        It will not provide guaranteed returns, buy/sell instructions, price
        targets or individualized investment recommendations.
        <Link
          className="ml-1 inline-flex items-center gap-1 font-semibold text-[var(--ixai-forest)]"
          href="/daily-brief"
        >
          Back to Public Intelligence
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
