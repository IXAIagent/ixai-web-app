import type {
  EditorialFailureState,
  EditorialMarket,
  EditorialSource,
  EditorialSourceKind,
  EditorialStory,
  RawEditorialProviderItem,
} from "@/src/lib/editorial/editorial-types";

const DEFAULT_SOURCE: EditorialSource = {
  confidence: 0.35,
  id: "unknown-source",
  kind: "fallback",
  label: "Unknown source",
  status: "degraded",
};

function clampScore(value: unknown, fallback: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(1, Math.max(0, value));
}

function toId(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

function cleanText(value: unknown, fallback: string) {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();

  return trimmed.length ? trimmed : fallback;
}

function normalizeList<T extends string>(value: unknown, fallback: T[] = []) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  return value.filter((item): item is T => typeof item === "string" && item.trim().length > 0);
}

export function createEditorialFailureState(
  code: EditorialFailureState["code"],
  message: string,
  options: Partial<Omit<EditorialFailureState, "code" | "message">> = {},
): EditorialFailureState {
  return {
    code,
    degraded: options.degraded ?? true,
    fallbackUsed: options.fallbackUsed ?? "limited_brief",
    message,
    publishBlocking: options.publishBlocking ?? false,
    severity: options.severity ?? "warning",
  };
}

export function normalizeEditorialSource(item: RawEditorialProviderItem): EditorialSource {
  const label = cleanText(item.sourceLabel, DEFAULT_SOURCE.label);
  const id = cleanText(item.sourceId, toId(`${item.providerKey ?? "source"}-${label}`));
  const kind: EditorialSourceKind = item.sourceKind ?? DEFAULT_SOURCE.kind;
  const confidence = clampScore(item.confidence, DEFAULT_SOURCE.confidence);

  return {
    confidence,
    id,
    kind,
    label,
    providerKey: item.providerKey,
    status: confidence < 0.45 ? "degraded" : "available",
    url: item.url,
  };
}

export function normalizeEditorialStory(
  item: RawEditorialProviderItem,
  index = 0,
): EditorialStory {
  const title = cleanText(item.title ?? item.headline, "Untitled market update");
  const summary = cleanText(
    item.summary ?? item.description,
    "Limited source detail is available for this market update.",
  );
  const source = normalizeEditorialSource(item);
  const id = cleanText(item.id, toId(`${source.id}-${title}-${index}`));
  const publishedAt = item.publishedAt ?? item.updatedAt;
  const importance = clampScore(item.importance, 0.5);
  const sourceConfidence = clampScore(item.confidence, source.confidence);

  return {
    categories: normalizeList<string>(item.categories, ["market"]),
    duplicationRisk: 0,
    freshness: scoreFreshness(publishedAt),
    id,
    importance,
    marketRelevance: scoreMarketRelevance(item.markets, item.symbols),
    markets: normalizeList<EditorialMarket>(item.markets, ["global"]),
    publishedAt,
    source,
    sourceConfidence,
    summary,
    symbols: normalizeList<string>(item.symbols),
    title,
    updatedAt: item.updatedAt,
    url: item.url,
  };
}

export function normalizeEditorialStories(items: RawEditorialProviderItem[]): EditorialStory[] {
  return items.map((item, index) => normalizeEditorialStory(item, index));
}

function scoreFreshness(value?: string) {
  if (!value) {
    return 0.45;
  }

  const timestamp = new Date(value).getTime();

  if (!Number.isFinite(timestamp)) {
    return 0.45;
  }

  const ageHours = Math.max(0, (Date.now() - timestamp) / 3_600_000);

  if (ageHours <= 6) {
    return 1;
  }

  if (ageHours <= 24) {
    return 0.82;
  }

  if (ageHours <= 72) {
    return 0.58;
  }

  return 0.35;
}

function scoreMarketRelevance(markets?: EditorialMarket[], symbols?: string[]) {
  const marketScore = Array.isArray(markets) && markets.length > 0 ? 0.35 : 0.15;
  const symbolScore = Array.isArray(symbols) && symbols.length > 0 ? 0.35 : 0;

  return Math.min(1, 0.3 + marketScore + symbolScore);
}
