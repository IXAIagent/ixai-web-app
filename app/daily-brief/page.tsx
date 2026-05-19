import Link from "next/link";
import { getAllDailyBriefs, getLatestDailyBrief } from "@/src/lib/dailyBriefs";

export const metadata = {
  title: "每日簡報 | IXAI",
  description: "IXAI Daily Brief 每日市場觀察與市場情報封存。",
};

export default function DailyBriefArchivePage() {
  const latestBrief = getLatestDailyBrief();
  const briefs = getAllDailyBriefs();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <section className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] p-5 text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)] sm:p-7">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--ixai-gold)]">
          Daily Brief
        </p>
        <h1 className="mt-3 max-w-3xl text-2xl font-semibold leading-snug sm:text-4xl">
          今日市場觀察，為每日決策建立清晰開場。
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-white/72">
          以利率、美股、台股、Crypto 與 AI 科技為主軸，整理每日盤前值得閱讀的市場摘要與一玄觀點。
        </p>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)]">
        <div className="grid gap-5 p-5 lg:grid-cols-[1fr_16rem] lg:p-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              最新簡報 / {latestBrief.publishedAt}
            </p>
            <h2 className="mt-3 max-w-3xl text-2xl font-semibold leading-8 text-[var(--ixai-forest)]">
              {latestBrief.title}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--ixai-ink-muted)]">
              {latestBrief.marketSummary}
            </p>
          </div>
          <div className="flex items-end lg:justify-end">
            <Link
              className="inline-flex rounded-lg border border-[var(--ixai-forest)] bg-[var(--ixai-paper)] px-4 py-2 text-sm font-medium text-[var(--ixai-forest)]"
              href={`/daily-brief/${latestBrief.slug}`}
            >
              閱讀最新簡報
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.74)]">
        <div className="border-b border-[var(--ixai-border)] px-5 py-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            簡報封存
          </p>
          <h2 className="mt-1 text-base font-semibold text-[var(--ixai-forest)]">
            歷史每日簡報
          </h2>
        </div>
        <div className="divide-y divide-[var(--ixai-border)]">
          {briefs.map((brief) => (
            <Link
              className="block px-5 py-4 transition hover:bg-[rgba(9,41,31,0.035)]"
              href={`/daily-brief/${brief.slug}`}
              key={brief.slug}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono text-xs text-[var(--ixai-gold)]">
                    {brief.publishedAt}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-[var(--ixai-forest)]">
                    {brief.title}
                  </h3>
                </div>
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--ixai-ink-muted)]">
                  Daily Brief
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
