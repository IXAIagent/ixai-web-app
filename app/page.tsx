import { IntelligenceFeed } from "@/components/dashboard/intelligence-feed";
import { MarketOverview } from "@/components/dashboard/market-overview";
import { MarketPulse } from "@/components/dashboard/market-pulse";
import { ProCta } from "@/components/dashboard/pro-cta";
import { RiskFocus } from "@/components/dashboard/risk-focus";
import { TodaysBrief } from "@/components/dashboard/todays-brief";
import { Watchlist } from "@/components/dashboard/watchlist";
import { WeeklyBriefPreview } from "@/components/dashboard/weekly-brief-preview";
import { SectionDivider } from "@/components/ui/section-divider";
import { proFeatures } from "@/lib/mock-data";
import { getLatestPublishedBrief } from "@/src/lib/editorial/repository";
import { getLatestWeeklyBrief } from "@/src/lib/weeklyBriefs";

export default function Home() {
  const latestDailyBrief = getLatestPublishedBrief();
  const latestWeeklyBrief = getLatestWeeklyBrief();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-3 py-4 sm:gap-6 sm:px-5 lg:px-6 lg:py-6">
      {/* v1.7: five-tier daily intelligence workflow.
          Tier 1 — Today's headline (insight first, data second)
          Tier 2 — Free intelligence (curated + editorial morning note)
          Tier 3 — Personal monitoring (with soft Pro seeding)
          Tier 4 — This week (deeper editorial + reference data)
          Tier 5 — Premium membership */}

      {/* Tier 1: insight headline first, market data immediately below. */}
      <RiskFocus />
      <MarketPulse />

      {/* Tier 2: free intelligence layer. */}
      <SectionDivider label="免費情報" hint="Daily intelligence" />
      <div
        className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]"
        id="markets"
      >
        <IntelligenceFeed />
        <TodaysBrief brief={latestDailyBrief} />
      </div>

      {/* Tier 3: personal monitoring layer — Watchlist gets its own band so
          it visually reads as MY monitoring, not as another piece of free
          content. The Pro hint inside Watchlist seeds conversion here. */}
      <SectionDivider label="個人監控" hint="Your watchlist" />
      <div
        className="grid gap-4 xl:grid-cols-[1fr]"
        id="watchlist"
      >
        <Watchlist />
      </div>

      {/* Tier 4: this-week depth + reference data. */}
      <SectionDivider label="本週深度" hint="This week" />
      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.95fr]">
        <div id="weekly-brief">
          <WeeklyBriefPreview brief={latestWeeklyBrief} />
        </div>
        <MarketOverview />
      </div>

      {/* Tier 5: premium funnel. Stronger divider variant marks the leap
          from free workflow to IXAI Pro. */}
      <SectionDivider label="IXAI Pro" hint="Membership" variant="premium" />
      <div id="ixai-pro">
        <ProCta features={proFeatures} />
      </div>
    </div>
  );
}
