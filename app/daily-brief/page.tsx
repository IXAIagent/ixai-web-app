import { DailyBriefUnifiedArchive } from "@/components/daily-brief/daily-brief-unified-archive";
import { WorkspaceStatusBadge } from "@/components/workspace/product";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";
import { getAllDailyBriefs } from "@/src/lib/dailyBriefs";
import { buildDailyBrief2SnapshotAsync } from "@/src/lib/editorial/daily-brief";

export const metadata = buildPublicMetadata({
  title: "每日晨報 — 市場情報 | IXAI",
  description:
    "IXAI 每日晨報整理利率、AI、台灣半導體、Crypto 與波動風險，提供每日市場情報。",
  keywords: [
    "Daily Brief",
    "IXAI",
    "AI",
    "Fed",
    "Taiwan",
    "Crypto",
    "Volatility",
    "Market Regime",
    "Intelligence",
  ],
  canonical: "/daily-brief",
});

export default async function DailyBriefArchivePage() {
  const fallbackBriefs = getAllDailyBriefs();
  const preview = await buildDailyBrief2SnapshotAsync();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-3 py-3 sm:gap-6 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
      <section className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] shadow-[0_18px_56px_rgba(9,41,31,0.14)] sm:p-7 sm:shadow-[0_24px_80px_rgba(9,41,31,0.16)]">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--ixai-gold)]">
          每日晨報
        </p>
        <h1 className="mt-2 max-w-3xl text-xl font-semibold leading-7 sm:mt-3 sm:text-4xl sm:leading-snug">
          今日市場觀察，為每日決策建立清晰開場。
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/72 sm:mt-4 sm:text-base sm:leading-8">
          以利率、美股、台股、Crypto 與 AI 科技為主軸，整理每日盤前值得閱讀的市場情報與一玄觀點。
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
              Daily Brief 2.0 Foundation Preview
            </p>
            <h2 className="mt-2 text-xl font-semibold leading-8 text-[var(--ixai-forest)]">
              {preview.title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-ink-muted)]">
              {preview.subtitle}
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {preview.todayFocus.map((item) => (
                <article
                  className="rounded-lg border border-[rgba(176,141,87,0.22)] bg-white/55 p-4"
                  key={item.title}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                    {item.relatedTopic}
                  </p>
                  <h3 className="mt-2 text-sm font-semibold leading-6 text-[var(--ixai-forest)]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-6 text-[var(--ixai-forest-soft)]">
                    {item.summary}
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
                <dt>Sources</dt>
                <dd className="font-semibold text-[var(--ixai-forest)]">
                  {preview.sourceCoverage.sourceCount}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Ranked stories</dt>
                <dd className="font-semibold text-[var(--ixai-forest)]">
                  {preview.sourceCoverage.rankedStoryCount}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Topics</dt>
                <dd className="font-semibold text-[var(--ixai-forest)]">
                  {preview.sourceCoverage.topicCount}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>AI dependency</dt>
                <dd className="font-semibold text-[var(--ixai-forest)]">
                  {preview.diagnostics.aiDependencyStatus}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Themes</dt>
                <dd className="font-semibold text-[var(--ixai-forest)]">
                  {preview.intelligence.diagnostics.themeCount}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Signals</dt>
                <dd className="font-semibold text-[var(--ixai-forest)]">
                  {preview.intelligence.diagnostics.signalCount}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Narrative confidence</dt>
                <dd className="font-semibold text-[var(--ixai-forest)]">
                  {Math.round(preview.intelligence.confidence.narrativeConfidence * 100)}%
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
                <dt>Quality score</dt>
                <dd className="font-semibold text-[var(--ixai-forest)]">
                  {Math.round(preview.providerDiagnostics.quality.overall * 100)}%
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Source mode</dt>
                <dd className="font-semibold text-[var(--ixai-forest)]">
                  {preview.providerDiagnostics.sourceStatus}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Fallback level</dt>
                <dd className="font-semibold text-[var(--ixai-forest)]">
                  {preview.providerDiagnostics.fallbackLevel}
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

      <DailyBriefUnifiedArchive fallbackBriefs={fallbackBriefs} />
    </div>
  );
}
