"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getLatestPublishedBrief,
  subscribeToEditorialUpdates,
} from "@/src/lib/editorial/repository";
import type { DailyBriefDraft } from "@/src/types/editorial";

export function DailyBriefLiveArchive({ staticSlug }: { staticSlug: string }) {
  const [brief, setBrief] = useState<DailyBriefDraft | null>(null);

  useEffect(() => {
    function syncBrief() {
      const latest = getLatestPublishedBrief();
      setBrief(latest.slug === staticSlug ? null : latest);
    }

    const timeoutId = window.setTimeout(syncBrief, 0);
    const unsubscribe = subscribeToEditorialUpdates(syncBrief);

    return () => {
      window.clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [staticSlug]);

  if (!brief) {
    return null;
  }

  return (
    <section className="rounded-lg border border-[rgba(176,141,87,0.34)] bg-[rgba(9,41,31,0.96)] p-5 text-[var(--ixai-cream)] sm:p-6">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
        Live Published / {brief.publishedAt}
      </p>
      <h2 className="mt-3 max-w-3xl text-2xl font-semibold leading-8">
        {brief.title}
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-white/66">
        {brief.marketSummary}
      </p>
      <Link
        className="mt-5 inline-flex rounded-lg bg-[var(--ixai-cream)] px-4 py-2 text-sm font-medium text-[var(--ixai-forest)]"
        href={`/daily-brief/${brief.slug}`}
      >
        閱讀最新 Live Brief
      </Link>
    </section>
  );
}
