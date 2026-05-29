"use client";

import Link from "next/link";
import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import { trackEvent } from "@/src/lib/analytics/analytics";
import { LINE_CONSULTATION_URL } from "@/src/lib/line/public-links";

type PublicIntelligenceCtaProps = {
  surface: string;
};

type PublicIntelligenceEvent =
  | "public_intelligence_cta_click"
  | "public_intelligence_onboarding_click"
  | "public_intelligence_preview_click"
  | "public_intelligence_line_click";

function trackPublicIntelligenceCta(event: PublicIntelligenceEvent, surface: string, target: string) {
  trackEvent(event, {
    path: window.location.pathname,
    surface,
    target,
  });
}

export function PublicIntelligenceCta({ surface }: PublicIntelligenceCtaProps) {
  return (
    <section className="rounded-lg border border-[rgba(176,141,87,0.3)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] shadow-[0_18px_56px_rgba(9,41,31,0.12)] sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Public Intelligence
          </p>
          <h2 className="mt-2 text-2xl font-semibold leading-tight sm:text-3xl">
            想讓 IXAI 開始理解你的投資世界？
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/68">
            建立免費 Intelligence Layer，設定你的 Watchlist、FCN 關注與 LINE intelligence delivery 偏好。
            這是市場資訊與風險脈絡整理，不構成個別投資建議。
          </p>
        </div>
        <div className="grid gap-2 sm:flex sm:flex-wrap lg:justify-end">
          <Link
            className="ixai-cta-cream inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-cream)] px-4 py-2.5 text-sm font-semibold"
            href="/onboarding"
            onClick={() => {
              trackPublicIntelligenceCta("public_intelligence_cta_click", surface, "/onboarding");
              trackPublicIntelligenceCta("public_intelligence_onboarding_click", surface, "/onboarding");
            }}
          >
            建立免費 Intelligence Layer
            <ArrowRight className="h-4 w-4 stroke-current text-[var(--ixai-forest)]" aria-hidden="true" />
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)] transition hover:bg-white/8"
            href="/pro-preview"
            onClick={() => {
              trackPublicIntelligenceCta("public_intelligence_cta_click", surface, "/pro-preview");
              trackPublicIntelligenceCta("public_intelligence_preview_click", surface, "/pro-preview");
            }}
          >
            查看 Intelligence Preview
            <Sparkles className="h-4 w-4 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" />
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)] transition hover:bg-white/8"
            href={LINE_CONSULTATION_URL}
            onClick={() => {
              trackPublicIntelligenceCta("public_intelligence_cta_click", surface, "line_oa");
              trackPublicIntelligenceCta("public_intelligence_line_click", surface, "line_oa");
            }}
            rel="noopener noreferrer"
            target="_blank"
          >
            加入 LINE 接收情報
            <MessageCircle className="h-4 w-4 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
