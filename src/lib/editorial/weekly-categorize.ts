import type { NormalizedNewsItem } from "@/src/types/news";

// v1.31 — past-week categorization for the Weekly Intelligence generator.
//
// Each headline is assigned to EXACTLY ONE section using a priority order
// (Fed/macro outranks AI, AI outranks US equities, etc.) so the same news
// item cannot appear in 美股 + 台股 + AI 科技 simultaneously. Headlines are
// also normalized + deduped: identical or near-identical titles from
// different feeds collapse into one slot. We cap the number of headlines
// per source per section so a single noisy feed cannot dominate a section.

export type WeeklySectionKey =
  | "usEquities"
  | "taiwanEquities"
  | "aiSemiconductors"
  | "fedRatesMacro"
  | "earnings"
  | "crypto"
  | "geopolitics";

export type CategorizedSection = {
  key: WeeklySectionKey;
  label: string;
  items: NormalizedNewsItem[];
};

export type CategorizationResult = {
  sections: Record<WeeklySectionKey, NormalizedNewsItem[]>;
  duplicatesRemoved: number;
  uniqueHeadlinesCount: number;
};

const SECTION_ORDER: WeeklySectionKey[] = [
  "fedRatesMacro",
  "earnings",
  "aiSemiconductors",
  "taiwanEquities",
  "usEquities",
  "crypto",
  "geopolitics",
];

export const SECTION_LABELS: Record<WeeklySectionKey, string> = {
  usEquities: "美股",
  taiwanEquities: "台股",
  aiSemiconductors: "AI 科技 / 半導體",
  fedRatesMacro: "FED / 利率 / 總經",
  earnings: "財報",
  crypto: "Crypto",
  geopolitics: "地緣政治",
};

const SECTION_PATTERNS: Record<WeeklySectionKey, RegExp> = {
  // Fed / macro outranks AI when both appear (e.g. "Fed minutes show concern over AI capex").
  fedRatesMacro:
    /\b(fed|fomc|powell|cpi|pce|nfp|payroll|payrolls|jobs report|gdp|pmi|ism|treasury|yield|inflation)\b|聯準會|通膨|殖利率|公債|非農|失業率|CPI|PCE|FOMC/i,
  earnings:
    /\bearnings\b|\bguidance\b|\bquarterly\b|\brevenue\b|財報|營收|展望|法說會|EPS/i,
  aiSemiconductors:
    /\bAI\b|nvidia|nvda|gpu|cuda|cowos|hbm|semiconductor|chip|台積|tsmc|2330|broadcom|avgo|amd|micron|mu|samsung|sk hynix|hynix|asml|半導體|晶片|晶圓|先進製程|伺服器|server|台積電/i,
  taiwanEquities:
    /\b(twse|taiex|taiwan|2330|2454|2317|2382|3231|2376|6669|3017|3324|2308)\b|台股|加權|外資|台指期|聯發科|鴻海|廣達|緯創|技嘉|緯穎|奇鋐|雙鴻|台達電/i,
  usEquities:
    /\b(s&p|s\&p|spy|qqq|nasdaq|dow|wall street|stocks?)\b|美股|那斯達克|道瓊|標普/i,
  crypto:
    /\b(bitcoin|btc|ethereum|eth|crypto|stablecoin|solana|sol|defi|on-chain|onchain|blockchain)\b|比特幣|以太|加密|穩定幣/i,
  geopolitics:
    /\b(tariff|sanction|war|hormuz|russia|ukraine|israel|iran|china|trade war|geopolitic)\b|關稅|制裁|地緣|戰爭|貿易戰|中美|兩岸/i,
};

function normalizeHeadline(title: string): string {
  return title
    .toLowerCase()
    .replace(/[\s　]+/gu, " ")
    .replace(/[^\p{L}\p{N} ]/gu, "")
    .trim();
}

// Approximate near-duplicate detection. Headlines are considered duplicates
// when their normalized form is identical OR when one is a prefix of the
// other with at least 60 chars overlap (handles "X says Y" vs "X says Y, …
// reports Reuters").
function isLikelyDuplicate(a: string, b: string): boolean {
  if (a === b) {
    return true;
  }

  if (a.length >= 60 && b.length >= 60 && (a.startsWith(b) || b.startsWith(a))) {
    return true;
  }

  return false;
}

function pickSectionForItem(item: NormalizedNewsItem): WeeklySectionKey | null {
  const haystack = `${item.title} ${item.summary ?? ""} ${item.tags?.join(" ") ?? ""}`;

  for (const key of SECTION_ORDER) {
    if (SECTION_PATTERNS[key].test(haystack)) {
      return key;
    }
  }

  // Fall back to the news provider's coarse category when no pattern hits.
  switch (item.category) {
    case "rates":
    case "macro":
      return "fedRatesMacro";
    case "ai_tech":
      return "aiSemiconductors";
    case "semiconductors":
      return "aiSemiconductors";
    case "taiwan":
      return "taiwanEquities";
    case "equities":
      return "usEquities";
    case "crypto":
      return "crypto";
    case "geopolitics":
      return "geopolitics";
    case "risk":
      return "fedRatesMacro";
    default:
      return null;
  }
}

const MAX_HEADLINES_PER_SECTION = 4;
const MAX_HEADLINES_PER_SOURCE_PER_SECTION = 2;

export function categorizeWeeklyHeadlines(
  items: NormalizedNewsItem[],
): CategorizationResult {
  const buckets: Record<WeeklySectionKey, NormalizedNewsItem[]> = {
    usEquities: [],
    taiwanEquities: [],
    aiSemiconductors: [],
    fedRatesMacro: [],
    earnings: [],
    crypto: [],
    geopolitics: [],
  };

  const usedNormalizedTitles: string[] = [];
  const sourceCountPerSection = new Map<string, number>();
  let duplicatesRemoved = 0;
  let uniqueHeadlinesCount = 0;

  for (const item of items) {
    const normalized = normalizeHeadline(item.title);

    if (!normalized) {
      continue;
    }

    if (usedNormalizedTitles.some((seen) => isLikelyDuplicate(seen, normalized))) {
      duplicatesRemoved += 1;
      continue;
    }

    const section = pickSectionForItem(item);

    if (!section) {
      continue;
    }

    if (buckets[section].length >= MAX_HEADLINES_PER_SECTION) {
      continue;
    }

    const sourceKey = `${section}:${item.sourceLabel}`;
    const sourceCount = sourceCountPerSection.get(sourceKey) ?? 0;
    if (sourceCount >= MAX_HEADLINES_PER_SOURCE_PER_SECTION) {
      continue;
    }

    buckets[section].push(item);
    sourceCountPerSection.set(sourceKey, sourceCount + 1);
    usedNormalizedTitles.push(normalized);
    uniqueHeadlinesCount += 1;
  }

  return {
    sections: buckets,
    duplicatesRemoved,
    uniqueHeadlinesCount,
  };
}

export function listOrderedSections(result: CategorizationResult): CategorizedSection[] {
  return SECTION_ORDER.map((key) => ({
    key,
    label: SECTION_LABELS[key],
    items: result.sections[key] ?? [],
  }));
}
