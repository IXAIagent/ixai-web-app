import { DailyBriefUnifiedArchive } from "@/components/daily-brief/daily-brief-unified-archive";
import { getAllDailyBriefs } from "@/src/lib/dailyBriefs";

export const metadata = {
  title: "每日簡報 | IXAI",
  description: "IXAI Daily Brief 每日市場觀察與市場情報封存。",
};

export default function DailyBriefArchivePage() {
  const fallbackBriefs = getAllDailyBriefs();

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

      <DailyBriefUnifiedArchive fallbackBriefs={fallbackBriefs} />
    </div>
  );
}
