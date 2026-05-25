"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  ArrowRight,
  CalendarDays,
  MessageCircle,
  Newspaper,
} from "lucide-react";
import { trackEvent } from "@/src/lib/analytics/analytics";

const LINE_OA_URL = process.env.NEXT_PUBLIC_LINE_OA_URL?.trim() ?? "";

// v1.34 — Three-column intelligence distribution strip. Lives right
// under the Intelligence Hero so the home page communicates the three
// surfaces a reader can subscribe through (Daily / Weekly / LINE OA)
// before any deeper data widget.
//
// Mobile: stacked. Desktop: 3-column grid.
// Institutional cream cards; no marketing hype, no popups, no spam tone.

type Column = {
  key: string;
  eyebrow: string;
  title: string;
  copy: string;
  ctaLabel: string;
  href: string;
  external?: boolean;
  icon: typeof Newspaper;
  disabled?: boolean;
  analyticsTarget: string;
};

export function IntelligenceDistributionStrip() {
  useEffect(() => {
    trackEvent("distribution_cta_click", {
      surface: "home",
      variant: "strip",
      impression: true,
    });
  }, []);

  const lineEnabled = LINE_OA_URL.length > 0;

  const columns: Column[] = [
    {
      key: "daily",
      eyebrow: "Daily Intelligence",
      title: "今日市場 narrative",
      copy: "AI-assisted daily read covering Fed / AI / Taiwan / Crypto / Volatility regime.",
      ctaLabel: "閱讀 Daily Brief",
      href: "/daily-brief",
      icon: Newspaper,
      analyticsTarget: "daily_brief",
    },
    {
      key: "weekly",
      eyebrow: "Weekly Intelligence",
      title: "每週 strategist note",
      copy: "Past-week recap + next-week catalysts + cross-market flow narrative.",
      ctaLabel: "閱讀 Weekly Intelligence",
      href: "/weekly-brief",
      icon: CalendarDays,
      analyticsTarget: "weekly_brief",
    },
    {
      key: "line",
      eyebrow: "LINE Intelligence",
      title: "IXAI LINE 官方帳號",
      copy: "Receive daily intelligence、weekly intelligence 與未來 IXAI Pro alerts。",
      ctaLabel: lineEnabled ? "Open LINE OA" : "Coming soon",
      href: lineEnabled ? LINE_OA_URL : "#",
      external: lineEnabled,
      icon: MessageCircle,
      disabled: !lineEnabled,
      analyticsTarget: "line_oa",
    },
  ];

  return (
    <section className="rounded-2xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)] p-4 shadow-[0_14px_38px_rgba(9,41,31,0.045)] sm:p-6">
      <div className="flex items-center gap-2.5">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          Intelligence Distribution
        </p>
      </div>
      <h2 className="mt-2 text-lg font-semibold leading-7 text-[var(--ixai-forest)] sm:text-xl">
        三種接收 IXAI Public Intelligence 的方式。
      </h2>
      <p className="mt-1.5 text-sm leading-7 text-[var(--ixai-forest-soft)]">
        Daily / Weekly / LINE — institutional, risk-first, no buy or sell instructions.
      </p>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {columns.map((column) => {
          const Icon = column.icon;
          const cardClass = `flex h-full flex-col rounded-xl border border-[var(--ixai-border)] bg-white/55 p-4 ${
            column.disabled ? "opacity-70" : ""
          }`;

          return (
            <article className={cardClass} key={column.key}>
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.13)] text-[var(--ixai-gold)]">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                  {column.eyebrow}
                </p>
              </div>
              <h3 className="mt-3 text-base font-semibold leading-6 text-[var(--ixai-forest)]">
                {column.title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                {column.copy}
              </p>
              <div className="mt-auto pt-4">
                {column.disabled ? (
                  <button
                    aria-disabled="true"
                    className="inline-flex min-h-11 w-fit cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/45 px-4 py-2.5 text-sm font-semibold text-[var(--ixai-ink-muted)]"
                    disabled
                    type="button"
                  >
                    {column.ctaLabel}
                  </button>
                ) : column.external ? (
                  <a
                    className="ixai-cta-forest inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold"
                    href={column.href}
                    onClick={() =>
                      trackEvent(
                        column.analyticsTarget === "line_oa"
                          ? "line_oa_click"
                          : "cta_click",
                        { surface: "home", target: column.analyticsTarget },
                      )
                    }
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {column.ctaLabel}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                ) : (
                  <Link
                    className="ixai-cta-forest inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold"
                    href={column.href}
                    onClick={() =>
                      trackEvent("cta_click", {
                        surface: "home",
                        target: column.analyticsTarget,
                      })
                    }
                  >
                    {column.ctaLabel}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
