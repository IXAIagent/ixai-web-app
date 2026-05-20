export type DailyBriefDraftStatus = "draft" | "review" | "published";

export type DailyIntelligenceFeedItem = {
  category: string;
  title: string;
  summary: string;
  updatedLabel: string;
};

export type DailyRiskFocus = {
  label: string;
  title: string;
  summary: string;
  updatedLabel: string;
};

export type MarketRegime = "risk-on" | "risk-off" | "mixed";

export type DailyIntelligenceDraft = {
  todayHeadline: string;
  riskFocus: DailyRiskFocus;
  feedItems: DailyIntelligenceFeedItem[];
  marketRegimeNote: string;
  marketRegime: MarketRegime;
  aiTechObservation: string;
  cryptoObservation: string;
  whatToMonitor: string[];
  sessionLabel: "Asia Session" | "US Futures" | "Pre-market";
  generatedAt: string;
  publishedAt?: string;
};

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
  intelligence?: DailyIntelligenceDraft;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
};
