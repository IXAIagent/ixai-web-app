"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { trackEvent } from "@/src/lib/analytics/analytics";
import type { IntelligenceSurface } from "@/src/lib/intelligence/access";

export function UpgradeIntelligenceCta({
  className = "",
  membership = "free",
  source,
  surface,
  tone = "dark",
}: {
  className?: string;
  membership?: string;
  source: string;
  surface: IntelligenceSurface;
  tone?: "dark" | "light";
}) {
  const secondaryClass =
    tone === "light"
      ? "border-[var(--ixai-border)] bg-white/45 text-[var(--ixai-forest)] hover:bg-white/72"
      : "border-white/15 text-white/76 hover:bg-white/8 hover:text-white";

  function trackUpgradeClick(target: string) {
    trackEvent("gated_upgrade_click", {
      membership,
      source,
      surface,
      target,
    });
  }

  return (
    <div className={`flex flex-col gap-2 sm:flex-row sm:flex-wrap ${className}`}>
      <Link
        className="ixai-cta-cream inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-cream)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-forest)]"
        href="/pro#pro-waitlist"
        onClick={() => trackUpgradeClick("pro_waitlist")}
      >
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        加入 Pro 等候名單
      </Link>
      <Link
        className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${secondaryClass}`}
        href="/pro-preview"
        onClick={() => trackUpgradeClick("pro_preview")}
      >
        查看 Pro 預覽控制台
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
      <Link
        className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${secondaryClass}`}
        href="/pro-intelligence"
        onClick={() => trackUpgradeClick("pro_intelligence")}
      >
        Upgrade Intelligence
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
