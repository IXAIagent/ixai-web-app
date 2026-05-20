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
  const intelligence = brief?.intelligence;
  const sourceLabels = intelligence?.sourceLabels ?? [];

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
            <details
              open
              className="grid gap-4 px-5 py-5 md:grid-cols-[10rem_1fr]"
              key={`${section.category}-${section.headline}`}
            >
              <summary className="cursor-pointer list-none text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ixai-forest)] md:pt-1">
                {categoryLabels[section.category] ?? section.category}
              </summary>
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
            </details>
          ))}
        </div>
      </section>

      {intelligence ? (
        <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.82)] p-5 sm:p-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Session Regime
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-[var(--ixai-border)] bg-white/45 p-4">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--ixai-ink-muted)]">
                Session
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--ixai-forest)]">
                {intelligence.sessionLabel}
              </p>
            </div>
            <div className="rounded-lg border border-[var(--ixai-border)] bg-white/45 p-4">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--ixai-ink-muted)]">
                Regime
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--ixai-forest)]">
                {intelligence.marketRegime}
              </p>
            </div>
            <div className="rounded-lg border border-[var(--ixai-border)] bg-white/45 p-4">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--ixai-ink-muted)]">
                Generated
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--ixai-forest)]">
                {new Date(intelligence.generatedAt).toLocaleString("zh-TW", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-[var(--ixai-forest-soft)]">
            {intelligence.marketRegimeNote}
          </p>
        </section>
      ) : null}

      {intelligence ? (
        <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.82)] p-5 sm:p-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Intelligence Observations
          </p>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div className="rounded-lg border border-[var(--ixai-border)] bg-white/45 p-4">
              <h3 className="text-sm font-semibold text-[var(--ixai-forest)]">
                Rates / Macro
              </h3>
              <p className="mt-2 text-sm leading-7 text-[var(--ixai-ink-muted)]">
                {intelligence.macroRatesObservation}
              </p>
            </div>
            <div className="rounded-lg border border-[var(--ixai-border)] bg-white/45 p-4">
              <h3 className="text-sm font-semibold text-[var(--ixai-forest)]">
                AI Market
              </h3>
              <p className="mt-2 text-sm leading-7 text-[var(--ixai-ink-muted)]">
                {intelligence.aiTechObservation}
              </p>
            </div>
            <div className="rounded-lg border border-[var(--ixai-border)] bg-white/45 p-4">
              <h3 className="text-sm font-semibold text-[var(--ixai-forest)]">
                Crypto
              </h3>
              <p className="mt-2 text-sm leading-7 text-[var(--ixai-ink-muted)]">
                {intelligence.cryptoObservation}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        {brief.riskFocus?.length ? (
          <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.78)]">
            <div className="border-b border-[var(--ixai-border)] px-5 py-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
                風險焦點
              </p>
            </div>
            <ul className="divide-y divide-[var(--ixai-border)]">
              {brief.riskFocus.map((risk) => (
                <li
                  className="px-5 py-4 text-sm leading-7 text-[var(--ixai-forest-soft)]"
                  key={risk}
                >
                  {risk}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {intelligence ? (
          <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.78)]">
            <div className="border-b border-[var(--ixai-border)] px-5 py-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
                What To Monitor
              </p>
            </div>
            <ul className="divide-y divide-[var(--ixai-border)]">
              {intelligence.whatToMonitor.map((item) => (
                <li
                  className="px-5 py-4 text-sm leading-7 text-[var(--ixai-forest-soft)]"
                  key={item}
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.78)]">
        <div className="border-b border-[var(--ixai-border)] px-5 py-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            News Sources Used
          </p>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-[1fr_15rem]">
          <div>
            <div className="flex flex-wrap gap-2">
              {(sourceLabels.length ? sourceLabels : ["IXAI Editorial Fallback"]).map((source) => (
                <span
                  className="rounded-lg border border-[var(--ixai-border)] bg-white/45 px-3 py-1.5 text-xs font-medium text-[var(--ixai-forest-soft)]"
                  key={source}
                >
                  {source}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm leading-7 text-[var(--ixai-ink-muted)]">
              Generated by IXAI Intelligence Layer. 來源摘要僅顯示 provider
              名稱，不顯示 raw RSS URLs 或全文內容。
            </p>
          </div>
          <div className="rounded-lg border border-[var(--ixai-border)] bg-white/45 p-4">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--ixai-ink-muted)]">
              Input News Count
            </p>
            <p className="mt-2 text-2xl font-semibold text-[var(--ixai-forest)]">
              {intelligence?.inputNewsCount ?? 0}
            </p>
          </div>
        </div>
      </section>
    </article>
  );
}
