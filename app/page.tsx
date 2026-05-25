import { IntelligenceFeed } from "@/components/dashboard/intelligence-feed";
import { LaunchIntro } from "@/components/dashboard/launch-intro";
import { MarketOverview } from "@/components/dashboard/market-overview";
import { MarketPulse } from "@/components/dashboard/market-pulse";
import { RiskFocus } from "@/components/dashboard/risk-focus";
import { TodaysBrief } from "@/components/dashboard/todays-brief";
import { Watchlist } from "@/components/dashboard/watchlist";
import { WeeklyBriefPreview } from "@/components/dashboard/weekly-brief-preview";
import { ProEngineSurface } from "@/components/engines/pro-engine-surface";
import { BriefGateway } from "@/components/home/brief-gateway";
import { CrossMarketFlow } from "@/components/home/cross-market-flow";
import { FcnGateway } from "@/components/home/fcn-gateway";
import { ImportantEvents } from "@/components/home/important-events";
import { IntelligenceHero } from "@/components/home/intelligence-hero";
import { PricingWhat } from "@/components/home/pricing-what";
import { ProGuardrail } from "@/components/home/pro-guardrail";
import { FirstVisitBanner } from "@/components/onboarding/first-visit-banner";
import { OnboardingCard } from "@/components/onboarding/onboarding-card";
import { ShareActions } from "@/components/share/share-actions";
import { SectionDivider } from "@/components/ui/section-divider";
import { buildPublicMetadata, ixaiSiteUrl } from "@/src/lib/brand/metadata";
import { buildHomeShareCopy } from "@/src/lib/share/share-copy";
import { getLatestPublishedBriefAsync } from "@/src/lib/editorial/repository";
import { getFcnPortfolioSnapshot } from "@/src/lib/fcn/engine";
import { getHomeNarrativeContext } from "@/src/lib/intelligence/home-narrative";
import { getLatestWeeklyBrief } from "@/src/lib/weeklyBriefs";

export const dynamic = "force-dynamic";

export const metadata = buildPublicMetadata({
  title: "IXAI — AI Wealth Intelligence OS",
  description:
    "Daily and weekly market intelligence covering AI, macro, Taiwan semiconductors, crypto, and volatility regime.",
  keywords: [
    "IXAI",
    "AI Wealth Intelligence",
    "Daily Brief",
    "Weekly Intelligence",
    "Market Regime",
    "Fed",
    "Taiwan AI",
    "Semiconductors",
    "FCN Education",
    "Risk-first Investing",
  ],
  canonical: "/",
});

function getNarrativeSourceLabel(source: string): string {
  switch (source) {
    case "daily":
      return "Daily Intelligence · Live";
    case "weekly":
      return "Weekly Intelligence · Live";
    case "fresh":
      return "Live Intake · Editorial";
    default:
      return "IXAI Editorial";
  }
}

export default async function Home() {
  const [narrativeContext, fcnSnapshot, latestWeeklyBrief, latestDailyBrief] = await Promise.all([
    getHomeNarrativeContext(),
    getFcnPortfolioSnapshot(),
    Promise.resolve(getLatestWeeklyBrief()),
    getLatestPublishedBriefAsync(),
  ]);

  const sourceLabel = getNarrativeSourceLabel(narrativeContext.source);
  const weeklyForGateway = narrativeContext.weeklyBrief;
  const homeShareCopy = buildHomeShareCopy(ixaiSiteUrl);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-6 sm:px-5 sm:py-4 lg:px-6 lg:py-6">
      {/* v1.32.2 — Intelligence Dashboard above the legacy tiers. The first
          screen now communicates regime + narrative + cross-market context
          before any individual data widget. */}
      <IntelligenceHero
        narrative={narrativeContext.narrative}
        sourceLabel={sourceLabel}
      />

      {/* v1.33 — Share row directly under the hero so the regime read can
          be redistributed in one tap. */}
      <section className="rounded-2xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              Share Intelligence
            </p>
            <p className="mt-1.5 text-sm leading-6 text-[var(--ixai-forest-soft)]">
              一鍵把今日 IXAI 市場 regime 分享給你的網絡。
            </p>
          </div>
          <ShareActions copy={homeShareCopy} surface="home" />
        </div>
      </section>

      {/* v1.29.5 — first-visit welcome banner. Dismissible, localStorage
          marker ixai_onboarding_seen_v1, never shown twice. */}
      <FirstVisitBanner />

      <PricingWhat narrative={narrativeContext.narrative} />

      <CrossMarketFlow narrative={narrativeContext.narrative} />

      <ImportantEvents
        narrative={narrativeContext.narrative}
        upcomingEvents={narrativeContext.upcomingEvents}
      />

      <BriefGateway
        dailyTitle={latestDailyBrief.title}
        dailyExcerpt={latestDailyBrief.marketSummary}
        weeklyTitle={weeklyForGateway?.title}
        weeklyExcerpt={
          weeklyForGateway?.summary ?? weeklyForGateway?.sections.intelligenceSummary.pricing
        }
        weeklySlug={weeklyForGateway?.slug}
      />

      {/* Legacy v1.7 tiers retained below the Intelligence Dashboard so the
          existing market widgets stay reachable. The new top of the page
          owns the narrative framing. */}
      <SectionDivider label="今日市場觀察" hint="Today's read" />
      <RiskFocus />
      <MarketPulse />
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-[0.92fr_1.08fr]">
        <LaunchIntro />
        <OnboardingCard />
      </div>

      <SectionDivider label="免費情報" hint="Daily intelligence" />
      <div
        className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]"
        id="markets"
      >
        <IntelligenceFeed />
        <TodaysBrief brief={latestDailyBrief} />
      </div>

      <SectionDivider label="個人監控" hint="Your watchlist" />
      <div
        className="grid gap-4 xl:grid-cols-[1fr]"
        id="watchlist"
      >
        <Watchlist />
      </div>

      <SectionDivider label="個人情報引擎" hint="Your IXAI Intelligence" />
      <ProEngineSurface fcnSnapshot={fcnSnapshot} />

      <SectionDivider label="本週深度" hint="This week" />
      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.95fr]">
        <div id="weekly-brief">
          <WeeklyBriefPreview brief={latestWeeklyBrief} />
        </div>
        <MarketOverview />
      </div>

      <SectionDivider label="FCN Education" hint="Risk-first" />
      <FcnGateway />

      <SectionDivider label="IXAI Pro" hint="Personalization" variant="premium" />
      <div id="ixai-pro">
        <ProGuardrail />
      </div>
    </div>
  );
}
