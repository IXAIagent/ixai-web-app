import type { MorningBrief } from "@/src/lib/morning-brief";

export function buildIntelligenceMorningBriefContext(brief?: MorningBrief | null) {
  if (!brief) {
    return "Morning Brief context is unavailable.";
  }

  return `Morning Brief ${brief.date}; warnings ${brief.warnings.length}; news ${brief.newsSummary.status}; market ${brief.marketDataSummary.providerStatus}.`;
}
