import { DailyBriefUnifiedArchive } from "@/components/daily-brief/daily-brief-unified-archive";
import { PushPermissionCard } from "@/components/pwa/push-permission-card";
import { WatchlistTeaser } from "@/components/watchlist/watchlist-teaser";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";
import { getAllDailyBriefs } from "@/src/lib/dailyBriefs";

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

export default function DailyBriefArchivePage() {
  const fallbackBriefs = getAllDailyBriefs();

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
      </section>

      <WatchlistTeaser />

      <PushPermissionCard compact />

      <DailyBriefUnifiedArchive fallbackBriefs={fallbackBriefs} />
    </div>
  );
}
