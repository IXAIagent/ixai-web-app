import type { DailyBriefDraft, DailyIntelligenceDraft } from "@/src/types/editorial";
import type { MarketMemoryResult, MarketMemorySnapshot } from "@/src/lib/intelligence/memory/types";

type ThemeDefinition = {
  tag: string;
  keywords: string[];
};

const THEME_DEFINITIONS: ThemeDefinition[] = [
  { tag: "AI infrastructure", keywords: ["ai infrastructure", "data center", "資料中心", "半導體", "semiconductor", "NVDA", "AVGO"] },
  { tag: "enterprise software", keywords: ["enterprise software", "software", "cloud", "雲端", "企業軟體", "資料庫", "PLTR", "MSFT"] },
  { tag: "rates pressure", keywords: ["rates", "treasury", "yield", "Fed", "利率", "殖利率", "美債", "美元"] },
  { tag: "Taiwan AI supply chain", keywords: ["taiwan", "台股", "台積電", "供應鏈", "AI supply chain"] },
  { tag: "crypto liquidity", keywords: ["crypto", "BTC", "ETH", "stablecoin", "ETF flow", "流動性", "槓桿"] },
  { tag: "FCN awareness", keywords: ["FCN", "KO", "KI", "Strike", "Coupon", "Worst Performer", "波動率"] },
  { tag: "risk regime", keywords: ["risk regime", "VIX", "volatility", "波動", "風險偏好", "risk appetite"] },
];

const FALLBACK_SNAPSHOT: MarketMemorySnapshot = {
  aiTechNarrative: "AI infrastructure 仍是公開市場情報的核心觀察主線。",
  cryptoNarrative: "Crypto liquidity 繼續作為風險偏好與槓桿情緒的輔助觀察。",
  dominantThemes: ["AI infrastructure", "rates pressure", "risk regime"],
  fadingThemes: [],
  macroNarrative: "利率、美元與 Treasury yield 仍是風險資產估值容錯率的共同折現因子。",
  previousIxuanView: undefined,
  risingThemes: ["enterprise software"],
  riskNarrative: "Risk regime 需要同時觀察 VIX、美元、利率與市場廣度。",
  taiwanNarrative: "Taiwan AI supply chain 是全球 AI capital spending 的實體延伸。",
};

function cleanText(value?: string) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function compactSentence(value: string | undefined, fallback: string, maxLength = 96) {
  const normalized = cleanText(value);
  const text = normalized || fallback;

  if (text.length <= maxLength) {
    return text;
  }

  const parts = text
    .split(/(?<=[。！？.!?；;])|，|,/)
    .map((part) => part.trim())
    .filter(Boolean);
  let output = "";

  for (const part of parts) {
    const next = output ? `${output}，${part}` : part;
    if (next.length > maxLength) {
      break;
    }
    output = next;
  }

  return output || `${text.slice(0, maxLength - 1)}…`;
}

function briefText(brief?: DailyBriefDraft | null) {
  if (!brief) {
    return "";
  }

  return [
    brief.title,
    brief.marketSummary,
    brief.editorialNote,
    brief.intelligence?.todaySignal,
    brief.intelligence?.marketInterpretation,
    brief.intelligence?.ixuanView,
    ...(brief.intelligence?.executiveSummary ?? []),
    ...(brief.intelligence?.investorWatchpoints ?? []),
    ...(brief.sections ?? []).flatMap((section) => [section.headline, section.summary, section.ixaiView]),
  ]
    .filter(Boolean)
    .join(" ");
}

function detectThemes(text: string) {
  const normalized = text.toLowerCase();

  return THEME_DEFINITIONS
    .filter((theme) => theme.keywords.some((keyword) => normalized.includes(keyword.toLowerCase())))
    .map((theme) => theme.tag);
}

