import type { MorningBriefV1 } from "@/src/lib/morning-brief/morning-brief-live-service";

export function buildMorningBriefShareText(brief: MorningBriefV1) {
  const lines = [
    `IXAI Morning Brief v1 · ${brief.date}`,
    `As of: ${brief.asOf ?? brief.generatedAt}`,
    "",
    ...brief.sections.map(
      (section) => `${section.label}: ${section.value} (${section.status})`,
    ),
    "",
    "Read-only monitoring summary. No investment recommendation, order execution, auto trading, or return promise.",
  ];

  return lines.join("\n");
}
