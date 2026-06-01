import type { DailyBriefDraft, WeeklyIntelligenceDraft } from "@/src/types/editorial";
import { getDailyIntelligenceCoreFromBrief } from "@/src/lib/intelligence/core";
import { ensureDistinctNarratives } from "@/src/lib/intelligence/insight/repetition-detector";

export type SocialPackKind = "daily" | "weekly";
export type SocialExportFormat = "ig_feed_4_5" | "story_9_16";

export type SocialPackSlide =
  | "cover"
  | "top_news"
  | "ai_tech_watch"
  | "fcn_risk_watch"
  | "ixuan_view"
  | "market_review"
  | "weekly_view";

export type SocialIntelligenceSlide = {
  id: SocialPackSlide;
  eyebrow: string;
  title: string;
  subtitle?: string;
  bullets: string[];
  footer?: string;
};

export type SocialIntelligencePack = {
  kind: SocialPackKind;
  title: string;
  subtitle: string;
  dateLabel: string;
  sourceBriefId?: string;
  slides: SocialIntelligenceSlide[];
  disclaimer: string;
  caption: string;
  cta: {
    label: string;
    href: string;
  };
};

const APP_URL = "app.ixuan.ai";
const DISCLAIMER =
  "市場資訊與教育分享，非個人化投資建議。Market intelligence and education only. Not personalized investment advice.";
export const socialBrandTokens = {
  cream: "#F4F0E6",
  dark: "#071A16",
  forest: "#0F2E27",
  gold: "#B99A63",
};

export const socialExportFormats: Record<
  SocialExportFormat,
  {
    aspectRatio: "4 / 5" | "9 / 16";
    description: string;
    height: number;
    label: string;
    platform: string;
    width: number;
  }
> = {
  ig_feed_4_5: {
    aspectRatio: "4 / 5",
    description: "IG Feed / Carousel 主力格式，適合 Facebook / Threads 直式貼文。",
    height: 1350,
    label: "IG Feed / Carousel 4:5",
    platform: "Instagram Feed · Facebook · Threads",
    width: 1080,
  },
  story_9_16: {
    aspectRatio: "9 / 16",
    description: "Story / Reels / LINE 導流格式，適合大 hook 與完整日報 CTA。",
    height: 1920,
    label: "Story / Reels 9:16",
    platform: "IG Story · Reels · LINE",
    width: 1080,
  },
};

