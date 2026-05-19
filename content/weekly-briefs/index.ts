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

export type WeeklyBriefUpcomingFocus = {
  date: string;
  event: string;
  whyItMatters: string;
  marketImpact: string;
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
  majorEvents: WeeklyBriefMajorEvent[];
  assetObservations: WeeklyBriefAssetObservation[];
  upcomingFocus: WeeklyBriefUpcomingFocus[];
  riskNotes: string[];
  sources: WeeklyBriefSource[];
  cta: WeeklyBriefCta;
};

export const weeklyBriefs: WeeklyBrief[] = [weeklyBrief20260517];
