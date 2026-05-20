"use client";

import Link from "next/link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { todayRiskFocus } from "@/src/lib/daily-intelligence";
import {
  getLatestPublishedIntelligence,
  subscribeToEditorialUpdates,
} from "@/src/lib/editorial/repository";
import { useEffect, useState } from "react";

export function MobileTopInsight() {
  const [riskFocus, setRiskFocus] = useState(todayRiskFocus);

  useEffect(() => {
    function syncIntelligence() {
      setRiskFocus(getLatestPublishedIntelligence()?.riskFocus ?? todayRiskFocus);
    }

    const timeoutId = window.setTimeout(syncIntelligence, 0);
    const unsubscribe = subscribeToEditorialUpdates(syncIntelligence);

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
