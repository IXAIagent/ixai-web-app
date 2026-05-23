"use client";

import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { trackEvent } from "@/src/lib/analytics/events";
import {
  markOnboardingSeen,
  readOnboardingSeen,
} from "@/src/lib/onboarding/seen-store";

// v1.29.5 — first-time /fcn visit hint. Inline strip, dismissible, never
// a modal. The actual education content lives in the page below; this is
// just a one-line reframe for first-time visitors.
export function FcnIntroHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (!readOnboardingSeen("fcnIntro")) {
        setVisible(true);
        trackEvent("onboarding_seen", { surface: "fcn_intro_hint" });
      }
    }, 0);

    return () => window.clearTimeout(handle);
  }, []);

  function dismiss() {
    markOnboardingSeen("fcnIntro");
    setVisible(false);
    trackEvent("onboarding_dismissed", { surface: "fcn_intro_hint" });
  }

  if (!visible) {
    return null;
  }

  return (
    <section className="relative rounded-2xl border border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.92)] p-4 shadow-[0_12px_30px_rgba(9,41,31,0.05)] sm:p-5">
      <button
        aria-label="關閉 FCN 教育提示"
        className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--ixai-border)] bg-white/45 text-[var(--ixai-forest-soft)] transition hover:bg-white/65 hover:text-[var(--ixai-forest)]"
        onClick={dismiss}
        type="button"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
      <div className="flex items-start gap-3 pr-12">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.13)] text-[var(--ixai-gold)]">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            FCN Education Hub
          </p>
          <h2 className="mt-1.5 text-base font-semibold leading-6 text-[var(--ixai-forest)] sm:text-lg">
            FCN 不只是高配息，而是結構化風險商品。
          </h2>
          <p className="mt-1.5 text-sm leading-7 text-[var(--ixai-forest-soft)]">
            這頁是 IXAI Public App 的 FCN 教育入口。完整個人化監控保留在未來 IXAI Pro。
          </p>
        </div>
      </div>
    </section>
  );
}
