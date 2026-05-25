import { weeklyBrief20260517 } from "@/content/weekly-briefs/2026-05-17-weekly-brief";

export type WeeklyBriefMajorEvent = {
  category: string;
  headline: string;
  summary: string;
  ixuanView: string;
};

export type WeeklyBriefAssetObservation = {
  label: string;
  text: string;
};

export type WeeklyBriefMarketHighlight = {
  label: string;
  headline: string;
  summary: string;
  ixaiView: string;
};

export type WeeklyBriefUpcomingFocus = {
  date: string;
  event: string;
  whyItMatters: string;
  marketImpact: string;
  // v1.31 — optional fields produced by the curated upcoming calendar.
  category?:
    | "fed_rates"
    | "macro_data"
    | "us_earnings"
    | "taiwan_event"
    | "crypto_event"
    | "geopolitics";
  relatedAssets?: string[];
};

export type WeeklyBriefIntelligenceSummary = {
  pricing: string;
  riskTone: string;
  whatChanged: string;
};

export type WeeklyBriefFcnObservation = {
  volatility: string;
  aiBasket: string;
  worstOf: string;
  sentiment: string;
};

export type WeeklyBriefCta = {
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
};

export type WeeklyBriefSource = {
  label: string;
  type:
    | "official_data"
    | "earnings_calendar"
    | "market_news"
    | "crypto_market"
    | "company_ir"
    | "editorial_review";
  url?: string;
  note?: string;
};

export type WeeklyBrief = {
  slug: string;
  title: string;
  date: string;
  publishedAt: string;
  coveragePeriod: string;
  upcomingPeriod: string;
  editorialNote: string;
  executiveSummary: string;
  marketHighlights: WeeklyBriefMarketHighlight[];
  intelligenceSummary: WeeklyBriefIntelligenceSummary;
  fcnMarketObservation: WeeklyBriefFcnObservation;
  majorEvents: WeeklyBriefMajorEvent[];
  assetObservations: WeeklyBriefAssetObservation[];
  upcomingFocus: WeeklyBriefUpcomingFocus[];
  riskNotes: string[];
  sources: WeeklyBriefSource[];
  cta: WeeklyBriefCta;
};

export const weeklyBriefs: WeeklyBrief[] = [weeklyBrief20260517];
