"use client";

import { Eyebrow } from "@/components/ui/eyebrow";
import { todayRiskFocus } from "@/src/lib/daily-intelligence";
import { subscribeToEditorialUpdates } from "@/src/lib/editorial/repository";
import type { DailyBriefDraft } from "@/src/types/editorial";
import { useEffect, useState } from "react";

export function RiskFocus() {
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
    <section className="rounded-lg border border-[rgba(176,141,87,0.34)] bg-[rgba(9,41,31,0.96)] p-4 text-[var(--ixai-cream)] shadow-[0_16px_44px_rgba(9,41,31,0.12)] sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Eyebrow density="extra-wide">{riskFocus.label}</Eyebrow>
          <h2 className="mt-2 text-lg font-semibold leading-7">
            {riskFocus.title}
          </h2>
        </div>
        <span className="w-fit rounded-md border border-red-200/20 bg-red-200/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-red-100">
          Risk-first
        </span>
      </div>
      <p className="mt-3 text-sm leading-7 text-white/66">
        {riskFocus.summary}
      </p>
      <Eyebrow mono className="mt-3">
        {riskFocus.updatedLabel}
      </Eyebrow>
    </section>
  );
}
