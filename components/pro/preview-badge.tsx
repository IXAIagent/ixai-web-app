"use client";

import { useEffect } from "react";
import { Eye } from "lucide-react";
import { trackEvent } from "@/src/lib/analytics/analytics";
import type { IntelligenceSurface } from "@/src/lib/intelligence/access";

export function PreviewBadge({
  surface = "pro_preview",
  label = "Preview · Sample-only",
}: {
  surface?: IntelligenceSurface;
  label?: string;
}) {
  useEffect(() => {
    trackEvent("preview_badge_view", {
      membership: "free",
      source: "preview_badge",
      surface,
    });
  }, [surface]);

  return (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-md border border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.1)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ixai-gold)]">
      <Eye className="h-3 w-3" aria-hidden="true" />
      {label}
    </span>
  );
}
