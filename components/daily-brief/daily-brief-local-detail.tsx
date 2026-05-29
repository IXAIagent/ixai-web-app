"use client";

import Link from "next/link";
import { AlertTriangle, ListChecks } from "lucide-react";
import { useEffect, useState } from "react";
import { IntelligenceCta } from "@/components/distribution/intelligence-cta";
import { NarrativeIntelligence } from "@/components/intelligence/narrative-intelligence";
import { PublicIntelligenceCta } from "@/components/intelligence/public-intelligence-cta";
import { PublicIntelligenceEngine } from "@/components/intelligence/public-intelligence-engine";
import { ProUpgradeCard } from "@/components/pro/pro-upgrade-card";
import { ixaiSiteUrl } from "@/src/lib/brand/metadata";
import { buildDailyShareCopy } from "@/src/lib/share/share-copy";
import type { DailyBriefDraft } from "@/src/types/editorial";

const categoryLabels: Record<string, string> = {
  us_market: "美股",
  taiwan_market: "台股",
  crypto: "Crypto",
  rates: "利率",
  ai_market: "AI 科技",
};

export function DailyBriefLocalDetail({ slug }: { slug: string }) {
  const [brief, setBrief] = useState<DailyBriefDraft | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadBrief() {
      const response = await fetch(`/api/daily-briefs?slug=${encodeURIComponent(slug)}`, {
        cache: "no-store",
      }).catch(() => null);
      const payload = response?.ok
        ? ((await response.json()) as { brief?: DailyBriefDraft | null })
        : null;

      if (!ignore) {
        setBrief(payload?.brief ?? null);
        setLoaded(true);
      }
    }

    void loadBrief();

    return () => {
      ignore = true;
    };
  }, [slug]);
  const intelligence = brief?.intelligence;
  const sourceLabels = intelligence?.sourceLabels ?? [];

  if (!loaded) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          Daily Brief
        </p>
        <h1 className="text-2xl font-semibold text-[var(--ixai-forest)]">
          正在讀取每日簡報。
        </h1>
      </div>
    );
  }

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
        <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-white/70">
          <span className="rounded-lg border border-white/12 px-2.5 py-1">
            Public Intelligence
          </span>
          <span className="rounded-lg border border-white/12 px-2.5 py-1">
            General Market Awareness
          </span>
        </div>
        <h1 className="mt-3 max-w-3xl text-2xl font-semibold leading-snug sm:text-4xl">
          {brief.title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-[rgba(245,240,230,0.72)]">
          {brief.marketSummary}
        </p>
      </section>

      <IntelligenceCta
        enableLine
        enableShare
        shareCopy={buildDailyShareCopy({
          publishedAt: brief.publishedAt,
          narrative: intelligence?.narrative ?? null,
          url: `${ixaiSiteUrl}/daily-brief/${slug}`,
        })}
        shareSurface="daily"
        surface="daily-slug-top"
        variant="compact"
      />

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
            一玄編輯審閱後發布
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

      {intelligence?.narrative ? (
        <NarrativeIntelligence
          eyebrow="Daily Narrative Intelligence"
          narrative={intelligence.narrative}
        />
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
          <section className="rounded-lg border border-[#9f5530]/24 bg-[#9f5530]/[0.08]">
            <div className="border-b border-[var(--ixai-border)] px-5 py-4">
              <div className="flex items-center gap-2 text-[#6f351f]">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em]">
                  風險焦點
                </p>
              </div>
              <p className="mt-2 text-xs leading-6 text-[var(--ixai-ink-muted)]">
                今日較需要警覺的下行風險、波動來源與市場壓力點。
              </p>
            </div>
            <ul className="divide-y divide-[var(--ixai-border)]">
              {brief.riskFocus.map((risk) => (
                <li
                  className="px-5 py-4 text-sm leading-7 text-[#5f2e1c]"
                  key={risk}
                >
                  {risk}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {intelligence ? (
          <section className="rounded-lg border border-[rgba(9,41,31,0.16)] bg-[rgba(9,41,31,0.045)]">
            <div className="border-b border-[var(--ixai-border)] px-5 py-4">
              <div className="flex items-center gap-2 text-[var(--ixai-forest)]">
                <ListChecks className="h-4 w-4" aria-hidden="true" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em]">
                  What To Monitor
                </p>
              </div>
              <p className="mt-2 text-xs leading-6 text-[var(--ixai-ink-muted)]">
                接下來需要追蹤的訊號、日期與確認條件，作為後續市場觀察清單。
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
              {(sourceLabels.length ? sourceLabels : ["IXAI 編輯備援"]).map((source) => (
                <span
                  className="rounded-lg border border-[var(--ixai-border)] bg-white/45 px-3 py-1.5 text-xs font-medium text-[var(--ixai-forest-soft)]"
                  key={source}
                >
                  {source}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm leading-7 text-[var(--ixai-ink-muted)]">
              本簡報由 IXAI 根據公開新聞標題、摘要與市場資料整理，並需經人工審閱。
              來源摘要僅顯示來源名稱，不顯示 RSS URL 或全文內容。
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

      <ProUpgradeCard feature="premium_daily" surface="daily_slug_bottom" />

      <PublicIntelligenceEngine density="compact" surface="daily_slug" />

      <PublicIntelligenceCta surface="daily_slug_bottom" />
    </article>
  );
}
