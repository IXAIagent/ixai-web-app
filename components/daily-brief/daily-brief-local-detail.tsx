"use client";

import Link from "next/link";
import { AlertTriangle, ListChecks, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { IntelligenceCta } from "@/components/distribution/intelligence-cta";
import { NarrativeIntelligence } from "@/components/intelligence/narrative-intelligence";
import { PublicIntelligenceCta } from "@/components/intelligence/public-intelligence-cta";
import { ProUpgradeCard } from "@/components/pro/pro-upgrade-card";
import { ixaiSiteUrl } from "@/src/lib/brand/metadata";
import { buildDailyShareCopy } from "@/src/lib/share/share-copy";
import type { DailyBriefDraft } from "@/src/types/editorial";

const categoryLabels: Record<string, string> = {
  today_signal: "今日一句話",
  top_three_things: "今日三大重點",
  market_interpretation: "Market Interpretation",
  what_changed: "What Changed",
  continuity_tags: "Continuity Tags",
  investor_watchpoints: "Investor Watchpoints",
  executive_summary: "Executive Summary",
  macro_watch: "Macro Watch",
  ai_tech_watch: "AI / Tech Watch",
  crypto_watch: "Crypto Watch",
  risk_regime: "Risk Regime",
  fcn_awareness: "FCN Awareness",
  ixuan_view: "I-Xuan View",
  us_market: "美股",
  taiwan_market: "台股",
  crypto: "Crypto",
  rates: "利率",
  ai_market: "AI 科技",
};

const featureSectionOrder = new Set([
  "today_signal",
  "top_three_things",
  "market_interpretation",
  "what_changed",
  "continuity_tags",
  "investor_watchpoints",
  "executive_summary",
  "risk_regime",
  "fcn_awareness",
  "ixuan_view",
]);

function isPublicSection(category: string) {
  return !featureSectionOrder.has(category);
}

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

  if (!loaded) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          每日晨報
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
          每日晨報
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
          每日晨報 / {brief.publishedAt}
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-white/70">
          <span className="rounded-lg border border-white/12 px-2.5 py-1">
            公開市場情報
          </span>
          <span className="rounded-lg border border-white/12 px-2.5 py-1">
            一般市場觀察
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

      {intelligence?.todaySignal ? (
        <section className="rounded-lg border border-[rgba(176,141,87,0.36)] bg-[rgba(176,141,87,0.09)] p-5 sm:p-6">
          <div className="flex items-center gap-2 text-[var(--ixai-gold)]">
            <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em]">
              今日一句話
            </p>
          </div>
          <p className="mt-3 text-xl font-semibold leading-9 text-[var(--ixai-forest)] sm:text-2xl sm:leading-10">
            {intelligence.todaySignal}
          </p>
        </section>
      ) : null}

      {intelligence?.topThreeThings?.length ? (
        <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)] p-5 sm:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            今日最重要的三件事
          </p>
          <div className="mt-4 grid gap-4">
            {intelligence.topThreeThings.slice(0, 3).map((item, index) => (
              <article
                className="rounded-lg border border-[rgba(176,141,87,0.22)] bg-white/55 p-4"
                key={`${item.headline}-${index}`}
              >
                <p className="font-mono text-xs font-semibold text-[var(--ixai-gold)]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-1 text-lg font-semibold leading-7 text-[var(--ixai-forest)]">
                  {item.headline}
                </h2>
                <div className="mt-3 grid gap-2 text-sm leading-7 text-[var(--ixai-forest-soft)] md:grid-cols-3">
                  <p>
                    <span className="font-semibold text-[var(--ixai-forest)]">發生什麼：</span>
                    {item.whatHappened}
                  </p>
                  <p>
                    <span className="font-semibold text-[var(--ixai-forest)]">為何重要：</span>
                    {item.whyItMatters}
                  </p>
                  <p>
                    <span className="font-semibold text-[var(--ixai-forest)]">觀察重點：</span>
                    {item.watchpoint}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {(intelligence?.whatChangedSinceLastBrief || intelligence?.continuityTags?.length) ? (
        <section className="rounded-lg border border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.88)] p-5 sm:p-6">
          <div className="flex items-center gap-2 text-[var(--ixai-gold)]">
            <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em]">
              Market Memory
            </p>
          </div>
          <h2 className="mt-2 text-xl font-semibold leading-7 text-[var(--ixai-forest)]">
            What Changed Since Last Brief
          </h2>
          {intelligence.whatChangedSinceLastBrief ? (
            <p className="mt-3 text-base leading-8 text-[var(--ixai-forest-soft)]">
              {intelligence.whatChangedSinceLastBrief}
            </p>
          ) : null}
          {intelligence.continuityTags?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {intelligence.continuityTags.slice(0, 5).map((tag) => (
                <span
                  className="rounded-md border border-[rgba(176,141,87,0.28)] bg-[rgba(176,141,87,0.1)] px-2.5 py-1 text-xs font-medium text-[var(--ixai-forest)]"
                  key={tag}
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {(intelligence?.marketInterpretation || intelligence?.investorWatchpoints?.length) ? (
        <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          {intelligence?.marketInterpretation ? (
            <article className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.82)] p-5 sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
                Market Interpretation
              </p>
              <p className="mt-3 text-base leading-8 text-[var(--ixai-forest-soft)]">
                {intelligence.marketInterpretation}
              </p>
            </article>
          ) : null}
          {intelligence?.investorWatchpoints?.length ? (
            <article className="rounded-lg border border-[rgba(9,41,31,0.14)] bg-[rgba(9,41,31,0.045)] p-5 sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
                Investor Watchpoints
              </p>
              <ul className="mt-3 grid gap-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                {intelligence.investorWatchpoints.slice(0, 6).map((item) => (
                  <li className="flex gap-2" key={item}>
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ixai-gold)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ) : null}
        </section>
      ) : null}

      {intelligence?.executiveSummary?.length ? (
        <section className="rounded-lg border border-[rgba(176,141,87,0.34)] bg-[rgba(255,250,240,0.9)] p-5 shadow-[0_18px_44px_rgba(9,41,31,0.06)] sm:p-6">
          <div className="flex items-center gap-2 text-[var(--ixai-gold)]">
            <ListChecks className="h-4 w-4 shrink-0" aria-hidden="true" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em]">
              Executive Summary
            </p>
          </div>
          <h2 className="mt-2 text-xl font-semibold leading-7 text-[var(--ixai-forest)]">
            今日最重要的五件事
          </h2>
          <ol className="mt-4 grid gap-3">
            {intelligence.executiveSummary.slice(0, 5).map((item, index) => (
              <li
                className="grid gap-3 rounded-lg border border-[var(--ixai-border)] bg-white/55 p-3.5 text-sm leading-7 text-[var(--ixai-forest-soft)] sm:grid-cols-[2.5rem_1fr] sm:items-start sm:p-4"
                key={`${index}-${item}`}
              >
                <span className="font-mono text-lg font-semibold leading-7 text-[var(--ixai-gold)]">
                  {["①", "②", "③", "④", "⑤"][index]}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {intelligence?.riskRegimeReasoning ? (
        <section className="rounded-lg border border-[#9f5530]/24 bg-[#9f5530]/[0.08] p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[#6f351f]">
                <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em]">
                  Risk Regime
                </p>
              </div>
              <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
                Current Risk Regime：{intelligence.riskRegimeReasoning.current}
              </h2>
            </div>
            <span className="w-fit rounded-md border border-[#9f5530]/24 bg-white/45 px-3 py-1.5 font-mono text-xs font-semibold text-[#6f351f]">
              Public risk context
            </span>
          </div>
          <ol className="mt-4 grid gap-3">
            {intelligence.riskRegimeReasoning.reasons.slice(0, 3).map((reason, index) => (
              <li
                className="rounded-lg border border-[#9f5530]/18 bg-white/45 p-3.5 text-sm leading-7 text-[#5f2e1c]"
                key={`${index}-${reason}`}
              >
                <span className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[#8b4528]">
                  Reason {index + 1}
                </span>
                <span className="mt-1 block">{reason}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {intelligence?.fcnAwareness || brief.editorialNote ? (
        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          {intelligence?.fcnAwareness ? (
            <article className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.84)] p-5 sm:p-6">
              <div className="flex items-center gap-2 text-[var(--ixai-gold)]">
                <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em]">
                  FCN Awareness
                </p>
              </div>
              <h2 className="mt-2 text-lg font-semibold text-[var(--ixai-forest)]">
                {intelligence.fcnAwareness.topic}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                {intelligence.fcnAwareness.explanation}
              </p>
              <p className="mt-3 rounded-lg border border-[rgba(176,141,87,0.24)] bg-[rgba(176,141,87,0.08)] p-3.5 text-xs leading-6 text-[var(--ixai-ink-muted)]">
                {intelligence.fcnAwareness.reminder}
              </p>
            </article>
          ) : null}

          {brief.editorialNote ? (
            <article className="rounded-lg border border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.08)] p-5 sm:p-6">
              <div className="flex items-center gap-2 text-[var(--ixai-gold)]">
                <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em]">
                  I-Xuan View / 一玄觀點
                </p>
              </div>
              <p className="mt-3 text-base leading-8 text-[var(--ixai-forest-soft)]">
                {brief.editorialNote}
              </p>
            </article>
          ) : null}
        </section>
      ) : null}

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.8)]">
        <div className="border-b border-[var(--ixai-border)] px-5 py-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Daily Intelligence Sections
          </p>
          <h2 className="mt-1 text-base font-semibold text-[var(--ixai-forest)]">
            Macro、AI / Tech、Crypto 與台灣市場脈絡
          </h2>
        </div>
        <div className="divide-y divide-[var(--ixai-border)]">
          {brief.sections.filter((section) => isPublicSection(section.category)).map((section) => (
            <details
              open
              className="grid gap-4 px-5 py-5 md:grid-cols-[11rem_1fr]"
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
            Public Intelligence Boundary
          </p>
        </div>
        <p className="p-5 text-sm leading-7 text-[var(--ixai-ink-muted)]">
          本簡報由 IXAI 根據公開新聞標題、摘要與市場資料整理，並需經人工審閱。內容用於市場資訊、
          教育分享與風險 awareness，不構成個人化投資建議、買賣指令、報酬承諾或個人 FCN 風險結論。
        </p>
      </section>

      <ProUpgradeCard feature="premium_daily" surface="daily_slug_bottom" />

      {/* v1.64.1 — Public Intelligence Engine block removed from Daily local
          detail per the placement rule: homepage only. */}

      <PublicIntelligenceCta surface="daily_slug_bottom" />
    </article>
  );
}
