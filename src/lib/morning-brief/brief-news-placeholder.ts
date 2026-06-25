import type { MorningBriefNewsSummary } from "@/src/lib/morning-brief/brief-types";

export function buildMorningNewsPlaceholder(): MorningBriefNewsSummary {
  return {
    coverage: [
      "Market news provider pending",
      "Portfolio-aware relevance pending",
      "No external news API connected in V16",
    ],
    lastRefresh: null,
    newsSource: "placeholder",
    sourceStatus: "placeholder",
    status: "not_configured",
  };
}
