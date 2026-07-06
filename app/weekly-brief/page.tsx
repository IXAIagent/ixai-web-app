import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import { WorkspaceStatusBadge } from "@/components/workspace/product";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";
import { buildWeeklyBrief2SnapshotAsync } from "@/src/lib/editorial/weekly-brief";
import { getAllWeeklyBriefsAsync, getLatestWeeklyBriefAsync } from "@/src/lib/weeklyBriefs";

export const metadata = buildPublicMetadata({
  title: "每週情報 — 市場策略筆記 | IXAI",
  description:
    "IXAI 每週情報整理本週市場變化、下週事件與 AI、利率、台股半導體、Crypto 的市場定價脈絡。",
  keywords: [
    "Weekly Intelligence",
    "IXAI",
    "Market Regime",
    "AI",
    "Fed",
    "Taiwan",
    "Semiconductors",
    "Crypto",
    "Volatility",
    "FCN Education",
  ],
  canonical: "/weekly-brief",
});

export default async function WeeklyBriefArchivePage() {
  const latestBrief = await getLatestWeeklyBriefAsync();
  const allBriefs = await getAllWeeklyBriefsAsync();
  const preview = await buildWeeklyBrief2SnapshotAsync();

  if (!latestBrief) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-3 py-3 sm:gap-6 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
        <section className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] shadow-[0_18px_56px_rgba(9,41,31,0.14)] sm:p-7">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--ixai-gold)]">
            每週情報
          </p>
          <h1 className="mt-2 max-w-3xl text-xl font-semibold leading-7 sm:mt-3 sm:text-4xl sm:leading-snug">
            每週情報尚未發布。
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/72 sm:mt-4 sm:text-base sm:leading-8">
            IXAI Editorial Studio 會先產生週報草稿，再由人工審閱後發布。發布後會顯示於此頁。
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-3 py-3 sm:gap-6 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
      <section className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] shadow-[0_18px_56px_rgba(9,41,31,0.14)] sm:p-7 sm:shadow-[0_24px_80px_rgba(9,41,31,0.16)]">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--ixai-gold)]">
          每週情報
        </p>
        <h1 className="mt-2 max-w-3xl text-xl font-semibold leading-7 sm:mt-3 sm:text-4xl sm:leading-snug">
          每週市場情報，整理一週市場正在反映什麼。
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/72 sm:mt-4 sm:text-base sm:leading-8">
          以更低頻、結構化的方式回顧美股、台股、AI 科技、利率、Crypto 與下週重大事件，
          不是新聞列表，而是市場研究摘要。
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <WorkspaceStatusBadge variant="beta">Beta</WorkspaceStatusBadge>
          <WorkspaceStatusBadge variant={preview.productionMetadata.health.status === "green" ? "green" : preview.productionMetadata.health.status === "red" ? "red" : "yellow"}>
            {preview.productionMetadata.health.status === "green" ? "Green" : preview.productionMetadata.health.status === "red" ? "Red" : "Yellow"}
          </WorkspaceStatusBadge>
          <span className="rounded-full border border-white/12 bg-white/[0.06] px-2.5 py-1 text-xs font-semibold text-white/72">
            Last updated: {preview.generatedAt}
          </span>
        </div>
      </section>

      <section className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[rgba(255,250,240,0.82)] p-5 shadow-[0_18px_56px_rgba(9,41,31,0.08)] sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_18rem]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              Weekly Brief 2.0 Foundation Preview / {preview.weekRange.label}
            </p>
            <h2 className="mt-2 text-xl font-semibold leading-8 text-[var(--ixai-forest)]">
              {preview.title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-ink-muted)]">
              {preview.weeklyReview}
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {preview.nextWeekRadar.slice(0, 3).map((item) => (
                <article
                  className="rounded-lg border border-[rgba(176,141,87,0.22)] bg-white/55 p-4"
                  key={item.focus}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                    Next week radar
                  </p>
                  <h3 className="mt-2 text-sm font-semibold leading-6 text-[var(--ixai-forest)]">
                    {item.focus}
                  </h3>
                  <p className="mt-2 text-xs leading-6 text-[var(--ixai-forest-soft)]">
                    {item.whyItMatters}
                  </p>
                </article>
              ))}
            </div>
          </div>
          <aside className="rounded-lg border border-[rgba(9,41,31,0.1)] bg-white/55 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
            <p className="font-mono uppercase tracking-[0.16em] text-[var(--ixai-gold)]">Beta readiness</p>
            <p className="mt-2 text-sm font-semibold text-[var(--ixai-forest)]">
              {preview.productionMetadata.health.status === "green" ? "Ready for preview" : "Needs editorial review"}
            </p>
            <details className="mt-3 rounded-lg border border-[var(--ixai-border)] bg-white/52 p-3">
              <summary className="cursor-pointer text-xs font-semibold text-[var(--ixai-forest)]">
                Developer diagnostics
              </summary>
            <dl className="mt-3 grid gap-2">
              <div className="flex justify-between gap-3">
                <dt>Themes</dt>
                <dd className="font-semibold text-[var(--ixai-forest)]">
                  {preview.diagnostics.themeCount}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Signals</dt>
                <dd className="font-semibold text-[var(--ixai-forest)]">
                  {preview.diagnostics.signalCount}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Relationships</dt>
                <dd className="font-semibold text-[var(--ixai-forest)]">
                  {preview.diagnostics.relationshipCount}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Narrative confidence</dt>
                <dd className="font-semibold text-[var(--ixai-forest)]">
                  {Math.round(preview.diagnostics.narrativeConfidence * 100)}%
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Provider readiness</dt>
                <dd className="font-semibold text-[var(--ixai-forest)]">
                  {preview.providerDiagnostics.publicationReadiness}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Coverage score</dt>
                <dd className="font-semibold text-[var(--ixai-forest)]">
                  {Math.round(preview.providerDiagnostics.coverage.overall * 100)}%
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Fallback</dt>
                <dd className="font-semibold text-[var(--ixai-forest)]">
                  {preview.providerDiagnostics.fallback.activeSource}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Source mode</dt>
                <dd className="font-semibold text-[var(--ixai-forest)]">
                  {preview.providerDiagnostics.sourceStatus}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Cache</dt>
                <dd className="font-semibold text-[var(--ixai-forest)]">
                  {preview.providerDiagnostics.cacheHit ? "hit" : "miss"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Production health</dt>
                <dd className="font-semibold text-[var(--ixai-forest)]">
                  {preview.productionMetadata.health.status}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Publish guard</dt>
                <dd className="font-semibold text-[var(--ixai-forest)]">
                  {preview.productionMetadata.pipeline.publishQueue.queueState}
                </dd>
              </div>
            </dl>
            </details>
            <p className="mt-3 border-t border-[rgba(9,41,31,0.08)] pt-3">
              {preview.disclaimer}
            </p>
          </aside>
        </div>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)]">
        <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1fr_16rem] lg:p-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              最新每週情報 / {latestBrief.publishedAt}
            </p>
            <h2 className="mt-2 max-w-3xl text-xl font-semibold leading-7 text-[var(--ixai-forest)] sm:mt-3 sm:text-2xl sm:leading-8">
              {latestBrief.title}
            </h2>
            <p className="mt-2.5 max-w-3xl text-sm leading-6 text-[var(--ixai-ink-muted)] sm:mt-3 sm:leading-7">
              {latestBrief.intelligenceSummary.pricing}
            </p>
            <div className="mt-4 grid gap-2 text-xs text-[var(--ixai-forest-soft)] sm:grid-cols-2 xl:grid-cols-3">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--ixai-border)] px-2.5 py-1">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                發布時間：{latestBrief.publishedAt}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--ixai-border)] px-2.5 py-1">
                <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                市場回顧期間：{latestBrief.coveragePeriod}
              </span>
              <span className="rounded-lg border border-[var(--ixai-border)] px-2.5 py-1">
                下週市場焦點：{latestBrief.upcomingPeriod}
              </span>
              <span className="rounded-lg border border-[var(--ixai-border)] px-2.5 py-1">
                本週重點：{latestBrief.marketHighlights.length} 個市場主題
              </span>
            </div>
          </div>
          <div className="flex items-end lg:justify-end">
            <Link
              className="ixai-cta-forest inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2 text-sm font-medium sm:w-fit"
              href={`/weekly-brief/${latestBrief.slug}`}
            >
              閱讀每週情報
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.74)]">
        <div className="border-b border-[var(--ixai-border)] px-5 py-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            每週情報紀錄
          </p>
          <h2 className="mt-1 text-base font-semibold text-[var(--ixai-forest)]">
            歷史每週情報
          </h2>
        </div>
        <div className="divide-y divide-[var(--ixai-border)]">
          {allBriefs.map((brief) => (
            <Link
              className="block px-5 py-4 transition hover:bg-[rgba(9,41,31,0.035)]"
              href={`/weekly-brief/${brief.slug}`}
              key={brief.slug}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="font-mono text-xs text-[var(--ixai-gold)]">
                    {brief.publishedAt}
                  </p>
                  <h3 className="mt-2 text-base font-semibold text-[var(--ixai-forest)]">
                    {brief.title}
                  </h3>
                  <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-ink-muted)]">
                    {brief.intelligenceSummary.riskTone}
                  </p>
                  <ul className="mt-3 grid gap-2 text-sm text-[var(--ixai-forest-soft)] sm:grid-cols-2">
                    {brief.majorEvents.slice(0, 2).map((event) => (
                      <li key={event.headline}>{event.headline}</li>
                    ))}
                  </ul>
                </div>
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--ixai-ink-muted)]">
                  每週情報
                  <ArrowRight className="mt-2 h-4 w-4 lg:ml-auto" aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
