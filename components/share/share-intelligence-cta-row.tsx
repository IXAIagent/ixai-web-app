"use client";

import Link from "next/link";
import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import { trackEvent } from "@/src/lib/analytics/analytics";
import { LINE_CONSULTATION_URL } from "@/src/lib/line/public-links";

function trackShareCta(event: "share_cta_click" | "share_onboarding_click" | "share_preview_click" | "share_line_click", target: string, slug: string) {
  trackEvent(event, {
    path: window.location.pathname,
    slug,
    surface: "share_intelligence",
    target,
  });
}

export function ShareIntelligenceCtaRow({ slug }: { slug: string }) {
  return (
    <div className="grid gap-2 sm:flex sm:flex-wrap">
      <Link
        className="ixai-cta-cream inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-cream)] px-4 py-2.5 text-sm font-semibold"
        href="/onboarding"
        onClick={() => {
          trackShareCta("share_cta_click", "/onboarding", slug);
          trackShareCta("share_onboarding_click", "/onboarding", slug);
        }}
      >
        建立我的 Intelligence Layer
        <ArrowRight className="h-4 w-4 stroke-current text-[var(--ixai-forest)]" aria-hidden="true" />
      </Link>
      <Link
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)] transition hover:bg-white/8"
        href="/pro-preview"
        onClick={() => {
          trackShareCta("share_cta_click", "/pro-preview", slug);
          trackShareCta("share_preview_click", "/pro-preview", slug);
        }}
      >
        查看 Intelligence Preview
        <Sparkles className="h-4 w-4 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" />
      </Link>
      <Link
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)] transition hover:bg-white/8"
        href={LINE_CONSULTATION_URL}
        onClick={() => {
          trackShareCta("share_cta_click", "line_oa", slug);
          trackShareCta("share_line_click", "line_oa", slug);
        }}
        rel="noopener noreferrer"
        target="_blank"
      >
        加入 LINE 接收情報
        <MessageCircle className="h-4 w-4 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" />
      </Link>
    </div>
  );
}
