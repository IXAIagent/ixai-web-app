import Link from "next/link";
import { AudienceSnapshot } from "@/components/admin/audience-snapshot";
import { ConversionFunnel } from "@/components/admin/conversion-funnel";
import { DistributionSnapshot } from "@/components/admin/distribution-snapshot";
import { IntelligenceAnalyticsSnapshot } from "@/components/admin/intelligence-analytics-snapshot";
import { MembershipSnapshot } from "@/components/admin/membership-snapshot";

export const metadata = {
  title: "IXAI Operating Console | Admin",
  description: "IXAI internal intelligence, audience, distribution and membership control layer.",
};

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-lg border border-white/10 bg-white/[0.045] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.18)] sm:p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--ixai-gold)]">
          Admin Console Home
        </p>
        <h1 className="mt-3 max-w-4xl font-serif text-3xl font-semibold leading-tight sm:text-5xl">
          IXAI Operating Console
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/62 sm:text-base">
          Internal intelligence, audience, distribution and membership control layer.
          Public routes stay consumer-facing; this console is for editorial operations,
          growth telemetry and Pro conversion readiness.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {[
          ["Daily Pipeline", "Review, preview and publish Daily Briefs.", "/admin/daily-briefs"],
          ["Weekly Pipeline", "Operate Weekly Intelligence draft and publish workflow.", "/admin/daily-briefs#weekly"],
          ["Publishing Queue", "Human-in-the-loop review remains required.", "/admin/daily-briefs#queue"],
        ].map(([title, copy, href]) => (
          <Link
            className="rounded-lg border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.07]"
            href={href}
            key={title}
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              Editorial
            </p>
            <h2 className="mt-2 text-base font-semibold text-[var(--ixai-cream)]">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-white/52">{copy}</p>
          </Link>
        ))}
      </section>

      <section id="intelligence">
        <IntelligenceAnalyticsSnapshot />
      </section>
      <section id="audience">
        <AudienceSnapshot />
      </section>
      <section id="funnel">
        <ConversionFunnel />
      </section>
      <section id="membership">
        <MembershipSnapshot />
      </section>
      <section id="distribution">
        <DistributionSnapshot />
      </section>
      <section
        className="rounded-lg border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-white/52 sm:p-5"
        id="system"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
          System
        </p>
        <p className="mt-2">
          Environment, health and log surfaces are reserved for future internal
          operations. No public navigation or consumer app shell is rendered on
          admin routes.
        </p>
      </section>
    </div>
  );
}
