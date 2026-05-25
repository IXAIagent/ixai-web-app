import Link from "next/link";
import { ArrowUpRight, CalendarDays, FileText, Newspaper } from "lucide-react";

// v1.32.2 — Daily / Weekly intelligence gateway. Two parallel CTA cards
// so the home page makes the two primary intelligence surfaces obvious.

export function BriefGateway({
  dailyTitle,
  dailyExcerpt,
  weeklyTitle,
  weeklyExcerpt,
  weeklySlug,
}: {
  dailyTitle?: string;
  dailyExcerpt?: string;
  weeklyTitle?: string;
  weeklyExcerpt?: string;
  weeklySlug?: string;
}) {
  return (
    <section className="grid gap-3 sm:gap-4 lg:grid-cols-2">
      <article className="rounded-2xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)] p-4 shadow-[0_14px_38px_rgba(9,41,31,0.045)] sm:p-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.13)] text-[var(--ixai-gold)]">
            <FileText className="h-4 w-4" aria-hidden="true" />
          </span>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Daily Brief
          </p>
        </div>
        <h2 className="mt-3 text-lg font-semibold leading-7 text-[var(--ixai-forest)] sm:text-xl">
          {dailyTitle ?? "今日市場觀察 — 為每日決策建立清晰開場。"}
        </h2>
        <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
          {dailyExcerpt ??
            "以利率、美股、台股、Crypto 與 AI 科技為主軸，整理每日盤前值得閱讀的市場摘要與一玄觀點。"}
        </p>
        <Link
          className="ixai-cta-forest mt-4 inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2 text-sm font-semibold"
          href="/daily-brief"
        >
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          閱讀 Daily Brief
        </Link>
      </article>

      <article className="rounded-2xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)] p-4 shadow-[0_14px_38px_rgba(9,41,31,0.045)] sm:p-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.13)] text-[var(--ixai-gold)]">
            <Newspaper className="h-4 w-4" aria-hidden="true" />
          </span>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Weekly Intelligence
          </p>
        </div>
        <h2 className="mt-3 text-lg font-semibold leading-7 text-[var(--ixai-forest)] sm:text-xl">
          {weeklyTitle ?? "每週市場 Intelligence — 過去一週與下週觀察。"}
        </h2>
        <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
          {weeklyExcerpt ??
            "以更低頻、結構化的方式回顧美股、台股、AI 科技、利率、Crypto 與下週重大事件。"}
        </p>
        <Link
          className="ixai-cta-forest mt-4 inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2 text-sm font-semibold"
          href={weeklySlug ? `/weekly-brief/${weeklySlug}` : "/weekly-brief"}
        >
          閱讀 Weekly Intelligence
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </article>
    </section>
  );
}
