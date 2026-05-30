import {
  AIProviderError,
  generateDailyIntelligenceWithAI,
  getOpenAIProviderConfig,
  type AIDailyIntelligenceResult,
} from "@/src/lib/intelligence/ai-provider";
import type {
  DailyBriefDraft,
  DailyContentQualityScore,
  DailyCoverageScore,
  DailyFcnAwareness,
  DailyIntelligenceDraft,
  DailyIntelligenceProviderErrorReason,
  DailyIntelligenceProviderMode,
  DailyIntelligenceProviderStatus,
  DailyProviderHealth,
  DailyRiskRegimeReasoning,
} from "@/src/types/editorial";
import { log } from "@/src/lib/log";
import { buildNarrativeBundle } from "@/src/lib/intelligence/narrative-engine";
import type { NewsIntakeMode, NewsSourceStatus, NormalizedNewsItem } from "@/src/types/news";

const COMPLIANCE_NOTE =
  "本簡報由 IXAI 根據公開新聞標題、摘要與市場資料生成草稿，並需經人工審閱。內容僅供資訊參考，不構成投資建議、買賣指令或報酬承諾。";

function byCategory(items: NormalizedNewsItem[], category: NormalizedNewsItem["category"]) {
  return items.find((item) => item.category === category);
}

function firstByCategories(
  items: NormalizedNewsItem[],
  categories: NormalizedNewsItem["category"][],
) {
  return categories
    .map((category) => byCategory(items, category))
    .find((item): item is NormalizedNewsItem => Boolean(item));
}

function balancedFeedItems(items: NormalizedNewsItem[]) {
  const priority: NormalizedNewsItem["category"][] = [
    "rates",
    "macro",
    "equities",
    "ai_tech",
    "semiconductors",
    "taiwan",
    "crypto",
    "risk",
  ];
  const selected: NormalizedNewsItem[] = [];
  const seenIds = new Set<string>();

  for (const category of priority) {
    const item = items.find((candidate) => candidate.category === category && !seenIds.has(candidate.id));

    if (item) {
      selected.push(item);
      seenIds.add(item.id);
    }

    if (selected.length >= 5) {
      break;
    }
  }

  for (const item of items) {
    if (selected.length >= 5) {
      break;
    }

    if (!seenIds.has(item.id)) {
      selected.push(item);
      seenIds.add(item.id);
    }
  }

  return selected;
}

function nowIso() {
  return new Date().toISOString();
}

function minutesAgoLabel(minutes: number) {
  return `Updated ${minutes} mins ago`;
}

