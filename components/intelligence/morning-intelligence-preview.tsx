"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight, Sunrise } from "lucide-react";
import { trackEvent } from "@/src/lib/analytics/analytics";
import { buildMorningIntelligenceMessage } from "@/src/lib/intelligence/delivery";
import type { IntelligenceDeliveryTier } from "@/src/lib/intelligence/delivery";

export function MorningIntelligencePreview({
  source = "morning_intelligence_preview",
  tier = "public",
}: {
  source?: string;
  tier?: IntelligenceDeliveryTier;
}) {
  const message = buildMorningIntelligenceMessage(tier);

  useEffect(() => {
    trackEvent("morning_intelligence_view", {
      path: window.location.pathname,
      source,
      tier,
    });
    trackEvent("intelligence_push_preview_view", {
      path: window.location.pathname,
      source,
      tier,
    });
  }, [source, tier]);

  return (
    <section className="rounded-lg border border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ixai-gold)]">
            Morning Intelligence Preview
          </p>
          <h2 className="mt-2 flex items-center gap-2 text-xl font-semibold leading-7 text-[var(--ixai-forest)]">
            <Sunrise className="h-5 w-5 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" />
            {message.title}
          </h2>
        </div>
        <span className="rounded-full border border-[var(--ixai-border)] bg-white/55 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ixai-forest-soft)]">
          {tier}
        </span>
      </div>
      <div className="mt-4 grid gap-2">
        {message.items.map((item) => (
          <article
            className="rounded-lg border border-[var(--ixai-border)] bg-white/50 p-3"
            key={`${item.category}-${item.title}`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-[var(--ixai-forest)]">{item.title}</p>
              <span className="rounded-full bg-[rgba(176,141,87,0.12)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ixai-gold)]">
                {item.tier}
              </span>
            </div>
            <p className="mt-1 text-xs leading-5 text-[var(--ixai-ink-muted)]">{item.copy}</p>
          </article>
        ))}
      </div>
      <div className="mt-4 grid gap-2 sm:flex sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-[var(--ixai-ink-muted)]">{message.footer}</p>
        <Link
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] px-3 py-2 text-xs font-semibold text-[var(--ixai-forest)]"
          href={message.ctaUrl}
        >
          {message.ctaLabel}
          <ArrowRight className="h-3.5 w-3.5 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
