"use client";

import Link from "next/link";
import { useState } from "react";
import { getPublishedBriefBySlug } from "@/src/lib/editorial/repository";
import type { DailyBriefDraft } from "@/src/types/editorial";

const categoryLabels: Record<string, string> = {
  us_market: "美股",
  taiwan_market: "台股",
  crypto: "Crypto",
  rates: "利率",
  ai_market: "AI 科技",
};

export function DailyBriefLocalDetail({ slug }: { slug: string }) {
  const [brief] = useState<DailyBriefDraft | undefined>(() =>
    getPublishedBriefBySlug(slug),
  );

  if (!brief) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          Daily Brief
        </p>
        <h1 className="text-2xl font-semibold text-[var(--ixai-forest)]">
          找不到這份每日簡報。
        </h1>
        <Link
          className="w-fit rounded-lg border border-[var(--ixai-border)] px-4 py-2 text-sm font-medium text-[var(--ixai-forest)]"
          href="/daily-brief"
        >
          回到封存
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <section className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] p-5 text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)] sm:p-7">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--ixai-gold)]">
          Daily Brief / {brief.publishedAt}
        </p>
        <h1 className="mt-3 max-w-3xl text-2xl font-semibold leading-snug sm:text-4xl">
          {brief.title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-white/72">
          {brief.marketSummary}
        </p>
      </section>

      {brief.editorialNote ? (
        <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)] p-5 sm:p-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            一玄觀點
          </p>
          <p className="mt-3 text-base leading-8 text-[var(--ixai-forest-soft)]">
            {brief.editorialNote}
          </p>
        </section>
      ) : null}

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.8)]">
        <div className="border-b border-[var(--ixai-border)] px-5 py-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            市場摘要
          </p>
          <h2 className="mt-1 text-base font-semibold text-[var(--ixai-forest)]">
            Published from Editorial CMS
          </h2>
        </div>
        <div className="divide-y divide-[var(--ixai-border)]">
          {brief.sections.map((section) => (
            <section
              className="grid gap-4 px-5 py-5 md:grid-cols-[10rem_1fr]"
              key={`${section.category}-${section.headline}`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ixai-forest)]">
                {categoryLabels[section.category] ?? section.category}
              </p>
              <div>
                <h3 className="text-lg font-semibold leading-7 text-[var(--ixai-forest)]">
                  {section.headline}
                </h3>
                <p className="mt-2 text-sm leading-7 text-[var(--ixai-ink-muted)]">
                  {section.summary}
                </p>
                {section.ixaiView ? (
                  <p className="mt-4 rounded-lg border border-[rgba(176,141,87,0.26)] bg-[rgba(176,141,87,0.08)] p-4 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                    {section.ixaiView}
                  </p>
                ) : null}
              </div>
            </section>
          ))}
        </div>
      </section>
    </article>
  );
}