function compactText(value: string | undefined, fallback: string, maxLength: number) {
  const normalized = (value ?? fallback).replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1)}…`;
}

function getItemsByCategory(items: NormalizedNewsItem[], categories: NormalizedNewsItem["category"][]) {
  return items.filter((item) => categories.includes(item.category));
}

function sourceHealthFromStatus(sourceStatus: NewsSourceStatus[] = []): DailyProviderHealth[] {
  return sourceStatus.map((source) => ({
    provider: source.label,
    classification: source.classification,
    status: source.status,
    lastSuccess: source.lastSuccessAt,
    errorReason: source.errorReason ?? source.reason,
  }));
}

function buildCoverageScore(items: NormalizedNewsItem[]): DailyCoverageScore {
  const scoreFor = (categories: NormalizedNewsItem["category"][]) => {
    const matchingItems = getItemsByCategory(items, categories);
    const sourceCount = new Set(matchingItems.map((item) => item.sourceLabel)).size;

    if (matchingItems.length === 0) {
      return 0;
    }

    return Math.min(100, Math.round(matchingItems.length * 26 + sourceCount * 8));
  };

  return {
    macro: scoreFor(["macro", "rates"]),
    aiTech: scoreFor(["ai_tech", "semiconductors", "equities"]),
    crypto: scoreFor(["crypto"]),
    taiwan: scoreFor(["taiwan", "semiconductors"]),
    risk: scoreFor(["risk", "rates", "macro"]),
  };
}

function buildExecutiveSummary(items: NormalizedNewsItem[], intelligence: Pick<DailyIntelligenceDraft, "macroRatesObservation" | "aiTechObservation" | "cryptoObservation" | "marketRegimeNote">) {
  const selected = balancedFeedItems(items).slice(0, 5);
  const fallback = [
    compactText(intelligence.macroRatesObservation, "利率與美元仍是今日市場定價核心。", 40),
    compactText(intelligence.aiTechObservation, "AI / Tech 主線仍需觀察資金集中度。", 40),
    compactText(intelligence.cryptoObservation, "BTC / ETH 仍反映風險偏好與流動性。", 40),
    compactText(intelligence.marketRegimeNote, "Risk regime 偏混合，需確認多資產訊號。", 40),
    "FCN 觀察聚焦 KO / KI / Worst Performer 結構。",
  ];

  return Array.from({ length: 5 }, (_, index) =>
    compactText(
      selected[index]?.title,
      fallback[index],
      40,
    ),
  );
}

function buildRiskRegimeReasoning(items: NormalizedNewsItem[], marketRegime: DailyIntelligenceDraft["marketRegime"]): DailyRiskRegimeReasoning {
  const rates = firstByCategories(items, ["rates", "macro"]);
  const risk = byCategory(items, "risk");
  const crypto = byCategory(items, "crypto");
  const current = marketRegime === "risk-off" ? "High" : marketRegime === "risk-on" ? "Moderate" : "Elevated";

  return {
    current,
    reasons: [
      compactText(rates?.summary, "VIX / volatility signal 尚未全面失控，但利率與美元仍可能壓抑風險資產估值。", 86),
      compactText(risk?.summary, "Treasury yield 若維持高檔，科技股估值容錯率下降。", 86),
      compactText(crypto?.summary, "USD liquidity 與 BTC / ETH beta 仍是判斷風險偏好的輔助訊號。", 86),
    ],
  };
}

function buildFcnAwareness(dateIso: string): DailyFcnAwareness {
  const topics: DailyFcnAwareness["topic"][] = ["KO", "KI", "Strike", "Coupon Observation"];
  const topic = topics[new Date(dateIso).getUTCDate() % topics.length];
  const copy: Record<DailyFcnAwareness["topic"], string> = {
    KO: "KO 是提前出場條件，需理解觀察日、標的價格與產品條款如何互動。",
    KI: "KI 是下方風險邊界概念，不等於立即虧損，但會改變到期情境與本金風險。",
    Strike: "Strike 是評估到期交割或現金結算結果的重要條件，不能只看票息。",
    "Coupon Observation": "Coupon Observation 反映配息觀察機制，需搭配條款、標的波動與 worst-of 結構理解。",
  };

  return {
    topic,
    explanation: copy[topic],
    reminder: "FCN structures should be reviewed with licensed professionals and official product documents.",
  };
}

function buildIxuanView({
  ai,
  crypto,
  macro,
  rates,
  risk,
}: {
  ai?: NormalizedNewsItem;
  crypto?: NormalizedNewsItem;
  macro?: NormalizedNewsItem;
  rates?: NormalizedNewsItem;
  risk?: NormalizedNewsItem;
}) {
  const macroAnchor = rates?.summary ?? macro?.summary ?? "利率、美元與通膨仍是今日市場最需要放在前面的背景。";
  const techAnchor = ai?.summary ?? "AI / Tech 仍是資金最容易聚焦的主線，但估值與集中度需要同步檢查。";
  const cryptoAnchor = crypto?.summary ?? "Crypto 沒有重大催化時，仍可作為流動性與風險偏好的觀察溫度計。";
  const riskAnchor = risk?.summary ?? "風險管理上，今日不應只看單一指數方向，而要確認利率、美元、波動率與市場廣度是否一致。";

  return [
    `今日一玄觀點：${compactText(macroAnchor, macroAnchor, 92)}`,
    compactText(techAnchor, techAnchor, 86),
    compactText(cryptoAnchor, cryptoAnchor, 78),
    `${compactText(riskAnchor, riskAnchor, 92)} 這份 Daily Intelligence 的重點，是先建立市場正在 pricing 什麼，再決定哪些風險需要被持續追蹤。`,
  ].join(" ");
}

function estimateContentLength(parts: string[]) {
  return parts.join(" ").replace(/\s+/g, "").length;
}

function buildContentQualityScore({
  coverage,
  items,
  textParts,
}: {
  coverage: DailyCoverageScore;
  items: NormalizedNewsItem[];
  textParts: string[];
}): DailyContentQualityScore {
  const categoryDiversity = new Set(items.map((item) => item.category)).size;
  const sourceCount = new Set(items.map((item) => item.sourceLabel)).size;
  const contentLength = estimateContentLength(textParts);
  const coverageAverage = Math.round(
    (coverage.macro + coverage.aiTech + coverage.crypto + coverage.taiwan + coverage.risk) / 5,
  );
  const lengthScore = contentLength >= 800 ? 24 : Math.round((contentLength / 800) * 24);
  const diversityScore = Math.min(18, categoryDiversity * 3);
  const sourceScore = Math.min(18, sourceCount * 4);
  const insightDepth = Math.min(20, Math.round(textParts.filter((part) => part.length > 70).length * 3.4));
  const score = Math.min(100, Math.round(coverageAverage * 0.2 + lengthScore + diversityScore + sourceScore + insightDepth));
  const reasons = [
    `${sourceCount} sources used`,
    `${categoryDiversity} categories covered`,
    `${contentLength} CJK-aware content units`,
    `coverage average ${coverageAverage}%`,
  ];

  return {
    score,
    contentLength,
    sourceCount,
    categoryDiversity,
    insightDepth,
    status: contentLength < 800 ? "Insufficient Content Depth" : score >= 78 ? "Strong" : "Adequate",
    reasons,
  };
}

function attachDailyContentEngine(
  intelligence: DailyIntelligenceDraft,
  newsItems: NormalizedNewsItem[],
  sourceStatus: NewsSourceStatus[] = [],
): DailyIntelligenceDraft {
  const ai = firstByCategories(newsItems, ["ai_tech", "semiconductors", "equities"]);
  const crypto = byCategory(newsItems, "crypto");
  const rates = byCategory(newsItems, "rates");
  const macro = byCategory(newsItems, "macro");
  const taiwan = firstByCategories(newsItems, ["taiwan", "semiconductors"]);
  const risk = byCategory(newsItems, "risk");
  const executiveSummary = buildExecutiveSummary(newsItems, intelligence);
  const coverageScore = buildCoverageScore(newsItems);
  const riskRegimeReasoning = buildRiskRegimeReasoning(newsItems, intelligence.marketRegime);
  const fcnAwareness = buildFcnAwareness(intelligence.generatedAt);
  const macroWatch = {
    headline: "Macro Watch",
    whatHappened: compactText(rates?.summary ?? macro?.summary, "Fed、Treasury yield、美元與通膨資料仍是今日風險資產的定價核心。", 120),
    whyItMatters: "利率與美元會影響科技股估值、Crypto 流動性與高 beta 資產的風險承受度。",
    marketMeaning: "若長端殖利率與美元同步走強，市場可能降低對高估值資產的容錯率；若兩者降溫，risk appetite 才更容易擴散。",
  };
  const aiTechWatch = {
    headline: "AI / Tech Watch",
    symbols: ["NVDA", "MSFT", "AMD", "AVGO", "PLTR", "META", "GOOGL", "TSLA"].filter((symbol) => {
      const text = `${ai?.title ?? ""} ${ai?.summary ?? ""}`.toLowerCase();
      return text.includes(symbol.toLowerCase()) || ["NVDA", "MSFT", "AMD", "AVGO", "PLTR"].includes(symbol);
    }).slice(0, 5),
    observations: [
      compactText(ai?.summary, "AI infrastructure、semiconductors、cloud 與 software 仍是資金關注主軸。", 96),
      compactText(taiwan?.summary, "台灣 AI supply chain 需同步觀察美股科技股、外資流向與匯率壓力。", 96),
      "AI / Tech 的重點不是單一 headline，而是資本支出、供應鏈能見度與估值容錯率是否同向。",
      "若領漲只集中在少數 megacap，市場廣度不足會放大回撤敏感度。",
    ],
  };
  const cryptoWatch = {
    headline: crypto ? "Crypto Watch" : "No major crypto catalyst today.",
    observations: crypto
      ? [
          compactText(crypto.summary, "BTC / ETH 仍是流動性與風險偏好的高 beta 觀察區。", 96),
          "ETF flow、stablecoin liquidity 與槓桿資金變化是今日 crypto risk appetite 的主要觀察方向。",
          "若美元與實質利率走強，Crypto beta 可能先於股票市場反映壓力。",
        ]
      : ["No major crypto catalyst today.", "仍需觀察 BTC / ETH、ETF flow、stablecoin liquidity 與高槓桿資金是否出現風險偏好轉折。"],
  };
  const ixuanView = buildIxuanView({ ai, crypto, macro, rates, risk });
  const textParts = [
    intelligence.todayHeadline,
    intelligence.marketRegimeNote,
    ...executiveSummary,
    macroWatch.whatHappened,
    macroWatch.whyItMatters,
    macroWatch.marketMeaning,
    aiTechWatch.headline,
    ...aiTechWatch.observations,
    cryptoWatch.headline,
    ...cryptoWatch.observations,
    ...riskRegimeReasoning.reasons,
    fcnAwareness.explanation,
    fcnAwareness.reminder,
    ixuanView,
  ];
  const contentQuality = buildContentQualityScore({ coverage: coverageScore, items: newsItems, textParts });

  return {
    ...intelligence,
    executiveSummary,
    macroWatch,
    aiTechWatch,
    cryptoWatch,
    riskRegimeReasoning,
    fcnAwareness,
    ixuanView,
    coverageScore,
    contentQuality,
    providerHealth: sourceHealthFromStatus(sourceStatus),
  };
}

export function generateDailyIntelligenceFromNews(
  newsItems: NormalizedNewsItem[],
  options: {
    providerMode?: DailyIntelligenceProviderMode;
    providerStatus?: DailyIntelligenceProviderStatus;
    errorReason?: DailyIntelligenceProviderErrorReason;
    sourceMode?: NewsIntakeMode;
    sourceLabels?: string[];
    sourceStatus?: NewsSourceStatus[];
  } = {},
): DailyIntelligenceDraft {
  const ai = firstByCategories(newsItems, ["ai_tech", "semiconductors"]);
  const crypto = byCategory(newsItems, "crypto");
  const taiwan = firstByCategories(newsItems, ["taiwan", "semiconductors"]);
  const risk = byCategory(newsItems, "risk");
  const rates = byCategory(newsItems, "rates");
  const macro = byCategory(newsItems, "macro");
  const generatedAt = nowIso();

  // v1.32 — narrative intelligence bundle. Daily generation has no curated
  // upcoming calendar (that lives in the Weekly editorial flow), so we
  // pass an empty list — the engine still produces regime + importance
  // ranking + market narrative + cross-market links derived purely from
  // today's selected headlines.
  const narrative = buildNarrativeBundle({
    items: newsItems,
    upcomingEvents: [],
    pastTopByCategory: {
      fedMacro: rates ?? macro,
      aiSemi: ai,
      taiwan,
      crypto,
    },
  });

  const intelligence: DailyIntelligenceDraft = {
    todayHeadline: "利率仍是定價核心，AI 與 Crypto 風險偏好需要重新校準",
    riskFocus: {
      label: "IXAI Risk Focus",
      title: risk?.title ?? "今日最大風險是忽略利率對風險資產的再定價速度。",
      summary:
        risk?.summary ??
        "市場表面風險偏好改善，但利率若再度上行，高 beta 資產可能同步回撤。",
      updatedLabel: minutesAgoLabel(6),
    },
    feedItems: balancedFeedItems(newsItems)
      .filter((item): item is NormalizedNewsItem => Boolean(item))
      .map((item, index) => ({
        category: item.category,
        title: item.title,
        summary: item.summary ?? "IXAI intake captured this market item for editorial review.",
        updatedLabel: minutesAgoLabel(8 + index * 4),
      })),
    marketRegimeNote:
      "Risk-on 表象仍在，但不是全面擴散。IXAI 會先追蹤利率、美元、VIX 與 AI 領漲廣度是否一致。",
    marketRegime: "mixed",
    aiTechObservation:
      ai?.summary ??
      "AI 主線仍受資本支出與供應鏈能見度支撐，但估值容錯率下降。",
    cryptoObservation:
      crypto?.summary ??
      "Crypto 仍是流動性敏感資產，對美元與實質利率變化反應較快。",
    macroRatesObservation:
      rates?.summary ??
      macro?.summary ??
      "總經與利率訊號仍需觀察美債長端殖利率、美元與 Fed 官員談話是否形成同向壓力。",
    whatToMonitor: [
      "美債長端殖利率是否重新上行",
      "NVIDIA 與 AI 供應鏈是否維持領漲廣度",
      "BTC / ETH 是否同步反映風險偏好",
      taiwan
        ? "台積電與半導體供應鏈是否受到美股科技股與匯率波動牽動"
        : "VIX 低位是否掩蓋資產集中度風險",
    ],
    sessionLabel: "Asia Session",
    generatedAt,
    sourceMode: options.sourceMode,
    providerMode: options.providerMode ?? "fallback",
    providerStatus:
      options.providerStatus ??
      buildProviderStatus(options.providerMode ?? "fallback", options.errorReason ?? "missing_key"),
    inputNewsCount: newsItems.length,
    sourceLabels: options.sourceLabels,
    complianceNote: COMPLIANCE_NOTE,
    narrative,
  };

  return attachDailyContentEngine(intelligence, newsItems, options.sourceStatus);
}

function generateDailyIntelligenceFromAI(
  aiDraft: AIDailyIntelligenceResult,
  newsItems: NormalizedNewsItem[],
  providerMode: DailyIntelligenceProviderMode,
  sourceLabels: string[],
  sourceStatus: NewsSourceStatus[] = [],
): DailyIntelligenceDraft {
  const feedItems = aiDraft.intelligenceFeed.length
    ? aiDraft.intelligenceFeed
    : generateDailyIntelligenceFromNews(newsItems, {
        providerMode,
        sourceMode: aiDraft.sourceMode,
      }).feedItems;

  // v1.32 — even when OpenAI is the primary generator, the narrative
  // bundle is derived deterministically from the same intake so admin /
  // public surfaces always render the regime, importance ranking and
  // cross-market narrative. Removes provider-dependency for the layer.
  const fedItem = newsItems.find((item) => item.category === "rates")
    ?? newsItems.find((item) => item.category === "macro");
  const aiItem = newsItems.find(
    (item) => item.category === "ai_tech" || item.category === "semiconductors",
  );
  const taiwanItem = newsItems.find((item) => item.category === "taiwan");
  const cryptoItem = newsItems.find((item) => item.category === "crypto");
  const narrative = buildNarrativeBundle({
    items: newsItems,
    upcomingEvents: [],
    pastTopByCategory: {
      fedMacro: fedItem,
      aiSemi: aiItem,
      taiwan: taiwanItem,
      crypto: cryptoItem,
    },
  });

  const intelligence: DailyIntelligenceDraft = {
    todayHeadline: aiDraft.headline,
    riskFocus: {
      label: "IXAI Risk Focus",
      title: aiDraft.riskFocus.title,
      summary: aiDraft.riskFocus.summary,
      updatedLabel: minutesAgoLabel(6),
    },
    feedItems,
    marketRegimeNote: aiDraft.marketRegimeNote,
    marketRegime: aiDraft.marketRegime,
    aiTechObservation: aiDraft.aiTechObservation,
    cryptoObservation: aiDraft.cryptoObservation,
    macroRatesObservation: aiDraft.macroRatesObservation,
    whatToMonitor: aiDraft.whatToMonitor,
    sessionLabel: "Asia Session",
    generatedAt: aiDraft.generatedAt,
    sourceMode: aiDraft.sourceMode,
    providerMode,
    providerStatus: buildProviderStatus(providerMode),
    inputNewsCount: newsItems.length,
    sourceLabels,
    complianceNote: COMPLIANCE_NOTE,
    narrative,
  };

  return attachDailyContentEngine(intelligence, newsItems, sourceStatus);
}

function buildProviderStatus(
  providerMode: DailyIntelligenceProviderMode,
  errorReason?: DailyIntelligenceProviderErrorReason,
  errorMessage?: string,
): DailyIntelligenceProviderStatus {
  const config = getOpenAIProviderConfig();

  return {
    providerMode,
    openAIKeyDetected: config.openAIKeyDetected,
    model: config.model,
    errorReason,
    errorMessage,
  };
}

function reasonFromError(error: unknown): DailyIntelligenceProviderErrorReason {
  if (error instanceof AIProviderError) {
    return error.reason;
  }

  return "unknown_error";
}

export async function generateDailyIntelligenceDraft(): Promise<DailyBriefDraft> {
  return generateDailyIntelligenceDraftFromNews([]);
}

export async function generateDailyIntelligenceDraftFromNews(
  newsItems: NormalizedNewsItem[],
  options: { slugSuffix?: string; sourceMode?: NewsIntakeMode; sourceLabels?: string[]; sourceStatus?: NewsSourceStatus[] } = {},
): Promise<DailyBriefDraft> {
  const hasOpenAIKey = getOpenAIProviderConfig().openAIKeyDetected;
  let providerMode: DailyIntelligenceProviderMode = hasOpenAIKey ? "openai" : "fallback";
  let providerStatus = buildProviderStatus(providerMode, hasOpenAIKey ? undefined : "missing_key");
  let intelligence: DailyIntelligenceDraft;
  let generatedMarketSummary =
    "IXAI 根據今日 intake layer 的市場訊號，整理利率、總經、美股、AI 科技、Crypto 與台灣半導體的風險脈絡。內容用於市場資訊、教育分享與風險 awareness。";
  const sourceLabels =
    options.sourceLabels ??
    [...new Set(newsItems.map((item) => item.sourceLabel).filter(Boolean))];

  if (hasOpenAIKey) {
    try {
      const aiDraft = await generateDailyIntelligenceWithAI(newsItems, {
        sourceMode: options.sourceMode ?? "real",
        sessionLabel: "Asia Session",
      });
      intelligence = generateDailyIntelligenceFromAI(aiDraft, newsItems, "openai", sourceLabels, options.sourceStatus);
      providerStatus = buildProviderStatus("openai");
      intelligence.providerStatus = providerStatus;
      generatedMarketSummary = aiDraft.marketSummary;
    } catch (error) {
      providerMode = "error_fallback";
      const errorReason = reasonFromError(error);
      providerStatus = buildProviderStatus(
        providerMode,
        errorReason,
        error instanceof Error ? error.message : "Unknown OpenAI provider error",
      );
      log.warn("[IXAI] OpenAI Daily Intelligence failed. Falling back to structured generator.", {
        message: error instanceof Error ? error.message : "Unknown OpenAI provider error",
        reason: errorReason,
      });
      intelligence = generateDailyIntelligenceFromNews(newsItems, {
        providerMode,
        providerStatus,
        sourceMode: options.sourceMode ?? "fallback",
        sourceLabels,
        sourceStatus: options.sourceStatus,
      });
    }
  } else {
    intelligence = generateDailyIntelligenceFromNews(newsItems, {
      providerMode,
      providerStatus,
      sourceMode: options.sourceMode ?? "fallback",
      sourceLabels,
      sourceStatus: options.sourceStatus,
    });
  }

  const taiwan = firstByCategories(newsItems, ["taiwan", "semiconductors"]);
  const now = nowIso();
  const baseSlug = `daily-intelligence-${now.slice(0, 10)}`;
  const slug = options.slugSuffix ? `${baseSlug}-${options.slugSuffix}` : baseSlug;
  const engineMarketSummary = [
    "今日 Daily Intelligence 以公開新聞 intake 為基礎，固定整理 Executive Summary、Macro Watch、AI / Tech Watch、Crypto Watch、Risk Regime、FCN Awareness 與 I-Xuan View。",
    intelligence.macroWatch?.marketMeaning,
    intelligence.riskRegimeReasoning
      ? `Current Risk Regime: ${intelligence.riskRegimeReasoning.current}。${intelligence.riskRegimeReasoning.reasons.join(" ")}`
      : intelligence.marketRegimeNote,
  ].filter(Boolean).join(" ");
  const sections: DailyBriefDraft["sections"] = [
    {
      category: "executive_summary",
      headline: "Executive Summary：今日最重要的五件事。",
      summary: (intelligence.executiveSummary ?? [])
        .map((item, index) => `${["①", "②", "③", "④", "⑤"][index] ?? `${index + 1}.`} ${item}`)
        .join(" "),
      ixaiView: "這五點是 editor 審閱 Daily Brief 時的優先順序，不是投資建議或交易指令。",
    },
    {
      category: "macro_watch",
      headline: "Macro Watch：Fed、Rates、Treasury、Dollar 與通膨仍是定價核心。",
      summary: [
        `發生什麼：${intelligence.macroWatch?.whatHappened}`,
        `為何重要：${intelligence.macroWatch?.whyItMatters}`,
        `對市場代表什麼：${intelligence.macroWatch?.marketMeaning}`,
      ].join(" "),
      ixaiView: "總經不是背景雜訊，而是科技股、Crypto 與台股 AI supply chain 估值容錯率的共同折現因子。",
    },
    {
      category: "ai_tech_watch",
      headline: "AI / Tech Watch：追蹤大型科技、半導體與 AI infrastructure。",
      summary: [
        `Symbols: ${intelligence.aiTechWatch?.symbols.join(", ")}`,
        ...(intelligence.aiTechWatch?.observations ?? []),
      ].join(" "),
      ixaiView: "AI / Tech 觀察重點是資本支出、供應鏈能見度、估值容錯率與市場廣度，而不是單一 headline。",
    },
    {
      category: "crypto_watch",
      headline: intelligence.cryptoWatch?.headline ?? "Crypto Watch",
      summary: (intelligence.cryptoWatch?.observations ?? [intelligence.cryptoObservation]).join(" "),
      ixaiView: "Crypto 是流動性與風險偏好的高 beta 觀察層；沒有重大催化時，仍需追蹤 BTC / ETH、ETF flow 與 stablecoin liquidity。",
    },
    {
      category: "risk_regime",
      headline: `Risk Regime：${intelligence.riskRegimeReasoning?.current ?? "Elevated"}`,
      summary: (intelligence.riskRegimeReasoning?.reasons ?? [intelligence.marketRegimeNote]).join(" "),
      ixaiView: "Risk Regime 必須包含理由：VIX、Treasury Yield、USD、信用與市場廣度都可能影響同一天的風險承受度。",
    },
    {
      category: "fcn_awareness",
      headline: `FCN Awareness：${intelligence.fcnAwareness?.topic ?? "KO / KI / Strike / Coupon Observation"}`,
      summary: [
        intelligence.fcnAwareness?.explanation,
        intelligence.fcnAwareness?.reminder,
      ].filter(Boolean).join(" "),
      ixaiView: "FCN Awareness 是教育欄位，用於理解結構與條款，不提供個人 FCN 風險結論或產品推薦。",
    },
    {
      category: "ixuan_view",
      headline: "I-Xuan View：今日市場重點與風險提醒。",
      summary: intelligence.ixuanView ?? intelligence.marketRegimeNote,
      ixaiView: "一玄觀點會把新聞整理成市場正在 pricing 什麼，並提醒風險脈絡；不提供買賣建議。",
    },
    {
      category: "taiwan_market",
      headline: "台灣 AI Supply Chain 補充觀察。",
      summary:
        taiwan?.summary ??
        "台股與半導體供應鏈仍受 AI 資本支出與外資流向影響，短線需同步觀察美股科技股與美元走勢。",
      ixaiView:
        "IXAI 會把台積電與供應鏈視為全球 AI trade 的延伸，而不是只看單一台股行情。",
    },
  ];

  return {
    id: `generated-${slug}`,
    slug,
    status: "review",
    title: intelligence.todayHeadline,
    marketSummary: `${generatedMarketSummary} ${engineMarketSummary}`,
    editorialNote: intelligence.ixuanView ?? intelligence.marketRegimeNote,
    sections,
    riskFocus: intelligence.whatToMonitor,
    intelligence,
    createdAt: now,
    updatedAt: now,
  };
}
