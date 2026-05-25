import { ixaiSiteUrl } from "@/src/lib/brand/metadata";

// v1.33.2 — Canonical + metadata validation helpers. Each top-level page
// passes its path through `buildCanonical` so the metadata block always
// resolves to an origin-stable URL string. The validator is intended for
// build-time / dev-only smoke tests rather than runtime traffic.

export function buildCanonical(path: string): string {
  if (!path.startsWith("/")) {
    return `${ixaiSiteUrl}/${path}`;
  }
  return `${ixaiSiteUrl}${path}`;
}

export type MetadataValidationInput = {
  path: string;
  title?: string;
  description?: string;
  canonical?: string;
};

export type MetadataValidationIssue = {
  field: string;
  message: string;
};

export function validatePublicMetadata(
  input: MetadataValidationInput,
): MetadataValidationIssue[] {
  const issues: MetadataValidationIssue[] = [];

  if (!input.title || input.title.trim().length === 0) {
    issues.push({ field: "title", message: "Missing title." });
  } else if (input.title.length > 90) {
    issues.push({
      field: "title",
      message: `Title is ${input.title.length} chars; recommend ≤ 70 for SERP.`,
    });
  }

  if (!input.description || input.description.trim().length === 0) {
    issues.push({ field: "description", message: "Missing description." });
  } else if (input.description.length > 220) {
    issues.push({
      field: "description",
      message: `Description is ${input.description.length} chars; recommend ≤ 200.`,
    });
  }

  if (!input.canonical) {
    issues.push({
      field: "canonical",
      message: `No canonical set; suggest "${input.path}".`,
    });
  } else if (!input.canonical.startsWith("/") && !input.canonical.startsWith(ixaiSiteUrl)) {
    issues.push({
      field: "canonical",
      message: `Canonical "${input.canonical}" does not look path-relative or origin-prefixed.`,
    });
  }

  return issues;
}

// Public surfaces that should always carry canonical metadata. Used by
// internal smoke checks; not consumed at runtime.
export const PUBLIC_CANONICAL_PATHS = [
  "/",
  "/daily-brief",
  "/weekly-brief",
  "/market",
  "/fcn",
  "/about",
  "/pro",
  "/feedback",
] as const;
