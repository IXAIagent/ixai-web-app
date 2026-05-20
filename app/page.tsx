import { IntelligenceFeed } from "@/components/dashboard/intelligence-feed";
import { MarketOverview } from "@/components/dashboard/market-overview";
import { MarketPulse } from "@/components/dashboard/market-pulse";
import { ProCta } from "@/components/dashboard/pro-cta";
import { RiskFocus } from "@/components/dashboard/risk-focus";
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
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-4 sm:gap-5 sm:px-5 lg:px-6 lg:py-6">
      <MarketPulse />
      <RiskFocus />

      <div
        className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]"
        id="markets"
      >
        <IntelligenceFeed />
        <Watchlist />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.95fr]">
        <TodaysBrief brief={latestDailyBrief} />
        <MarketOverview />
      </div>

      <div
        className="grid gap-4 xl:grid-cols-[1fr]"
        id="watchlist"
      >
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
