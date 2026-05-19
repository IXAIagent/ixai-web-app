import { Hero } from "@/components/dashboard/hero";
import { MarketOverview } from "@/components/dashboard/market-overview";
import { ProCta } from "@/components/dashboard/pro-cta";
import { TodaysBrief } from "@/components/dashboard/todays-brief";
import { Watchlist } from "@/components/dashboard/watchlist";
import { WeeklyBriefPreview } from "@/components/dashboard/weekly-brief-preview";
import { proFeatures } from "@/lib/mock-data";
import { getLatestPublishedBrief } from "@/src/lib/editorial/repository";
import { getLatestWeeklyBrief } from "@/src/lib/weeklyBriefs";

export default function Home() {
  const latestDailyBrief = getLatestPublishedBrief();
  const latestWeeklyBrief = getLatestWeeklyBrief();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <Hero />

      <div
        className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]"
        id="markets"
      >
        <TodaysBrief brief={latestDailyBrief} />
        <MarketOverview />
      </div>

      <div
        className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]"
        id="watchlist"
      >
        <Watchlist />
        <div id="weekly-brief">
          <WeeklyBriefPreview brief={latestWeeklyBrief} />
        </div>
      </div>

      <div id="ixai-pro">
        <ProCta features={proFeatures} />
      </div>
    </div>
  );
}
