"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Eye, FileText, Sparkles, X } from "lucide-react";
import { trackEvent } from "@/src/lib/analytics/events";
import {
  markOnboardingSeen,
  readOnboardingSeen,
} from "@/src/lib/onboarding/seen-store";

// v1.29.5 — first-visit banner. Shown once per device, dismissible,
// localStorage-backed via ixai_onboarding_seen_v1. No modal, no
// fullscreen takeover; sits at the top of the home page as a calm
// welcome strip so first-time visitors have an obvious next step.
export function FirstVisitBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (!readOnboardingSeen("homeWelcome")) {
        setVisible(true);
        trackEvent("onboarding_seen", { surface: "home_first_visit" });
      }
    }, 0);

    return () => window.clearTimeout(handle);
  }, []);

  function dismiss() {
    markOnboardingSeen("homeWelcome");
    setVisible(false);
    trackEvent("onboarding_dismissed", { surface: "home_first_visit" });
  }

  if (!visible) {
    return null;
  }

  return (
    <section className="relative rounded-2xl border border-[rgba(176,141,87,0.32)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] shadow-[0_16px_44px_rgba(9,41,31,0.16)] sm:p-5">
      <button
        aria-label="關閉歡迎訊息"
        className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/12 bg-white/[0.06] text-[rgba(245,240,230,0.66)] transition hover:bg-white/12 hover:text-[var(--ixai-cream)]"
        onClick={dismiss}
        type="button"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
      <div className="flex flex-col gap-3 pr-12 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/12 bg-[rgba(176,141,87,0.18)] text-[var(--ixai-gold)]">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              歡迎來到 IXAI
            </p>
            <h2 className="mt-1.5 text-base font-semibold leading-6 sm:text-lg">
              從 Daily Brief 開始你的市場 Intelligence 體驗。
            </h2>
            <p className="mt-1.5 text-sm leading-7 text-[rgba(245,240,230,0.66)]">
              IXAI Public App 是一玄投資延伸出的 AI Wealth Intelligence 系統 — 先建立每日閱讀，再進入個人觀察清單。
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-col sm:gap-2 sm:self-stretch">
          <Link
            className="ixai-cta-cream inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-cream)] px-3 py-2 text-sm font-semibold sm:px-4"
            href="/daily-brief"
            onClick={dismiss}
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            查看 Daily Brief
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.05] px-3 py-2 text-sm font-medium text-[var(--ixai-cream)] transition hover:bg-white/12 sm:px-4"
            href="/watchlist"
            onClick={dismiss}
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
            建立 Watchlist
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
