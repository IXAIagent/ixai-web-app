import type { WorkspaceMorningBrief } from "@/src/lib/workspace/morning-brief/workspace-brief-types";

export type WorkspaceBriefExportLabels = {
  boundary: string;
  date: string;
  generatedAt: string;
  highlights: string;
  noHighlights: string;
  sections: string;
  source: string;
  sourceStatus: string;
  status: string;
  shareBoundary: string;
};

const defaultLabels: WorkspaceBriefExportLabels = {
  boundary: "Boundary",
  date: "Date",
  generatedAt: "Generated at",
  highlights: "Highlights",
  noHighlights: "No source highlights are available.",
  sections: "Sections",
  source: "Source",
  sourceStatus: "Source status",
  status: "Status",
  shareBoundary:
    "This is IXAI Workspace monitoring context only. No buy/sell/hold recommendation, target price, trading signal, or delivery automation is included.",
};

function line(value: string) {
  return value.trim();
}

function mergeLabels(labels?: Partial<WorkspaceBriefExportLabels>) {
  return {
    ...defaultLabels,
    ...(labels ?? {}),
  };
}

function formatSectionList(
  brief: WorkspaceMorningBrief,
  markdown: boolean,
  labels: WorkspaceBriefExportLabels,
) {
  return brief.sections
    .map((section, index) => {
      const heading = markdown ? `## ${index + 1}. ${section.title}` : `${index + 1}. ${section.title}`;
      return [
        heading,
        `${labels.source}: ${section.source}`,
        `${labels.status}: ${section.dataQuality} / ${section.severity}`,
        section.summary,
      ].join("\n");
    })
    .join("\n\n");
}

export function buildWorkspaceBriefPlainText(
  brief: WorkspaceMorningBrief,
  labelsInput?: Partial<WorkspaceBriefExportLabels>,
) {
  const labels = mergeLabels(labelsInput);

  return [
    line(brief.title),
    `${labels.date}: ${brief.date}`,
    `${labels.generatedAt}: ${brief.generatedAt}`,
    `${labels.status}: ${brief.status}`,
    "",
    labels.highlights,
    ...(brief.highlights.length > 0 ? brief.highlights.map((item) => `- ${item}`) : [`- ${labels.noHighlights}`]),
    "",
    labels.sections,
    formatSectionList(brief, false, labels),
    "",
    labels.boundary,
    brief.informationalOnlyDisclaimer,
  ].join("\n");
}

export function buildWorkspaceBriefMarkdown(
  brief: WorkspaceMorningBrief,
  labelsInput?: Partial<WorkspaceBriefExportLabels>,
) {
  const labels = mergeLabels(labelsInput);

  return [
    `# ${line(brief.title)}`,
    "",
    `- ${labels.date}: ${brief.date}`,
    `- ${labels.generatedAt}: ${brief.generatedAt}`,
    `- ${labels.status}: ${brief.status}`,
    `- ${labels.sourceStatus}: ${brief.sourceStatus}`,
    "",
    `## ${labels.highlights}`,
    ...(brief.highlights.length > 0 ? brief.highlights.map((item) => `- ${item}`) : [`- ${labels.noHighlights}`]),
    "",
    formatSectionList(brief, true, labels),
    "",
    `## ${labels.boundary}`,
    "",
    brief.informationalOnlyDisclaimer,
  ].join("\n");
}

export function buildWorkspaceBriefShareText(
  brief: WorkspaceMorningBrief,
  labelsInput?: Partial<WorkspaceBriefExportLabels>,
) {
  const labels = mergeLabels(labelsInput);
  const highlights = brief.highlights.slice(0, 4);

  return [
    `${brief.title}`,
    `${labels.status}: ${brief.status} / ${brief.sourceStatus}`,
    "",
    `${labels.highlights}:`,
    ...(highlights.length > 0 ? highlights.map((item) => `- ${item}`) : [`- ${labels.noHighlights}`]),
    "",
    labels.shareBoundary,
  ].join("\n");
}