function unique(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

function latestPreviousBrief(previousBriefs: DailyBriefDraft[] = []) {
  return previousBriefs
    .filter((brief) => brief.status === "published" || brief.status === "review" || brief.status === "draft")
    .sort(
      (a, b) =>
        new Date(b.publishedAt ?? b.updatedAt).getTime() -
        new Date(a.publishedAt ?? a.updatedAt).getTime(),
    )[0];
}

function narrativeFromCurrent(current: DailyIntelligenceDraft) {
  return {
    aiTechNarrative: compactSentence(
      current.aiTechWatch?.observations?.[0] ?? current.aiTechObservation,
      FALLBACK_SNAPSHOT.aiTechNarrative,
    ),
    cryptoNarrative: compactSentence(
      current.cryptoWatch?.observations?.[0] ?? current.cryptoObservation,
      FALLBACK_SNAPSHOT.cryptoNarrative,
    ),
    macroNarrative: compactSentence(
      current.macroWatch?.marketMeaning ?? current.macroRatesObservation,
      FALLBACK_SNAPSHOT.macroNarrative,
    ),
    riskNarrative: compactSentence(
      current.riskRegimeReasoning?.reasons?.[0] ?? current.marketRegimeNote,
      FALLBACK_SNAPSHOT.riskNarrative,
    ),
    taiwanNarrative: compactSentence(
      current.investorWatchpoints?.find((item) => /taiwan|台股|供應鏈/i.test(item)),
      FALLBACK_SNAPSHOT.taiwanNarrative,
    ),
  };
}

export function buildMarketMemorySnapshot(
  current: DailyIntelligenceDraft,
  previousBriefs: DailyBriefDraft[] = [],
): MarketMemorySnapshot {
  const previous = latestPreviousBrief(previousBriefs);
  const previousText = briefText(previous);
  const currentText = briefText({
    createdAt: current.generatedAt,
    id: "current-memory-source",
    marketSummary: current.marketInterpretation ?? current.marketRegimeNote,
    sections: [],
    slug: "current-memory-source",
    status: "draft",
    title: current.todayHeadline,
    updatedAt: current.generatedAt,
    editorialNote: current.ixuanView,
    intelligence: current,
  });
  const previousThemes = detectThemes(previousText);
  const currentThemes = detectThemes(currentText);
  const dominantThemes = unique([...currentThemes, ...previousThemes]).slice(0, 5);
  const risingThemes = unique(currentThemes.filter((theme) => !previousThemes.includes(theme))).slice(0, 3);
  const fadingThemes = unique(previousThemes.filter((theme) => !currentThemes.includes(theme))).slice(0, 3);
  const narratives = narrativeFromCurrent(current);

  return {
    ...FALLBACK_SNAPSHOT,
    ...narratives,
    dominantThemes: dominantThemes.length ? dominantThemes : FALLBACK_SNAPSHOT.dominantThemes,
    fadingThemes,
    memoryDate: previous?.publishedAt ?? previous?.updatedAt,
    previousIxuanView: previous?.intelligence?.ixuanView ?? previous?.editorialNote,
    risingThemes: risingThemes.length ? risingThemes : FALLBACK_SNAPSHOT.risingThemes,
  };
}

export function buildWhatChangedSinceLastBrief(snapshot: MarketMemorySnapshot) {
  const dominant = snapshot.dominantThemes[0] ?? "AI infrastructure";
  const rising = snapshot.risingThemes[0] ?? "enterprise software";
  const fading = snapshot.fadingThemes[0];

  if (snapshot.memoryDate) {
    return [
      `相較前一份 Brief，市場主線仍圍繞 ${dominant}，但今日更需要觀察 ${rising} 是否接棒升溫。`,
      fading
        ? `${fading} 的訊號相對降溫，代表市場正在重新排序敘事優先順序。`
        : "這代表市場主線尚未反轉，而是從既有題材延伸到新的受惠層。",
      "此段為公開市場敘事追蹤，不是個人化投資建議。",
    ].join("");
  }

  return [
    `IXAI 目前以 ${dominant}、${snapshot.dominantThemes[1] ?? "rates pressure"} 與 ${snapshot.dominantThemes[2] ?? "risk regime"} 建立第一層市場記憶。`,
    `今日觀察重點是 ${rising} 是否成為下一個敘事延伸方向。`,
    "此段為公開市場敘事追蹤，不是個人化投資建議。",
  ].join("");
}

export function buildContinuityTags(snapshot: MarketMemorySnapshot) {
  return unique([
    ...snapshot.dominantThemes,
    ...snapshot.risingThemes,
    "public market memory",
  ]).slice(0, 5);
}

export function attachMarketMemoryToDailyIntelligence(
  intelligence: DailyIntelligenceDraft,
  previousBriefs: DailyBriefDraft[] = [],
): DailyIntelligenceDraft {
  const snapshot = buildMarketMemorySnapshot(intelligence, previousBriefs);
  const whatChangedSinceLastBrief = buildWhatChangedSinceLastBrief(snapshot);
  const continuityTags = buildContinuityTags(snapshot);
  const memoryPrefix = snapshot.memoryDate
    ? `相較前一份 Brief，今日市場主線並未完全反轉，而是呈現 ${continuityTags.slice(0, 2).join(" / ")} 的延續與重新排序。`
    : `IXAI 正在建立第一層市場記憶，今日先以 ${continuityTags.slice(0, 2).join(" / ")} 作為後續追蹤基準。`;
  const baseIxuanView = cleanText(intelligence.ixuanView);

  return {
    ...intelligence,
    continuityTags,
    ixuanView: `${memoryPrefix}${baseIxuanView}`,
    marketMemory: snapshot,
    whatChangedSinceLastBrief,
  };
}

export function buildMarketMemoryResult(
  current: DailyIntelligenceDraft,
  previousBriefs: DailyBriefDraft[] = [],
): MarketMemoryResult {
  const snapshot = buildMarketMemorySnapshot(current, previousBriefs);

  return {
    continuityTags: buildContinuityTags(snapshot),
    snapshot,
    whatChangedSinceLastBrief: buildWhatChangedSinceLastBrief(snapshot),
  };
}
