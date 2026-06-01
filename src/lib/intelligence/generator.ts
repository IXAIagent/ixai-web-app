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
  DailyTopStory,
} from "@/src/types/editorial";
import { log } from "@/src/lib/log";
import { attachDailyIntelligenceCore } from "@/src/lib/intelligence/core";
import { buildIXAIInsight } from "@/src/lib/intelligence/insight";
import { attachMarketMemoryToDailyIntelligence } from "@/src/lib/intelligence/memory";
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

function isMostlyEnglishText(value: string) {
  const letters = (value.match(/[A-Za-z]/g) ?? []).length;
  const cjk = (value.match(/[\u4e00-\u9fff]/g) ?? []).length;

  return letters > 20 && cjk < Math.max(8, letters * 0.22);
}

function looksLikeRawNewsSnippet(value: string) {
  return /記者|綜合報導|新聞網|報導|全文|\\.\\.\\.|…/.test(value);
}

function cleanIntelligenceSentence(value: string | undefined, fallback: string, maxLength = 160) {
  const normalized = (value ?? fallback)
    .replace(/\*\*/g, "")
    .replace(/Short Insight|Observation\s*\d+/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/buy now|must buy|sell now/gi, "monitor")
    .replace(/guaranteed return/gi, "risk-awareness context")
    .replace(/買進|買入|必買/g, "觀察")
    .replace(/賣出|必賣/g, "風險控管")
    .replace(/保證收益|保證報酬|穩賺|必漲/g, "風險情境");

  if (!normalized || isMostlyEnglishText(normalized) || looksLikeRawNewsSnippet(normalized)) {
    return compactText(fallback, fallback, maxLength);
  }

  return compactText(normalized, fallback, maxLength);
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

function buildTodaySignal({
  ai,
  macro,
  rates,
  risk,
}: {
  ai?: NormalizedNewsItem;
  macro?: NormalizedNewsItem;
  rates?: NormalizedNewsItem;
  risk?: NormalizedNewsItem;
}) {
  const macroSignal = rates?.summary ?? macro?.summary;
  const aiSignal = ai?.summary;
  const riskSignal = risk?.summary;

  if (aiSignal && macroSignal) {
    return "今日最重要的訊號是：AI 需求仍是市場主線，但利率與估值壓力正在限制風險偏好的擴散。";
  }

  if (aiSignal) {
    return "今日最重要的訊號是：資金仍圍繞 AI 與科技效率題材，但市場需要確認這條主線是否能擴散到更多產業。";
  }

  if (macroSignal || riskSignal) {
    return "今日最重要的訊號是：市場重新把利率、美元與波動率放回定價核心，風險資產需要更多確認訊號。";
  }

  return "今日最重要的訊號是：市場缺少單一強催化，應先觀察 AI 主線、利率壓力與風險偏好是否重新同向。";
}

function buildTopThreeThings({
  macro,
  rates,
  taiwan,
}: {
  macro?: NormalizedNewsItem;
  rates?: NormalizedNewsItem;
  taiwan?: NormalizedNewsItem;
}): DailyTopStory[] {
  const macroAnchor = rates ?? macro;
  const items: DailyTopStory[] = [
    {
      headline: "Macro：利率與美元仍牽動風險偏好",
      whatHappened: cleanIntelligenceSentence(
        macroAnchor?.summary,
        "Fed、Treasury yield、美元與通膨訊號仍是今日市場定價核心。",
        96,
      ),
      whyItMatters: "長端利率與美元會影響科技股估值、Crypto 流動性與高 beta 資產的容錯率。",
      watchpoint: "觀察美債殖利率、美元與 VIX 是否同步轉強。",
    },
    {
      headline: "AI：資金主線從晶片延伸到軟體與雲端",
      whatHappened: "半導體、雲端與企業軟體仍是 AI 資金觀察核心，但市場正在要求更清楚的獲利與支出證據。",
      whyItMatters: "AI 行情若從單一晶片股擴散到軟體與雲端，代表企業 AI 支出敘事仍有延伸空間。",
      watchpoint: "觀察大型科技、企業軟體、資料中心與半導體供應鏈是否同向。",
    },
    {
      headline: taiwan ? "Taiwan：AI 供應鏈仍是全球 AI trade 延伸" : "Risk：高估值環境下波動率容易放大",
      whatHappened: taiwan
        ? "台股 AI supply chain 仍受全球 AI 資本支出、匯率與外資節奏影響。"
        : "市場風險偏好尚未全面擴散，高 beta 資產仍容易受到利率與流動性變化牽動。",
      whyItMatters: taiwan
        ? "台灣 AI 供應鏈是全球 AI 資本支出的實體延伸，會同時受美股科技股與匯率變化影響。"
        : "高估值環境下，只要利率或美元重新走強，波動率就可能先在高 beta 資產放大。",
      watchpoint: taiwan
        ? "觀察台積電、AI server、外資流向與美股科技股廣度。"
        : "觀察 VIX、BTC / ETH、信用壓力與市場廣度。",
    },
  ];

  return items;
}

function buildInvestorWatchpoints({
  ai,
  crypto,
  macro,
  rates,
  risk,
  taiwan,
}: {
  ai?: NormalizedNewsItem;
  crypto?: NormalizedNewsItem;
  macro?: NormalizedNewsItem;
  rates?: NormalizedNewsItem;
  risk?: NormalizedNewsItem;
  taiwan?: NormalizedNewsItem;
}) {
  const watchpoints = [
    ai ? "AI proof：觀察企業軟體、雲端支出與半導體供應鏈是否同時驗證 AI 支出。" : "AI proof：確認 AI 主線是否仍有資金與基本面支撐。",
    rates || macro ? "Rates / Treasury yields：觀察長端利率是否限制科技股估值擴張。" : "Rates / Treasury yields：若利率回升，風險資產容錯率會下降。",
    "Enterprise software spending：確認 AI 需求是否從晶片擴散到企業軟體與資料庫。",
    crypto ? "Crypto liquidity：觀察 BTC / ETH、ETF flow 與 stablecoin liquidity 是否支持風險偏好。" : "Crypto liquidity：沒有重大催化時，仍作為風險偏好溫度計。",
    taiwan ? "Taiwan AI supply chain：觀察台股 AI 供應鏈是否跟上全球 AI 資本支出。" : "Taiwan AI supply chain：觀察半導體供應鏈與美股科技股連動。",
    risk ? "Risk regime：觀察 VIX、美元、利率與市場廣度是否同向。" : "Risk regime：確認低波動是否掩蓋集中度風險。",
  ];

  return watchpoints.slice(0, 6);
}

function buildExecutiveSummary({
  intelligence,
  marketInterpretation,
  todaySignal,
  topThreeThings,
  watchpoints,
}: {
  intelligence: Pick<DailyIntelligenceDraft, "macroRatesObservation" | "aiTechObservation" | "cryptoObservation" | "marketRegimeNote">;
  marketInterpretation: string;
  todaySignal: string;
  topThreeThings: DailyTopStory[];
  watchpoints: string[];
}) {
  const fallback = [
    cleanIntelligenceSentence(intelligence.macroRatesObservation, "利率與美元仍是今日市場定價核心。", 44),
    cleanIntelligenceSentence(intelligence.aiTechObservation, "AI / Tech 主線需觀察資金是否擴散。", 44),
    cleanIntelligenceSentence(intelligence.cryptoObservation, "BTC / ETH 反映流動性與風險偏好。", 44),
    cleanIntelligenceSentence(intelligence.marketRegimeNote, "Risk regime 需確認利率、美元與波動率。", 44),
    "FCN 觀察聚焦 KO / KI / Worst Performer 結構。",
  ];
  const primary = [
    cleanIntelligenceSentence(todaySignal.replace(/^今日最重要的訊號是[:：]\s*/, ""), fallback[0], 44),
    ...topThreeThings.map((item) => cleanIntelligenceSentence(`${item.headline}，${item.watchpoint}`, item.headline, 44)),
    cleanIntelligenceSentence(marketInterpretation, fallback[3], 44),
    cleanIntelligenceSentence(watchpoints[0], fallback[4], 44),
  ].filter(Boolean);

  return Array.from({ length: 5 }, (_, index) => compactText(primary[index] ?? fallback[index], fallback[index], 44));
}

function buildRiskRegimeReasoning(items: NormalizedNewsItem[], marketRegime: DailyIntelligenceDraft["marketRegime"]): DailyRiskRegimeReasoning {
  const rates = firstByCategories(items, ["rates", "macro"]);
  const risk = byCategory(items, "risk");
  const crypto = byCategory(items, "crypto");
  const current = marketRegime === "risk-off" ? "High" : marketRegime === "risk-on" ? "Moderate" : "Elevated";

  return {
    current,
    reasons: [
      cleanIntelligenceSentence(rates?.summary, "VIX / volatility signal 尚未全面失控，但利率與美元仍可能壓抑風險資產估值。", 86),
      cleanIntelligenceSentence(risk?.summary, "美債殖利率若維持高檔，科技股估值容錯率下降。", 86),
      cleanIntelligenceSentence(crypto?.summary, "USD liquidity 與 BTC / ETH beta 仍是判斷風險偏好的輔助訊號。", 86),
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
  const aiContext = ai
    ? "本輪 AI 行情已不只是晶片股行情，而是逐步擴散到雲端、資料庫與企業軟體。"
    : "今日市場主線仍需要從資金流、利率與產業能見度三個角度同時判讀。";
  const macroContext = rates ?? macro
    ? "短期仍需留意利率與估值壓力，因為長端利率會直接影響高成長資產的容錯率。"
    : "如果缺少明確總經催化，市場更容易回到風險偏好與估值位置的拉扯。";
  const cryptoContext = crypto
    ? "Crypto 的角色仍偏向流動性與風險偏好的溫度計，不宜把單日波動解讀成獨立趨勢。"
    : "Crypto 若沒有重大催化，仍可用來觀察市場對流動性與槓桿風險的敏感度。";
  const riskContext = risk
    ? "風險上，重點不是預測單一方向，而是確認利率、美元、波動率與市場廣度是否同向。"
    : "一玄會優先觀察市場正在 pricing 什麼，再決定哪些主題值得持續追蹤。";

  return [aiContext, macroContext, cryptoContext, riskContext].join("");
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
  const coverageScore = buildCoverageScore(newsItems);
  const riskRegimeReasoning = buildRiskRegimeReasoning(newsItems, intelligence.marketRegime);
  const fcnAwareness = buildFcnAwareness(intelligence.generatedAt);
  const insight = buildIXAIInsight({
    newsItems,
    period: "daily",
  });
  const questionDriven = insight.questionDriven;
  const todaySignal = cleanIntelligenceSentence(
    `${questionDriven.centralQuestion} ${questionDriven.keyAnswer}`,
    buildTodaySignal({ ai, macro, rates, risk }),
    150,
  );
  const fallbackTopThree = buildTopThreeThings({ macro, rates, taiwan });
  const topThreeThings = [
    ...insight.keyEvents.slice(0, 3).map((event, index) => ({
    headline: cleanIntelligenceSentence(event.title, fallbackTopThree[index]?.headline ?? "市場事件需要人工審閱。", 54),
    whatHappened: cleanIntelligenceSentence(event.sourceContext, "公開來源捕捉到此市場事件。", 76),
    whyItMatters: cleanIntelligenceSentence(event.whyItMatters, "此事件有助於判斷市場主線與風險偏好。", 96),
    watchpoint: cleanIntelligenceSentence(
      questionDriven.evidence[index] ?? insight.marketSignals[index]?.implication ?? insight.whatToWatchNext,
      "觀察此事件是否改變利率、AI、Crypto 或風險偏好。",
      86,
    ),
  })),
    ...fallbackTopThree,
  ].slice(0, 3);
  const marketInterpretation = [
    `Key Answer：${questionDriven.keyAnswer}`,
    `Counter Evidence：${questionDriven.counterEvidence[0] ?? insight.narrativeTension}`,
    `What Changes My Mind：${questionDriven.whatChangesMyMind[0] ?? insight.whatChanged}`,
  ].join(" ");
  const investorWatchpoints = [
    ...questionDriven.watchNext,
    ...questionDriven.whatChangesMyMind,
    ...buildInvestorWatchpoints({ ai, crypto, macro, rates, risk, taiwan }),
  ].slice(0, 6);
  const macroWatch = {
    headline: "Macro Watch",
    whatHappened: cleanIntelligenceSentence(rates?.summary ?? macro?.summary, "Fed、Treasury yield、美元與通膨資料仍是今日風險資產的定價核心。", 120),
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
      "半導體、雲端與企業軟體仍是 AI 資金關注主軸。",
      "台灣 AI supply chain 需同步觀察美股科技股、外資流向與匯率壓力。",
      "AI / Tech 的重點不是單一 headline，而是資本支出、供應鏈能見度與估值容錯率是否同向。",
      "若領漲只集中在少數 megacap，市場廣度不足會放大回撤敏感度。",
    ],
  };
  const cryptoWatch = {
    headline: crypto ? "Crypto Watch" : "No major crypto catalyst today.",
    observations: crypto
      ? [
          cleanIntelligenceSentence(crypto.summary, "BTC / ETH 仍是流動性與風險偏好的高 beta 觀察區。", 96),
          "ETF flow、stablecoin liquidity 與槓桿資金變化是今日 crypto risk appetite 的主要觀察方向。",
          "若美元與實質利率走強，Crypto beta 可能先於股票市場反映壓力。",
        ]
      : ["No major crypto catalyst today.", "仍需觀察 BTC / ETH、ETF flow、stablecoin liquidity 與高槓桿資金是否出現風險偏好轉折。"],
  };
  const ixuanView = insight.ixuanView || buildIxuanView({ ai, crypto, macro, rates, risk });
  const executiveSummary = buildExecutiveSummary({
    intelligence,
    marketInterpretation,
    todaySignal,
    topThreeThings,
    watchpoints: investorWatchpoints,
  });
  const textParts = [
    todaySignal,
    intelligence.todayHeadline,
    intelligence.marketRegimeNote,
    ...executiveSummary,
    ...topThreeThings.flatMap((item) => [item.headline, item.whatHappened, item.whyItMatters, item.watchpoint]),
    marketInterpretation,
    ...investorWatchpoints,
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
    todaySignal,
    topThreeThings,
    marketInterpretation,
    investorWatchpoints,
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
    insight,
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
  options: {
    previousBriefs?: DailyBriefDraft[];
    slugSuffix?: string;
    sourceMode?: NewsIntakeMode;
    sourceLabels?: string[];
    sourceStatus?: NewsSourceStatus[];
  } = {},
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
  intelligence = attachDailyIntelligenceCore(
    attachMarketMemoryToDailyIntelligence(intelligence, options.previousBriefs),
    {
      contentFunnelTarget: `/daily-brief/${slug}`,
      headline: intelligence.todayHeadline,
    },
  );
  const engineMarketSummary = [
    intelligence.todaySignal,
    intelligence.marketInterpretation,
    intelligence.macroWatch?.marketMeaning,
    intelligence.riskRegimeReasoning
      ? `Current Risk Regime: ${intelligence.riskRegimeReasoning.current}。${intelligence.riskRegimeReasoning.reasons.join(" ")}`
      : intelligence.marketRegimeNote,
  ].filter(Boolean).join(" ");
  const sections: DailyBriefDraft["sections"] = [
    {
      category: "today_signal",
      headline: "Central Question：今天市場最重要的問題。",
      summary: intelligence.todaySignal ?? intelligence.todayHeadline,
      ixaiView: "Daily Brief 先提出今天市場真正想解答的問題，再用證據、反證與下一步觀察回答它。",
    },
    {
      category: "top_three_things",
      headline: "今日最重要的三件事。",
      summary: (intelligence.topThreeThings ?? [])
        .map((item, index) => [
          `${index + 1}. ${item.headline}`,
          `發生什麼：${item.whatHappened}`,
          `為何重要：${item.whyItMatters}`,
          `觀察重點：${item.watchpoint}`,
        ].join(" "))
        .join(" "),
      ixaiView: "三大重點將新聞轉成市場解讀，讓讀者知道該觀察什麼，而不是只讀分類摘要。",
    },
    {
      category: "market_interpretation",
      headline: "Key Answer / Counter Evidence：把新聞轉成市場解讀。",
      summary: intelligence.marketInterpretation ?? intelligence.marketRegimeNote,
      ixaiView: "Market Interpretation 聚焦市場正在 pricing 的主線、限制條件與風險脈絡。",
    },
    {
      category: "what_changed",
      headline: "What Changed Since Last Brief：市場敘事是否延續或轉向。",
      summary: intelligence.whatChangedSinceLastBrief ?? "IXAI 正在建立 Daily Intelligence 的市場記憶層，追蹤主線延續、升溫與降溫。",
      ixaiView: "Market Memory 只追蹤公開市場敘事與風險脈絡，不做個人化投資建議、買賣指令或報酬承諾。",
    },
    {
      category: "continuity_tags",
      headline: "Continuity Tags：後續 Brief 將持續追蹤的市場主題。",
      summary: (intelligence.continuityTags ?? [])
        .map((tag) => `#${tag}`)
        .join(" "),
      ixaiView: "Continuity Tags 用來把 Daily、Social Pack 與未來 Weekly Intelligence 接上同一組市場敘事。",
    },
    {
      category: "investor_watchpoints",
      headline: "Investor Watchpoints：非個人化觀察清單。",
      summary: (intelligence.investorWatchpoints ?? intelligence.whatToMonitor)
        .map((item) => `・${item}`)
        .join(" "),
      ixaiView: "Investor Watchpoints 是公開市場觀察清單，不是個人化投資建議或交易指令。",
    },
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
      headline: "AI / Tech Watch：追蹤大型科技、半導體與 AI 支出證據。",
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
        cleanIntelligenceSentence(
          taiwan?.summary,
          "台股與半導體供應鏈仍受 AI 資本支出、外資流向與匯率節奏影響，短線需同步觀察美股科技股與美元走勢。",
          150,
        ),
      ixaiView:
        "IXAI 會把台積電與供應鏈視為全球 AI trade 的延伸，而不是只看單一台股行情。",
    },
  ];

  return {
    id: `generated-${slug}`,
    slug,
    status: "review",
    title: intelligence.insight?.questionDriven.centralQuestion ?? intelligence.todayHeadline,
    marketSummary: `${generatedMarketSummary} ${engineMarketSummary}`,
    editorialNote: intelligence.ixuanView ?? intelligence.marketRegimeNote,
    sections,
    riskFocus: intelligence.whatToMonitor,
    intelligence,
    createdAt: now,
    updatedAt: now,
  };
}