function formatDateLabel(value?: string) {
  if (!value) {
    return new Date().toLocaleDateString("zh-TW", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("zh-TW", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function compactText(value?: string, fallback = "IXAI 已整理今日市場脈絡與風險觀察。", maxLength = 74) {
  const normalized = normalizeSocialCopy(value, fallback)
    .replace(/([，。！？；])\s*[，。]+/g, "$1")
    .replace(/([。！？；])，/g, "$1");

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const clauses = normalized
    .split(/(?<=[。！？.!?；;])|\s[|]\s|，|,/)
    .map((part) => part.trim())
    .filter(Boolean);
  let output = "";

  for (const clause of clauses) {
    const separator = /[。！？.!?；;]$/.test(output) ? "" : "，";
    const next = output ? `${output}${separator}${clause}` : clause;
    if (next.length > maxLength) {
      break;
    }
    output = next;
  }

  return output ? (/[。！？.!?；;]$/.test(output) ? output : `${output}。`) : fallback;
}

function normalizeSocialCopy(value?: string, fallback = "IXAI 已整理今日市場脈絡與風險觀察。") {
  return (value ?? fallback)
    .replace(/\*\*/g, "")
    .replace(/…/g, "")
    .replace(/相較前一份 Brief[，：:]?\s*/g, "")
    .replace(/相較最近\s*\d+\s*份 Daily Intelligence[，：:]?\s*/g, "")
    .replace(/點進 IXAI App 看完整 Daily Brief/g, "想看完整市場訊號與下一步觀察，請進 IXAI App 讀 Daily Brief")
    .replace(/完整內容請見 IXAI App/g, "想看完整市場訊號與下一步觀察，請進 IXAI App")
    .replace(/市場訊號正在轉向/g, "市場正在重新篩選可被證明的主線")
    .replace(/投資人持續觀察/g, "資金會檢查")
    .replace(/風險偏好受到壓力/g, "風險資產的容錯率下降")
    .replace(/值得關注|持續關注/g, "需要用可觀察資料驗證")
    .replace(/市場情緒變化/g, "資金定價條件改變")
    .replace(/事件背後的市場訊號/g, "市場正在要求的證據")
    .replace(/AI\s*敘事仍有吸引力/g, "資金仍願意買 AI")
    .replace(/([，。！？；])\s*[，。]+/g, "$1")
    .replace(/([。！？；])，/g, "$1")
    .replace(/Short Insight|Observation\s*\d+/gi, "")
    .replace(/今日市場焦點已整理為公開情報與風險觀察/g, "今日市場主線聚焦 AI 需求、利率壓力與風險偏好。")
    .replace(/^[\s\-\d.①②③④⑤、]+/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/buy now|must buy|sell now/gi, "monitor")
    .replace(/guaranteed return/gi, "risk-awareness context")
    .replace(/買進|買入|必買/g, "觀察")
    .replace(/賣出|必賣/g, "風險控管")
    .replace(/保證收益|保證報酬|穩賺|必漲/g, "風險情境");
}

function isMostlyEnglish(value: string) {
  const cjkCount = (value.match(/[\u4e00-\u9fff]/g) ?? []).length;
  return cjkCount < Math.max(6, value.length * 0.18);
}

function readableSnippet(value?: string, fallback = "維持風險意識與情境判讀。", maxLength = 52) {
  const normalized = normalizeSocialCopy(value, fallback);

  if (!normalized || isMostlyEnglish(normalized)) {
    return fallback;
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const clauses = normalized
    .split(/(?<=[。！？.!?；;])|\s[|]\s|，|,/)
    .map((part) => part.trim())
    .filter(Boolean);
  let output = "";

  for (const clause of clauses) {
    const separator = /[。！？.!?；;]$/.test(output) ? "" : "，";
    const next = output ? `${output}${separator}${clause}` : clause;
    if (next.length > maxLength) {
      break;
    }
    output = next;
  }

  if (output) {
    return /[。！？.!?；;]$/.test(output) ? output : `${output}。`;
  }

  return fallback;
}

function socialPoint(label: string, value?: string, fallback = "維持市場脈絡與風險觀察。", maxLength = 38) {
  return `${label}｜${readableSnippet(value, fallback, maxLength)}`;
}

function evidenceSocialPoint(label: string, evidence?: { event: string; source: string; whyItMatters: string }) {
  if (!evidence) {
    return `${label}｜等待 editor 補充具體事件與來源。`;
  }

  return `${label}｜${readableSnippet(evidence.event, "具體事件待 editor 審閱。", 54)} ${readableSnippet(evidence.whyItMatters, "此事件用來驗證市場主線。", 54)}`;
}

function evidenceLabel(category?: string, fallback = "Evidence") {
  if (category === "macro") return "Macro";
  if (category === "ai-tech") return "AI / Tech";
  if (category === "taiwan") return "Taiwan";
  if (category === "crypto") return "Crypto";
  if (category === "risk") return "Risk";
  return fallback;
}

function distinctSocialValue(
  value: string | undefined,
  previousValues: string[],
  fallback: string,
  maxLength = 48,
) {
  const candidate = readableSnippet(value, fallback, maxLength);
  const normalizedCandidate = normalizeSocialCopy(candidate);
  const candidateSentences = normalizedCandidate
    .split(/[。！？!?；;]/)
    .map((part) => part.trim())
    .filter(Boolean);
  const hasRepeatedSentence =
    candidateSentences.length > 1 && new Set(candidateSentences).size < candidateSentences.length;
  const isDuplicate = previousValues.some((previous) => normalizeSocialCopy(previous) === normalizedCandidate);

  return isDuplicate || hasRepeatedSentence ? fallback : candidate;
}

function firstItems<T>(items: T[] | undefined, count: number) {
  return Array.isArray(items) ? items.slice(0, count) : [];
}

function executiveSummaryBullets(source?: DailyBriefDraft | null) {
  const sourceItems = [
    source?.intelligence?.todaySignal?.replace(/^今日最重要的訊號是[:：]\s*/, ""),
    "AI 企業軟體股重新吸引資金。",
    "利率仍是科技股估值壓力來源。",
    "台股 AI 供應鏈延續全球 AI trade。",
    "Crypto 流動性維持高波動。",
    "FCN 投資人需留意波動率與下檔距離。",
  ];

  const bullets = sourceItems
    .filter((item): item is string => Boolean(item && item.trim()))
    .map((item) => readableSnippet(item, "今日市場主線聚焦 AI 需求、利率壓力與風險偏好。", 36))
    .filter(Boolean);

  const fallback = [
    "AI 企業軟體股重新吸引資金。",
    "利率仍是科技股估值壓力來源。",
    "台股 AI 供應鏈延續全球 AI trade。",
    "Crypto 流動性維持高波動。",
    "FCN 投資人需留意波動率與下檔距離。",
  ];

  return firstItems(Array.from(new Set([...bullets, ...fallback])), 5);
}

function dailyMarketPulse(source?: DailyBriefDraft | null) {
  const macro = source?.intelligence?.macroWatch;
  const risk = source?.intelligence?.riskRegimeReasoning;
  const ai = source?.intelligence?.aiTechWatch;
  const interpretation = source?.intelligence?.marketInterpretation;
  const sections = firstItems(source?.sections, 3);

  if (macro || risk || ai) {
    return [
      socialPoint("Macro", macro?.whatHappened ?? macro?.marketMeaning ?? sections[0]?.headline, "美元與利率仍牽動風險偏好。"),
      socialPoint("AI", interpretation ?? ai?.observations?.[0] ?? sections[1]?.headline, "資金從晶片延伸到企業軟體。"),
      socialPoint("Risk", risk?.reasons?.[0] ?? sections[2]?.summary, "高估值環境下，波動率容易放大。"),
    ];
  }

  return sections.length > 0
    ? sections.map((section) => socialPoint(section.category || "Market", section.ixaiView ?? section.summary ?? section.headline))
    : [
        "Macro｜利率、美元與波動率影響風險偏好。",
        "AI｜半導體與 data center 仍是資金觀察主軸。",
        "Risk｜公開情報以情境觀察為主，不作交易指令。",
      ];
}

function dailyAiTechPoints(source?: DailyBriefDraft | null) {
  const aiWatch = source?.intelligence?.aiTechWatch;
  const observations = firstItems(aiWatch?.observations, 3).map((item) =>
    readableSnippet(item, "觀察 AI supply chain 與科技資金節奏。", 42),
  );
  const interpretation = readableSnippet(
    source?.intelligence?.marketInterpretation,
    "AI 需求可能從晶片擴散到雲端與企業軟體。",
    48,
  );

  return [
    socialPoint("Key Signal", interpretation, "AI 需求可能從晶片擴散到雲端與企業軟體。", 48),
    socialPoint("Why It Matters", observations[0], "若擴散成立，AI 會從個股行情轉為產業效率敘事。", 48),
    socialPoint("Watch Next", observations[1] ?? observations[2], "觀察雲端、企業軟體與半導體供應鏈是否同向。", 48),
  ];

}

function dailyRiskPoints(source?: DailyBriefDraft | null) {
  const risk = source?.intelligence?.riskRegimeReasoning;
  const fcn = source?.intelligence?.fcnAwareness;
  const reasons = firstItems(risk?.reasons, 3).map((reason) =>
    readableSnippet(reason, "觀察波動率、美元與利率同步變化。", 42),
  );

  return [
    `Risk State｜${risk?.current ?? "Elevated"}`,
    ...(reasons.length > 0
      ? reasons.map((reason, index) => `Reason ${index + 1}｜${reason}`)
      : [
          "Reason 1｜觀察波動率、美元與利率同步變化。",
          "Reason 2｜高 beta 資產對風險偏好更敏感。",
        ]),
    `FCN Awareness｜${fcn?.topic ?? "KO / KI"}：${readableSnippet(fcn?.explanation ?? fcn?.reminder, "理解 KO / KI / Worst Performer 等結構概念。", 46)}`,
  ];
}

function dailyIxuanView(source?: DailyBriefDraft | null) {
  const candidate =
    source?.intelligence?.ixuanView ??
    source?.editorialNote ??
    source?.intelligence?.marketInterpretation ??
    source?.intelligence?.marketRegimeNote ??
    source?.marketSummary;
  const normalized = normalizeSocialCopy(candidate, "");

  if (normalized && !isMostlyEnglish(normalized)) {
    const view = readableSnippet(normalized, "", 150);
    if (view.length >= 54 && /[。！？]/.test(view)) {
      return view;
    }
  }

  return "本輪 AI 行情已不只是晶片股行情，而是逐步擴散到雲端、資料庫與企業軟體。短期仍需留意利率與估值壓力，但只要企業 AI 資本支出沒有反轉，市場主線仍可能圍繞 AI 基礎設施與軟體效率展開。";
}

function appHref(target?: string) {
  if (!target) {
    return "https://app.ixuan.ai/daily-brief";
  }

  if (/^https?:\/\//i.test(target)) {
    return target;
  }

  return `https://app.ixuan.ai${target.startsWith("/") ? target : `/${target}`}`;
}

function buildDailyCaption() {
  return [
    "【一玄每日 AI 投資日報】",
    "今日重點不是新聞數量，而是市場正在要求什麼證據：",
    "・今天最大事件",
    "・市場訊號與風險拉扯",
    "・AI / Tech 與 FCN awareness",
    "・一玄觀點",
    "想看完整市場訊號與下一步觀察，請進 IXAI App 讀 Daily Brief：",
    APP_URL,
    DISCLAIMER,
  ].join("\n");
}

function buildWeeklyCaption() {
  return [
    "【一玄每週 AI 投資週報】",
    "本週重點不是單日新聞加總，而是市場敘事的轉折：",
    "・本週最大市場轉折",
    "・三個市場訊號",
    "・AI / Tech 主線",
    "・Risk / FCN awareness",
    "想看完整市場訊號與下週觀察，請進 IXAI App 讀 Weekly Intelligence：",
    APP_URL,
    DISCLAIMER,
  ].join("\n");
}

export function generateDailySocialPack(source?: DailyBriefDraft | null): SocialIntelligencePack {
  const dateLabel = formatDateLabel(source?.publishedAt ?? source?.updatedAt);
  const core = source ? getDailyIntelligenceCoreFromBrief(source) : null;
  const fallbackSummary = executiveSummaryBullets(source);
  const insight = source?.intelligence?.insight;
  const questionDriven = insight?.questionDriven;
  const dailyEvidence = questionDriven?.evidenceDetails ?? [];
  const dailyAiEvidence =
    dailyEvidence.find((item) => item.category === "ai-tech" || item.category === "taiwan") ??
    dailyEvidence[0];
  const stopScrollBullets = core
    ? [
        readableSnippet("今天要問的不是 AI 熱不熱，而是誰能拿出現金流證據。", "今天要問的不是 AI 熱不熱，而是誰能拿出證據。", 50),
      ]
    : firstItems(fallbackSummary, 2);
  const curiosityBullets = core
    ? (() => {
        const curiosity = readableSnippet(
          questionDriven?.keyAnswer ?? insight?.socialFunnel.conflict ?? core.socialCuriosity,
          "資金沒有離開主線，但正在篩選能交出證據的公司。",
          58,
        );
        const thesis = distinctSocialValue(
          questionDriven?.keyAnswer ?? insight?.whyItMatters ?? core.socialThesis,
          [curiosity],
          "真正要看的不是題材熱度，而是證據是否擴散到財報、訂單與現金流。",
          58,
        );

        return [curiosity, thesis];
      })()
    : firstItems(dailyMarketPulse(source), 2);
  const aiTech = core
    ? (() => {
        const keySignal = readableSnippet(
          dailyAiEvidence?.event ?? questionDriven?.evidence[0] ?? core.socialHooks.aiTechSignal.keySignal,
          "AI 需求需要用財報、訂單與資本支出驗證。",
          48,
        );
        const whyItMatters = distinctSocialValue(
          dailyAiEvidence?.whyItMatters ?? questionDriven?.evidence[1] ?? core.socialHooks.aiTechSignal.whyItMatters,
          [keySignal],
          "如果證據擴散，AI 會從個股行情變成產業現金流問題。",
          48,
        );
        const watchNext = distinctSocialValue(
          questionDriven?.watchNext[0] ?? core.socialHooks.aiTechSignal.watchNext,
          [keySignal, whyItMatters],
          "觀察雲端、企業軟體與半導體供應鏈是否同向。",
          48,
        );

        return [
          `Key Signal｜${keySignal}`,
          `Why It Matters｜${whyItMatters}`,
          `Watch Next｜${watchNext}`,
        ];
      })()
    : insight
      ? [
          `Key Signal｜${readableSnippet(insight.marketSignals[0]?.signal, "AI / Tech 訊號正在測試市場風險偏好。", 48)}`,
          `Why It Matters｜${readableSnippet(insight.marketSignals[0]?.implication ?? insight.whyItMatters, "這會影響科技成長與高 beta 風險承受度。", 48)}`,
          `Watch Next｜${readableSnippet(insight.whatToWatchNext, "觀察 AI、利率與風險偏好是否同向。", 48)}`,
        ]
      : dailyAiTechPoints(source);
  const riskPoints = core
    ? [
        `Risk State｜${source?.intelligence?.riskRegimeReasoning?.current ?? "Elevated"}`,
        `Counter Evidence｜${readableSnippet(questionDriven?.counterEvidence[1] ?? insight?.narrativeTension ?? core.socialHooks.riskHook, "如果利率與美元同向走高，估值容錯率會下降。", 54)}`,
        `FCN Awareness｜${source?.intelligence?.fcnAwareness?.topic ?? "KO / KI"}：${readableSnippet(source?.intelligence?.fcnAwareness?.explanation, "理解 KO / KI / Worst Performer 等結構概念。", 46)}`,
      ]
    : dailyRiskPoints(source);
  const dailyInsight = readableSnippet(questionDriven?.ixuanView ?? insight?.ixuanView ?? core?.socialHooks.ixuanHook ?? dailyIxuanView(source), "一玄觀點聚焦市場正在 pricing 什麼，而不是單一新聞。", 120);
  const dailyTarget = core?.contentFunnelTarget ?? (source?.slug ? `/daily-brief/${source.slug}` : "/daily-brief");
  const dailyCta = insight?.socialFunnel.cta ?? core?.socialCTA ?? "想看今天的證據、反證與下一步觀察，請進 IXAI App 讀 Daily Brief。";
  const socialTitle = questionDriven?.centralQuestion ?? insight?.socialFunnel.hook ?? core?.headlineHook ?? source?.title ?? "今日市場最重要的事";
  const dailySlideBullets = ensureDistinctNarratives(
    [
      stopScrollBullets[0] ?? "",
      curiosityBullets[0] ?? "",
      aiTech[0] ?? "",
      riskPoints[1] ?? "",
      dailyInsight,
    ],
    [
      "今天要問的不是題材熱不熱，而是證據能不能延續。",
      "短答案：資金開始挑選能交出結果的公司。",
      "具體證據來自企業採用、資本支出與供應鏈事件。",
      "風險在於利率與美元讓估值容錯率下降。",
      "一玄觀點聚焦現金流證據，而不是 headline 熱度。",
    ],
  );

  return {
    caption: buildDailyCaption(),
    cta: {
      href: appHref(dailyTarget),
      label: "閱讀完整 Daily Brief",
    },
    dateLabel,
    disclaimer: DISCLAIMER,
    kind: "daily",
    sourceBriefId: source?.id,
    subtitle: "Daily Intelligence",
    title: socialTitle,
    slides: [
      {
        bullets: [dailySlideBullets[0]],
        eyebrow: "Daily Intelligence",
        footer: "Social Pack → Daily Brief",
        id: "cover",
        subtitle: "一玄資訊",
        title: socialTitle,
      },
      {
        bullets: [dailySlideBullets[1], curiosityBullets[1]].filter(Boolean),
        eyebrow: "Why It Matters",
        footer: "人工審閱後供手動發布",
        id: "top_news",
        title: "為什麼值得點進去看",
      },
      {
        bullets: [dailySlideBullets[2], ...aiTech.slice(1)],
        eyebrow: "IXAI Tech Intelligence",
        id: "ai_tech_watch",
        title: "AI / 科技觀察",
      },
      {
        bullets: [riskPoints[0], dailySlideBullets[3], riskPoints[2]].filter(Boolean),
        eyebrow: "FCN Awareness",
        id: "fcn_risk_watch",
        title: "Risk Regime",
      },
      {
        bullets: [dailySlideBullets[4], dailyCta],
        eyebrow: "I-Xuan View",
        footer: `${dailyCta} · app.ixuan.ai`,
        id: "ixuan_view",
        title: "I-Xuan View / 一玄觀點",
      },
    ],
  };
}

export function generateWeeklySocialPack(source?: WeeklyIntelligenceDraft | null): SocialIntelligencePack {
  const dateLabel =
    source?.weekStart && source.weekEnd
      ? `${formatDateLabel(source.weekStart)} - ${formatDateLabel(source.weekEnd)}`
      : formatDateLabel(source?.publishedAt ?? source?.updatedAt);
  const periodic = source?.sections.periodicNarrative;
  const insight = source?.sections.insight;
  const questionDriven = insight?.questionDriven;
  const weeklyEvidence = questionDriven?.evidenceDetails ?? [];
  const weeklyAiEvidence = weeklyEvidence.find((item) => item.category === "ai-tech" || item.category === "taiwan");
  const weeklyMacroEvidence = weeklyEvidence.find((item) => item.category === "macro");
  const weeklyCryptoEvidence = weeklyEvidence.find((item) => item.category === "crypto");
  const weeklyView =
    questionDriven?.ixuanView ??
    insight?.ixuanView ??
    periodic?.ixuanView ??
    source?.sections.intelligenceSummary.pricing ??
    source?.aiSuggestion.intelligenceNarrative ??
    "本週核心不在單一新聞，而是利率、AI 科技與風險偏好如何共同改變市場定價。";
  const weeklyTarget = source?.slug ? `/weekly-brief/${source.slug}` : "/weekly-brief";
  const weeklyHref = appHref(weeklyTarget);
  const weeklyCta = insight?.socialFunnel.cta ?? periodic?.clearCTA ?? "想看本週證據、反證與下週觀察，請進 IXAI App 讀 Weekly Intelligence。";
  const weeklySignalLabels = ["Macro", "AI / Tech", "Risk"];
  const weeklySignals = (
    weeklyEvidence.length
      ? [weeklyAiEvidence, weeklyMacroEvidence, weeklyCryptoEvidence]
          .filter((item): item is NonNullable<typeof item> => Boolean(item))
          .slice(0, 3)
          .map((item, index) => evidenceSocialPoint(evidenceLabel(item.category, weeklySignalLabels[index]), item))
      : questionDriven?.evidence.length
      ? questionDriven.evidence.slice(0, 3).map((signal, index) => `${weeklySignalLabels[index] ?? "Evidence"}｜${signal}`)
      : insight?.marketSignals.length
      ? insight.marketSignals.slice(0, 3).map((signal, index) => `${weeklySignalLabels[index] ?? "Signal"}｜${signal.signal} ${signal.implication}`)
      : periodic?.whatToWatchNext.length
      ? periodic.whatToWatchNext.slice(0, 3)
      : [
          "Macro｜利率與美元仍牽動風險偏好。",
          "AI / Tech｜AI 科技主線需要財報與資本支出驗證。",
          "Risk｜Crypto 與高 beta 資產維持波動觀察。",
        ]
  ).map((signal, index) => {
    if (signal.includes("｜")) {
      return signal;
    }

    return `${weeklySignalLabels[index] ?? "Watch"}｜${signal}`;
  });
  const weeklyRisk =
    periodic?.riskNarrative ??
    source?.sections.intelligenceSummary.riskTone ??
    "本週風險環境以波動、利率與美元節奏為核心。";
  const weeklyNextWeek = questionDriven?.watchNext.length
    ? questionDriven.watchNext.slice(0, 3)
    : source?.sections.nextWeekFocus?.slice(0, 3) ?? [];
  const weeklySlideBullets = ensureDistinctNarratives(
    [
      questionDriven?.counterEvidence[0] ?? "",
      weeklySignals[0] ?? "",
      questionDriven?.keyAnswer ?? "",
      weeklyNextWeek[0] ?? "",
      weeklyView,
    ],
    [
      "本週真正問題是 AI 是否正在從故事換手到證據。",
      "本週變化來自企業採用、資金流與下週事件。",
      "單一主線：市場開始從 AI 故事轉向 AI 現金流。",
      "下週觀察：法說、通膨與利率是否支持科技估值。",
      "一玄週觀點：看誰能把 AI 變成財報，而不是誰最會講 AI。",
    ],
  );

  return {
    caption: buildWeeklyCaption(),
    cta: {
      href: weeklyHref,
      label: weeklyCta,
    },
    dateLabel,
    disclaimer: DISCLAIMER,
    kind: "weekly",
    sourceBriefId: source?.id,
    subtitle: "Weekly Intelligence",
    title: questionDriven?.centralQuestion ?? insight?.socialFunnel.hook ?? periodic?.socialHook ?? "本週市場最大轉折是什麼？",
    slides: [
      {
        bullets: [
          compactText(weeklySlideBullets[0], "本週真正問題是 AI 是否正在從故事換手到證據。", 58),
        ],
        eyebrow: "Weekly Intelligence",
        footer: "Institutional Research · Weekly Intelligence",
        id: "cover",
        subtitle: "一玄資訊",
        title: questionDriven?.centralQuestion ?? insight?.socialFunnel.hook ?? periodic?.socialHook ?? "本週市場最大轉折是什麼？",
      },
      {
        bullets: [
          ...weeklySignals.slice(0, 3),
        ],
        eyebrow: "Market Review",
        id: "market_review",
        title: "What Changed This Week",
      },
      {
        bullets: [
          compactText(weeklySlideBullets[2], "市場開始從 AI 故事轉向 AI 現金流。", 72),
          compactText(questionDriven?.whatChangesMyMind[0], "若企業 guidance 轉強，AI 主線才更有延續性。", 62),
        ],
        eyebrow: "AI / Tech Weekly",
        id: "ai_tech_watch",
        title: "The One Thing That Matters",
      },
      {
        bullets: [
          ...weeklyNextWeek.slice(0, 2).map((item) => compactText(item, "下週觀察法說、通膨與利率訊號。", 64)),
          compactText(questionDriven?.counterEvidence[1] ?? weeklyRisk, "如果利率或美元再上行，估值容錯率會下降。", 60),
          "不提供個人 FCN 風險結論或產品推薦。",
        ],
        eyebrow: "FCN / Risk Weekly",
        id: "fcn_risk_watch",
        title: "Next Week / Risk",
      },
      {
        bullets: [
          compactText(weeklySlideBullets[4], "本週核心觀點：理解市場正在 pricing 什麼，比追逐單點新聞更重要。", 132),
          weeklyCta,
        ],
        eyebrow: "I-Xuan Weekly View",
        footer: `${weeklyCta} · ${weeklyTarget} · app.ixuan.ai`,
        id: "weekly_view",
        title: "一玄週觀點",
      },
    ],
  };
}
