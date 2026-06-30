import type { WorkspaceMorningBrief } from "@/src/lib/workspace/morning-brief/workspace-brief-types";

function line(value: string) {
  return value.trim();
}

function formatSectionList(brief: WorkspaceMorningBrief, markdown: boolean) {
  return brief.sections
    .map((section, index) => {
      const heading = markdown ? `## ${index + 1}. ${section.title}` : `${index + 1}. ${section.title}`;
      return [
        heading,
        `Source: ${section.source}`,
        `Status: ${section.dataQuality} / ${section.severity}`,
        section.summary,
      ].join("\n");
    })
    .join("\n\n");
}

export function buildWorkspaceBriefPlainText(brief: WorkspaceMorningBrief) {
  return [
    line(brief.title),
    `Date: ${brief.date}`,
    `Generated at: ${brief.generatedAt}`,
    `Status: ${brief.status}`,
    "",
    "Highlights",
    ...(brief.highlights.length > 0 ? brief.highlights.map((item) => `- ${item}`) : ["- No source highlights are available."]),
    "",
    "Sections",
    formatSectionList(brief, false),
    "",
    "Boundary",
    brief.informationalOnlyDisclaimer,
  ].join("\n");
}

export function buildWorkspaceBriefMarkdown(brief: WorkspaceMorningBrief) {
  return [
    `# ${line(brief.title)}`,
    "",
    `- Date: ${brief.date}`,
    `- Generated at: ${brief.generatedAt}`,
    `- Status: ${brief.status}`,
    `- Source status: ${brief.sourceStatus}`,
    "",
    "## Highlights",
    ...(brief.highlights.length > 0 ? brief.highlights.map((item) => `- ${item}`) : ["- No source highlights are available."]),
    "",
    formatSectionList(brief, true),
    "",
    "## Compliance Boundary",
    "",
    brief.informationalOnlyDisclaimer,
  ].join("\n");
}

export function buildWorkspaceBriefShareText(brief: WorkspaceMorningBrief) {
  const highlights = brief.highlights.slice(0, 4);

  return [
    `${brief.title}`,
    `Status: ${brief.status} / ${brief.sourceStatus}`,
    "",
    "Highlights:",
    ...(highlights.length > 0 ? highlights.map((item) => `- ${item}`) : ["- No source highlights are available."]),
    "",
    "This is IXAI Workspace monitoring context only. No buy/sell/hold recommendation, target price, trading signal, or delivery automation is included.",
  ].join("\n");
}
