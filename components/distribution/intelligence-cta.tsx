"use client";

import { useEffect } from "react";
import { EmailCapture } from "@/components/distribution/email-capture";
import { LineOaGateway } from "@/components/distribution/line-oa-gateway";
import { ShareActions } from "@/components/share/share-actions";
import { trackEvent } from "@/src/lib/analytics/analytics";
import type { ShareCopy } from "@/src/lib/share/share-copy";

// v1.34 — Distribution CTA system. Single client component with three
// optional surfaces (email capture / LINE OA / share row) and four
// layout variants. Tracks distribution_cta_click on mount so each
// rendered CTA produces an attribution signal even when the visitor
// does not interact.

export type IntelligenceCtaSurface = "home" | "daily" | "weekly" | "market" | "fcn";
export type IntelligenceCtaVariant = "hero" | "inline" | "article-bottom" | "compact";

type IntelligenceCtaProps = {
  surface: IntelligenceCtaSurface;
  variant?: IntelligenceCtaVariant;
  showEmailCapture?: boolean;
  showLineGateway?: boolean;
  shareCopy?: ShareCopy;
  shareSurface?: "home" | "weekly" | "daily" | "fcn";
  emailTitle?: string;
  emailDescription?: string;
};

export function IntelligenceCta({
  surface,
  variant = "inline",
  showEmailCapture = true,
  showLineGateway = true,
  shareCopy,
  shareSurface,
  emailTitle,
  emailDescription,
}: IntelligenceCtaProps) {
  // Fire once on mount; useful when surfaces render a CTA so future
  // analytics can attribute impressions even without interaction.
  useEffect(() => {
    const handle = window.setTimeout(() => {
      trackEvent("distribution_cta_click", { surface, variant, impression: true });
    }, 0);

    return () => {
      window.clearTimeout(handle);
    };
  }, [surface, variant]);

  const baseClass =
    variant === "hero"
      ? "rounded-2xl border border-[rgba(176,141,87,0.30)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] shadow-[0_18px_56px_rgba(9,41,31,0.18)] sm:p-7"
      : "rounded-2xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)] p-4 shadow-[0_14px_38px_rgba(9,41,31,0.045)] sm:p-6";

  const heroTone = variant === "hero";

  const eyebrow = (
    <p
      className={`font-mono text-[11px] uppercase tracking-[0.22em] ${
        heroTone ? "text-[var(--ixai-gold)]" : "text-[var(--ixai-gold)]"
      }`}
    >
      Intelligence Distribution
    </p>
  );

  const heading =
    surface === "weekly"
      ? "Subscribe to IXAI Weekly Intelligence"
      : surface === "daily"
        ? "Subscribe to IXAI Daily Intelligence"
        : "Subscribe to IXAI Intelligence";

  if (variant === "compact") {
    return (
      <section className={baseClass}>
        {eyebrow}
        <h3
          className={`mt-2 text-base font-semibold leading-6 ${
            heroTone ? "text-[var(--ixai-cream)]" : "text-[var(--ixai-forest)]"
          }`}
        >
          {heading}
        </h3>
        <p
          className={`mt-1.5 text-sm leading-7 ${
            heroTone ? "text-white/72" : "text-[var(--ixai-forest-soft)]"
          }`}
        >
          AI-assisted intelligence delivered via email or LINE — institutional, risk-first, no buy/sell calls.
        </p>
        <div className="mt-4 grid gap-2 sm:flex sm:flex-wrap sm:gap-3">
          {showEmailCapture ? (
            <a
              className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold ${
                heroTone
                  ? "ixai-cta-cream bg-[var(--ixai-cream)]"
                  : "ixai-cta-forest bg-[var(--ixai-forest)]"
              }`}
              href="#ixai-email-subscribe"
              onClick={() => trackEvent("cta_click", { surface, target: "email_capture" })}
            >
              Subscribe via email
            </a>
          ) : null}
          {showLineGateway ? (
            <a
              className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium ${
                heroTone
                  ? "border-white/15 bg-white/[0.05] text-[var(--ixai-cream)]"
                  : "border-[var(--ixai-border)] bg-white/55 text-[var(--ixai-forest)]"
              }`}
              href="#ixai-line-oa"
              onClick={() => trackEvent("cta_click", { surface, target: "line_oa" })}
            >
              LINE OA
            </a>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className={baseClass}>
      {eyebrow}
      <h3
        className={`mt-2 text-lg font-semibold leading-7 ${
          heroTone ? "text-[var(--ixai-cream)]" : "text-[var(--ixai-forest)]"
        } sm:text-xl`}
      >
        {heading}
      </h3>
      <p
        className={`mt-2 text-sm leading-7 ${
          heroTone ? "text-white/72" : "text-[var(--ixai-forest-soft)]"
        } sm:leading-8`}
      >
        IXAI Public Intelligence — daily and weekly strategist narrative covering AI, macro, Taiwan semis, crypto and FCN risk.
      </p>

      <div
        className={`mt-5 grid gap-3 ${
          variant === "article-bottom" || variant === "hero" ? "md:grid-cols-2" : "md:grid-cols-2"
        }`}
      >
        {showEmailCapture ? (
          <div id="ixai-email-subscribe">
            <EmailCapture
              description={emailDescription}
              surface={surface}
              title={emailTitle}
              variant="inline"
            />
          </div>
        ) : null}
        {showLineGateway ? (
          <div id="ixai-line-oa">
            <LineOaGateway surface={surface} variant="inline" />
          </div>
        ) : null}
      </div>

      {shareCopy ? (
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p
            className={`text-xs leading-6 ${
              heroTone ? "text-white/58" : "text-[var(--ixai-ink-muted)]"
            }`}
          >
            Share this intelligence with your network.
          </p>
          <ShareActions
            copy={shareCopy}
            surface={shareSurface ?? (surface === "market" ? "home" : surface)}
            variant={heroTone ? "dark" : "light"}
          />
        </div>
      ) : null}
    </section>
  );
}
