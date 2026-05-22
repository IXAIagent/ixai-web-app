import Link from "next/link";
import { SectionCard, SectionHeader } from "@/components/dashboard/section-card";
import type { WeeklyBrief } from "@/content/weekly-briefs";
import { ixaiEcosystem } from "@/src/lib/ixai/ecosystem";

export function WeeklyBriefPreview({ brief }: { brief: WeeklyBrief }) {
  return (
    <SectionCard className="overflow-hidden">
      <SectionHeader
        action="閱讀週報"
        eyebrow="每週市場週報"
        title="本週重點情報"
      />
      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1fr_15rem]">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
            {brief.publishedAt}
          </p>
          <h3 className="mt-2.5 max-w-2xl text-lg font-semibold leading-6 text-[var(--ixai-forest)] sm:mt-3 sm:text-xl sm:leading-7">
            {brief.title}
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ixai-ink-muted)]">
            {brief.editorialNote}
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ixai-ink-muted)]">
            {brief.executiveSummary}
          </p>
        </div>

        <div className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(9,41,31,0.035)] p-3.5 sm:p-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--ixai-forest)]">
            觀察期間
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {[brief.coveragePeriod, brief.upcomingPeriod].map((topic) => (
              <span
                className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-paper)] px-2.5 py-1 text-xs text-[var(--ixai-forest-soft)]"
                key={topic}
              >
                {topic}
              </span>
            ))}
          </div>
          <Link
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[var(--ixai-forest)] px-4 py-2 text-sm font-medium text-[var(--ixai-cream)] sm:mt-5"
            href={`/weekly-brief/${brief.slug}`}
          >
            閱讀週報
          </Link>
          <a
            className="mt-2.5 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-[var(--ixai-border)] px-4 py-2 text-sm font-medium text-[var(--ixai-forest)] sm:mt-3"
            href={ixaiEcosystem.proDashboardUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            {ixaiEcosystem.cta.enterPro}
          </a>
        </div>
      </div>
    </SectionCard>
  );
}
