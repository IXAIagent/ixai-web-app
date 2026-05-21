"use client";

import Link from "next/link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { todayRiskFocus } from "@/src/lib/daily-intelligence";
import { subscribeToEditorialUpdates } from "@/src/lib/editorial/repository";
import type { DailyBriefDraft } from "@/src/types/editorial";
import { useEffect, useState } from "react";

export function MobileTopInsight() {
  const [riskFocus, setRiskFocus] = useState(todayRiskFocus);

  useEffect(() => {
    async function syncIntelligence() {
      const response = await fetch("/api/daily-briefs", { cache: "no-store" }).catch(() => null);
      const payload = response?.ok
        ? ((await response.json()) as { latest?: DailyBriefDraft })
        : null;

      setRiskFocus(payload?.latest?.intelligence?.riskFocus ?? todayRiskFocus);
    }

    const timeoutId = window.setTimeout(() => void syncIntelligence(), 0);
    const unsubscribe = subscribeToEditorialUpdates(() => void syncIntelligence());

    return () => {
      window.clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  return (
    <Link className="min-w-0 flex-1" href="/">
      <Eyebrow>{riskFocus.label}</Eyebrow>
      <p className="mt-0.5 line-clamp-1 text-sm font-semibold text-[var(--ixai-forest)]">
        {riskFocus.title}
      </p>
    </Link>
  );
}
