"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SectionCard, SectionHeader } from "@/components/dashboard/section-card";
import {
  getLatestPublishedBrief,
  subscribeToEditorialUpdates,
} from "@/src/lib/editorial/repository";
import type { DailyBriefDraft } from "@/src/types/editorial";

const categoryLabels: Record<string, string> = {
  us_market: "美股",
  taiwan_market: "台股",
  crypto: "Crypto",
  rates: "利率",
  ai_market: "AI 科技",
};

export function TodaysBrief({ brief }: { brief: DailyBriefDraft }) {
  const [currentBrief, setCurrentBrief] = useState(brief);

  useEffect(() => {
    function syncPublishedBrief() {
      setCurrentBrief(getLatestPublishedBrief());
    }

    const timeoutId = window.setTimeout(syncPublishedBrief, 0);
    const unsubscribe = subscribeToEditorialUpdates(syncPublishedBrief);

    return () => {
      window.clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  return (
    <SectionCard>
      <SectionHeader
        action="Morning Note"
        eyebrow="今日市場簡報"
        title={currentBrief.title}
      />
      <div className="px-5 py-4">
        <p className="max-w-3xl text-sm leading-6 text-[var(--ixai-forest-soft)]">
          {currentBrief.marketSummary}
        </p>
      </div>
      <div className="divide-y divide-[var(--ixai-border)] border-y border-[var(--ixai-border)]">
        {currentBrief.sections.slice(0, 3).map((section) => (
          <article
            className="grid gap-3 px-5 py-4 sm:grid-cols-[9rem_1fr]"
            key={`${section.category}-${section.headline}`}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ixai-forest)]">
                {categoryLabels[section.category] ?? section.category}
              </p>
              <p className="mt-2 inline-flex rounded-lg border border-[rgba(176,141,87,0.28)] px-2.5 py-1 text-xs text-[var(--ixai-gold)]">
                一玄觀點
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold leading-6 text-[var(--ixai-forest)]">
                {section.headline}
              </h3>
              <p className="mt-1 text-sm leading-6 text-[var(--ixai-ink-muted)]">
                {section.ixaiView}
              </p>
            </div>
          </article>
        ))}
      </div>
      <div className="px-5 py-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--ixai-gold)]">
          編輯觀察
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--ixai-ink-muted)]">
          {currentBrief.editorialNote}
        </p>
        <Link
          className="mt-4 inline-flex rounded-lg border border-[var(--ixai-border)] px-4 py-2 text-sm font-medium text-[var(--ixai-forest)]"
          href={`/daily-brief/${currentBrief.slug}`}
        >
          閱讀每日簡報
        </Link>
      </div>
    </SectionCard>
  );
}
