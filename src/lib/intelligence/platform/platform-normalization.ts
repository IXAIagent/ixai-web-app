import type {
  IntelligenceItem,
  IntelligenceSourceState,
  SourceStateInput,
} from "@/src/lib/intelligence/platform/platform-types";

const SOURCE_STATE_PRIORITY: Record<IntelligenceSourceState, number> = {
  live: 7,
  database: 6,
  cache: 5,
  local: 4,
  fallback: 3,
  limited: 2,
  unavailable: 1,
};

export function uniqueStrings(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      values
        .map((value) => (value ?? "").trim())
        .filter(Boolean),
    ),
  );
}

export function normalizeSourceState(state: SourceStateInput): IntelligenceSourceState {
  if (state === "live") return "live";
  if (state === "persisted" || state === "database") return "database";
  if (state === "cache" || state === "stale") return "cache";
  if (state === "local") return "local";
  if (state === "fallback") return "fallback";
  if (state === "partial" || state === "limited" || state === "delayed" || state === "ready") return "limited";
  return "unavailable";
}

export function strongestSourceState(states: IntelligenceSourceState[]): IntelligenceSourceState {
  if (states.length === 0) {
    return "unavailable";
  }

  return states.toSorted(
    (left, right) => SOURCE_STATE_PRIORITY[right] - SOURCE_STATE_PRIORITY[left],
  )[0] ?? "unavailable";
}

export function isFallbackSource(state: IntelligenceSourceState) {
  return state === "fallback" || state === "limited" || state === "unavailable";
}

export function freshnessFromIso(value: string | null | undefined, nowIso: string) {
  if (!value) {
    return "unknown" as const;
  }

  const now = Date.parse(nowIso);
  const timestamp = Date.parse(value);

  if (!Number.isFinite(now) || !Number.isFinite(timestamp)) {
    return "unknown" as const;
  }

  const ageMs = Math.abs(now - timestamp);
  return ageMs <= 24 * 60 * 60 * 1000 ? "fresh" as const : "stale" as const;
}

export function clampScore(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return Math.max(0, Math.min(1, value));
}

export function createStableItemId(input: Pick<IntelligenceItem, "domain" | "title" | "relatedSymbols" | "relatedFcnIds">) {
  const subject = [
    input.domain,
    input.title,
    input.relatedSymbols.join("-"),
    input.relatedFcnIds.join("-"),
  ]
    .join(":")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `intel:${subject || input.domain}`;
}

export function hasAdviceLanguage(text: string) {
  const normalized = text.toLowerCase();
  return [
    "buy",
    "sell",
    "hold",
    "target price",
    "price target",
    "guaranteed",
    "must invest",
    "建議買",
    "買進",
    "賣出",
    "目標價",
    "保證",
  ].some((keyword) => normalized.includes(keyword.toLowerCase()));
}
