import { dailyBrief20260519 } from "@/content/daily-briefs/2026-05-19";

export type DailyBriefCategory =
  | "us_market"
  | "taiwan_market"
  | "crypto"
  | "rates"
  | "ai_market";

export type DailyBrief = {
  slug: string;
  publishedAt: string;
  title: string;
  marketSummary: string;
  editorialNote: string;
  sections: {
    category: DailyBriefCategory;
    headline: string;
    summary: string;
    ixaiView: string;
  }[];
  riskFocus: string[];
  watchlistNotes: {
    symbol: string;
    note: string;
  }[];
};

export const dailyBriefs: DailyBrief[] = [dailyBrief20260519];
