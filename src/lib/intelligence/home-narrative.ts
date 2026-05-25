import "server-only";

import {
  getLatestNewsIntakeResult,
} from "@/src/lib/news/providers";
import {
  buildNarrativeBundle,
} from "@/src/lib/intelligence/narrative-engine";
import {
  getLatestPublishedBriefAsync,
} from "@/src/lib/editorial/repository";
import {
  getLatestPublishedWeeklyDraftAsync,
  getWeeklyGenerationRange,
} from "@/src/lib/editorial/weekly";
import {
  getNextWeekRange,
  selectUpcomingEvents,
} from "@/src/lib/editorial/weekly-calendar";
import type {
  DailyBriefDraft,
  WeeklyIntelligenceDraft,
  WeeklyNarrativeBundle,
  WeeklyUpcomingEvent,
} from "@/src/types/editorial";

// v1.32.2 — Home narrative resolver.
//
// The home page is a server component; this helper centralizes the
// fetch-fallback chain so the Intelligence Hero, pricing list,
// cross-market flow and importance ranking all consume the same bundle.
//
// Preference order:
//   1. Latest published Daily Brief's narrative (freshest market read).
//   2. Latest published Weekly Intelligence draft's narrative.
//   3. Live news intake → buildNarrativeBundle on the fly.
//   4. null source if none of the above produces data; UI renders a
//      friendly fallback rather than empty / undefined cells.
//
// No new providers, no new persistence, no admin / Pro features.

export type HomeNarrativeSource = "daily" | "weekly" | "fresh" | "empty";

export type HomeNarrativeContext = {
  narrative: WeeklyNarrativeBundle | null;
  upcomingEvents: WeeklyUpcomingEvent[];
  source: HomeNarrativeSource;
  dailyBrief: DailyBriefDraft | null;
  weeklyBrief: WeeklyIntelligenceDraft | null;
  generatedAt: string;
};

function safeDailyNarrative(daily: DailyBriefDraft | null) {
  return daily?.intelligence?.narrative ?? null;
}

function safeWeeklyNarrative(weekly: WeeklyIntelligenceDraft | null) {
  return weekly?.sections.narrative ?? null;
}

function safeWeeklyUpcoming(weekly: WeeklyIntelligenceDraft | null): WeeklyUpcomingEvent[] {
  return weekly?.sections.upcomingWeek ?? [];
}

export async function getHomeNarrativeContext(): Promise<HomeNarrativeContext> {
  const [dailyBriefResult, weeklyBriefResult] = await Promise.allSettled([
    getLatestPublishedBriefAsync(),
    getLatestPublishedWeeklyDraftAsync(),
  ]);

  const dailyBrief =
    dailyBriefResult.status === "fulfilled" ? dailyBriefResult.value : null;
  const weeklyBrief =
    weeklyBriefResult.status === "fulfilled" ? weeklyBriefResult.value : null;

  // 1. Prefer the Daily narrative — it is the freshest read of the market.
  const dailyNarrative = safeDailyNarrative(dailyBrief);
  if (dailyNarrative) {
    const upcomingFromWeekly = safeWeeklyUpcoming(weeklyBrief);
    return {
      narrative: dailyNarrative,
      upcomingEvents: upcomingFromWeekly,
      source: "daily",
      dailyBrief,
      weeklyBrief,
      generatedAt: dailyBrief?.intelligence?.generatedAt ?? new Date().toISOString(),
    };
  }

  // 2. Weekly narrative captures the past week + curated upcoming events.
  const weeklyNarrative = safeWeeklyNarrative(weeklyBrief);
  if (weeklyNarrative && weeklyBrief) {
    return {
      narrative: weeklyNarrative,
      upcomingEvents: safeWeeklyUpcoming(weeklyBrief),
      source: "weekly",
      dailyBrief,
      weeklyBrief,
      generatedAt: weeklyBrief.publishedAt ?? weeklyBrief.updatedAt,
    };
  }

  // 3. Build a fresh narrative bundle directly from the news intake. This
  //    is deterministic and uses the existing intake pipeline only — no
  //    new external dependency.
  try {
    const intake = await getLatestNewsIntakeResult();

    if (intake.items.length > 0) {
      const { weekEnd } = getWeeklyGenerationRange();
      const { nextWeekStart, nextWeekEnd } = getNextWeekRange(weekEnd);
      const upcoming = selectUpcomingEvents({ nextWeekStart, nextWeekEnd });

      const narrative = buildNarrativeBundle({
        items: intake.items,
        upcomingEvents: upcoming.map((event) => ({
          date: event.date,
          title: event.title,
          category: event.category,
          whyItMatters: event.whyItMatters,
          relatedAssets: event.relatedAssets,
        })),
        pastTopByCategory: {
          fedMacro: intake.items.find(
            (item) => item.category === "rates" || item.category === "macro",
          ),
          aiSemi: intake.items.find(
            (item) => item.category === "ai_tech" || item.category === "semiconductors",
          ),
          taiwan: intake.items.find((item) => item.category === "taiwan"),
          crypto: intake.items.find((item) => item.category === "crypto"),
          usEquities: intake.items.find((item) => item.category === "equities"),
        },
      });

      return {
        narrative: {
          marketNarrative: narrative.marketNarrative,
          pricingWhat: narrative.pricingWhat,
          riskFocus: narrative.riskFocus,
          crossMarketNarrative: narrative.crossMarketNarrative,
          crossMarketLinks: narrative.crossMarketLinks,
          volatilityNarrative: narrative.volatilityNarrative,
          aiNarrative: narrative.aiNarrative,
          taiwanNarrative: narrative.taiwanNarrative,
          intelligenceTakeaway: narrative.intelligenceTakeaway,
          regime: {
            regime: narrative.regime.regime,
            aiMomentum: narrative.regime.aiMomentum,
            macroPressure: narrative.regime.macroPressure,
            volatilityState: narrative.regime.volatilityState,
          },
          importanceRanking: narrative.importanceRanking,
        },
        upcomingEvents: upcoming.map((event) => ({
          date: event.date,
          title: event.title,
          category: event.category,
          whyItMatters: event.whyItMatters,
          relatedAssets: event.relatedAssets,
          marketImpact: event.marketImpact,
        })),
        source: "fresh",
        dailyBrief,
        weeklyBrief,
        generatedAt: new Date().toISOString(),
      };
    }
  } catch {
    // intentional swallow — fall through to "empty" context.
  }

  return {
    narrative: null,
    upcomingEvents: [],
    source: "empty",
    dailyBrief,
    weeklyBrief,
    generatedAt: new Date().toISOString(),
  };
}
