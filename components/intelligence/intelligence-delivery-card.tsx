"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, BellRing, Clock, LockKeyhole, MessageCircle } from "lucide-react";
import { useIdentitySession } from "@/components/auth/identity-provider";
import { trackEvent } from "@/src/lib/analytics/analytics";
import {
  canAccessDeliveryTier,
  getDeliverySchedulerReadiness,
  type IntelligenceDeliveryTier,
} from "@/src/lib/intelligence/delivery";

export function IntelligenceDeliveryCard({
  source = "intelligence_delivery_card",
  tier = "public",
}: {
  source?: string;
  tier?: IntelligenceDeliveryTier;
}) {
  const { lineConnected, membership } = useIdentitySession();
  const access = canAccessDeliveryTier(tier, membership?.plan ?? "anonymous");
  const readiness = getDeliverySchedulerReadiness();

  useEffect(() => {
    trackEvent("intelligence_delivery_preview_open", {
      line_connected: lineConnected,
      membership: membership?.plan ?? "anonymous",
      path: window.location.pathname,
      source,
      tier,
    });
    if (tier === "pro") {
      trackEvent("pro_intelligence_preview_view", {
        membership: membership?.plan ?? "anonymous",
        path: window.location.pathname,
        source,
        tier,
      });
    }
  }, [lineConnected, membership?.plan, source, tier]);

  return (
    <section className="rounded-lg border border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ixai-gold)]">
            Intelligence Delivery
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-7 text-[var(--ixai-forest)]">
            Daily Intelligence Habit Loop
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ixai-ink-muted)]">
            IXAI delivery foundation 會把晨間情報、總經風險、Watchlist memory 與 LINE readiness
            組成可排程、可 opt-in、可升級到 Pro 的情報遞送架構。
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--ixai-border)] bg-white/55 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ixai-forest)]">
          <BellRing className="h-3.5 w-3.5 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" />
          {tier}
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <article className="rounded-lg border border-[var(--ixai-border)] bg-white/48 p-3">
          <Clock className="h-4 w-4 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" />
          <p className="mt-2 text-sm font-semibold text-[var(--ixai-forest)]">Morning Intelligence</p>
          <p className="mt-1 text-xs leading-5 text-[var(--ixai-ink-muted)]">
            每天 08:00 的 Morning Intelligence 節奏預覽；正式推送需 opt-in 與 delivery queue。
          </p>
        </article>
        <article className="rounded-lg border border-[var(--ixai-border)] bg-white/48 p-3">
          <MessageCircle className="h-4 w-4 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" />
          <p className="mt-2 text-sm font-semibold text-[var(--ixai-forest)]">LINE Readiness</p>
          <p className="mt-1 text-xs leading-5 text-[var(--ixai-ink-muted)]">
            {lineConnected ? "LINE 已連接；未來情報遞送仍需明確 opt-in。" : "可透過既有 LINE entry 建立未來情報遞送基礎。"}
          </p>
        </article>
        <article className="rounded-lg border border-[var(--ixai-border)] bg-white/48 p-3">
          <LockKeyhole className="h-4 w-4 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" />
          <p className="mt-2 text-sm font-semibold text-[var(--ixai-forest)]">Public vs Pro</p>
          <p className="mt-1 text-xs leading-5 text-[var(--ixai-ink-muted)]">
            {access.reason}
          </p>
        </article>
      </div>

      <div className="mt-4 grid gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/45 p-3 text-xs leading-5 text-[var(--ixai-ink-muted)] sm:flex sm:items-center sm:justify-between">
        <span>{readiness.nextFoundationStep}</span>
        <Link
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] px-3 py-2 font-semibold text-[var(--ixai-forest)]"
          href="/pro-intelligence"
        >
          查看 Pro Intelligence 預覽
          <ArrowRight className="h-3.5 w-3.5 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
