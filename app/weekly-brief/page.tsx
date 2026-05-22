import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";
import { getAllWeeklyBriefs, getLatestWeeklyBrief } from "@/src/lib/weeklyBriefs";

export const metadata = buildPublicMetadata({
  title: "IXAI Weekly Brief — 每週市場週報",
  description:
    "IXAI Weekly Brief 整理每週市場事件、資產觀察、下週焦點與風險提醒。",
});

export default function WeeklyBriefArchivePage() {
  const latestBrief = getLatestWeeklyBrief();
  const allBriefs = getAllWeeklyBriefs();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-3 py-3 sm:gap-6 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
      <section className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] shadow-[0_18px_56px_rgba(9,41,31,0.14)] sm:p-7 sm:shadow-[0_24px_80px_rgba(9,41,31,0.16)]">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--ixai-gold)]">
          Weekly Brief
        </p>
        <h1 className="mt-2 max-w-3xl text-xl font-semibold leading-7 sm:mt-3 sm:text-4xl sm:leading-snug">
          每週市場週報，整理更完整的市場操作圖。
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/72 sm:mt-4 sm:text-base sm:leading-8">
          以更低頻、結構化的方式回顧重大事件、資產觀察、風險提醒與下週市場焦點。
        </p>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)]">
        <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1fr_16rem] lg:p-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              最新週報 / {latestBrief.publishedAt}
            </p>
            <h2 className="mt-2 max-w-3xl text-xl font-semibold leading-7 text-[var(--ixai-forest)] sm:mt-3 sm:text-2xl sm:leading-8">
              {latestBrief.title}
            </h2>
            <p className="mt-2.5 max-w-3xl text-sm leading-6 text-[var(--ixai-ink-muted)] sm:mt-3 sm:leading-7">
              {latestBrief.executiveSummary}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--ixai-forest-soft)]">
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
            </div>
          </div>
          <div className="flex items-end lg:justify-end">
            <Link
              className="ixai-cta-forest inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2 text-sm font-medium sm:w-fit"
              href={`/weekly-brief/${latestBrief.slug}`}
            >
              閱讀週報
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.74)]">
        <div className="border-b border-[var(--ixai-border)] px-5 py-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            週報封存
          </p>
          <h2 className="mt-1 text-base font-semibold text-[var(--ixai-forest)]">
            歷史週報列表
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
                    {brief.editorialNote}
                  </p>
                  <ul className="mt-3 grid gap-2 text-sm text-[var(--ixai-forest-soft)] sm:grid-cols-2">
                    {brief.majorEvents.slice(0, 2).map((event) => (
                      <li key={event.headline}>{event.headline}</li>
                    ))}
                  </ul>
                </div>
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--ixai-ink-muted)]">
                  Weekly Brief
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
