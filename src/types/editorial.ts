export type DailyBriefDraftStatus = "draft" | "review" | "published";

export type DailyBriefDraft = {
  id: string;
  slug: string;
  status: DailyBriefDraftStatus;
  title: string;
  marketSummary: string;
  editorialNote?: string;
  sections: {
    category: string;
    headline: string;
    summary: string;
    ixaiView?: string;
  }[];
  riskFocus?: string[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
};
