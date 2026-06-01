import type { DailyBriefDraft, WeeklyIntelligenceDraft } from "@/src/types/editorial";
import { getDailyIntelligenceCoreFromBrief } from "@/src/lib/intelligence/core";

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

function dailyMemoryPoint(source?: DailyBriefDraft | null) {
  const memory = source?.intelligence?.whatChangedSinceLastBrief?.replace(/^相較前一份 Brief[，：:]\s*/, "");

  if (!memory) {
    return "相較前一份 Brief：IXAI 正在建立市場主線記憶，持續追蹤 AI、利率與風險偏好。";
  }

  return `相較前一份 Brief：${readableSnippet(memory, "市場主線仍需觀察延續與轉向。", 70)}`;
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
    "今日市場重點已整理完成：",
    "・市場焦點新聞",
    "・AI / 科技觀察",
    "・FCN 與風險環境",
    "・一玄觀點",
    "完整日報請見 IXAI App：",
    APP_URL,
    DISCLAIMER,
  ].join("\n");
}

function buildWeeklyCaption() {
  return [
    "【一玄每週 AI 投資週報】",
    "本週市場重點整理：",
    "・市場回顧",
    "・AI / 科技趨勢",
    "・FCN 與風險觀察",
    "・一玄週觀點",
    "完整週報請見 IXAI App：",
    APP_URL,
    DISCLAIMER,
  ].join("\n");
}

export function generateDailySocialPack(source?: DailyBriefDraft | null): SocialIntelligencePack {
  const dateLabel = formatDateLabel(source?.publishedAt ?? source?.updatedAt);
  const core = source ? getDailyIntelligenceCoreFromBrief(source) : null;
  const fallbackSummary = executiveSummaryBullets(source);
  const stopScrollBullets = core
    ? [
        readableSnippet(core.conversionHook, "這不是單一新聞，而是今天市場主線的變化。", 46),
        "點進 IXAI App 看完整 Daily Brief。",
      ]
    : firstItems(fallbackSummary, 2);
  const curiosityBullets = core
    ? (() => {
        const curiosity = readableSnippet(
          core.socialCuriosity,
          "為什麼這件事值得點進去看？關鍵在市場主線是否延續或轉向。",
          58,
        );
        const thesis = distinctSocialValue(
          core.socialThesis,
          [curiosity],
          "完整 Daily Brief 會拆解新聞背後的市場定價與風險約束。",
          58,
        );

        return [curiosity, thesis];
      })()
    : firstItems(dailyMarketPulse(source), 2);
  const aiTech = core
    ? (() => {
        const keySignal = readableSnippet(
          core.socialHooks.aiTechSignal.keySignal,
          "AI 需求可能從晶片擴散到雲端與企業軟體。",
          48,
        );
        const whyItMatters = distinctSocialValue(
          core.socialHooks.aiTechSignal.whyItMatters,
          [keySignal],
          "若擴散成立，AI 會從個股行情轉為產業效率敘事。",
          48,
        );
        const watchNext = distinctSocialValue(
          core.socialHooks.aiTechSignal.watchNext,
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
    : dailyAiTechPoints(source);
  const riskPoints = core
    ? [
        `Risk State｜${source?.intelligence?.riskRegimeReasoning?.current ?? "Elevated"}`,
        `Why It Matters｜${readableSnippet(core.socialHooks.riskHook, "觀察波動率、美元、利率與市場廣度是否同向。", 48)}`,
        `FCN Awareness｜${source?.intelligence?.fcnAwareness?.topic ?? "KO / KI"}：${readableSnippet(source?.intelligence?.fcnAwareness?.explanation, "理解 KO / KI / Worst Performer 等結構概念。", 46)}`,
      ]
    : dailyRiskPoints(source);
  const dailyInsight = readableSnippet(core?.socialHooks.ixuanHook ?? dailyIxuanView(source), "一玄觀點聚焦市場正在 pricing 什麼，而不是單一新聞。", 120);
  const memoryPoint = core
    ? `相較前一份 Brief：${readableSnippet(core.whatChanged, "市場主線仍需觀察延續與轉向。", 70)}`
    : dailyMemoryPoint(source);
  const dailyTarget = core?.contentFunnelTarget ?? (source?.slug ? `/daily-brief/${source.slug}` : "/daily-brief");
  const dailyCta = core?.socialCTA ?? "完整 Daily Brief 已整理在 IXAI App。";
  const socialTitle = core?.headlineHook ?? source?.title ?? "今日市場最重要的事";

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
        bullets: stopScrollBullets,
        eyebrow: "Daily Intelligence",
        footer: "Social Pack → Daily Brief",
        id: "cover",
        subtitle: "一玄資訊",
        title: socialTitle,
      },
      {
        bullets: curiosityBullets,
        eyebrow: "Why It Matters",
        footer: "人工審閱後供手動發布",
        id: "top_news",
        title: "為什麼值得點進去看",
      },
      {
        bullets: aiTech,
        eyebrow: "IXAI Tech Intelligence",
        id: "ai_tech_watch",
        title: "AI / 科技觀察",
      },
      {
        bullets: riskPoints,
        eyebrow: "FCN Awareness",
        id: "fcn_risk_watch",
        title: "Risk Regime",
      },
      {
        bullets: [dailyInsight, memoryPoint, dailyCta],
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
  const dailyCoreAggregation = source?.sections.dailyCoreAggregation;
  const highlights = firstItems(source?.sections.marketHighlights, 3);
  const limitedHistoryNote = "Daily Core 歷史仍有限，週報先以近期市場主線建立聚合脈絡。";
  const marketReview =
    dailyCoreAggregation?.recentSignals.length
      ? dailyCoreAggregation.recentSignals
          .slice(0, 3)
          .map((signal, index) =>
            `${dailyCoreAggregation.repeatedThemes[index] ?? "Daily Core"}｜${readableSnippet(signal, "整理本週 Daily Intelligence 主線。", 46)}`,
          )
      : highlights.length > 0
      ? highlights.map((item) => `${compactText(item.headline, item.label, 34)}｜${compactText(item.ixaiView ?? item.summary, "整理本週市場脈絡。", 42)}`)
      : [
          "美股 / 債券｜觀察利率與風險偏好的互動。",
          "美元 / Macro｜美元流動性仍影響風險資產節奏。",
          "Crypto｜BTC / ETH 波動維持風險意識。",
        ];
  const weeklyView =
    dailyCoreAggregation?.ixuanViewSummary ??
    dailyCoreAggregation?.weeklyNarrative ??
    source?.sections.intelligenceSummary.pricing ??
    source?.aiSuggestion.intelligenceNarrative ??
    "本週核心不在單一新聞，而是市場正在 pricing 的風險結構與下一週催化。";

  return {
    caption: buildWeeklyCaption(),
    cta: {
      href: "https://app.ixuan.ai/weekly-brief",
      label: "完整週報請見 IXAI App",
    },
    dateLabel,
    disclaimer: DISCLAIMER,
    kind: "weekly",
    sourceBriefId: source?.id,
    subtitle: "Weekly Intelligence",
    title: "本週市場正在 pricing 什麼",
    slides: [
      {
        bullets: [
          dailyCoreAggregation?.limitedHistory
            ? limitedHistoryNote
            : compactText(dailyCoreAggregation?.weeklyNarrative ?? source?.summary, "本週市場重點已整理為 Weekly Intelligence。", 58),
          "公開情報與教育分享，不提供個人化投資建議。",
        ],
        eyebrow: "Weekly Intelligence",
        footer: "Institutional Research · Weekly Intelligence",
        id: "cover",
        subtitle: "一玄資訊",
        title: "本週市場正在 pricing 什麼",
      },
      {
        bullets: marketReview,
        eyebrow: "Market Review",
        id: "market_review",
        title: "Market Review",
      },
      {
        bullets: [
          compactText(dailyCoreAggregation?.repeatedThemes.find((theme) => /ai|tech|software|semi|台灣|taiwan/i.test(theme)) ?? source?.sections.taiwanAi.headline, "AI infrastructure / semiconductors / cloud / data center / software", 48),
          compactText(dailyCoreAggregation?.nextWeekWatchpoints.find((item) => /AI|software|cloud|semiconductor|半導體|台股|供應鏈/i.test(item)) ?? source?.sections.taiwanAi.summary, "觀察 AI supply chain 是否維持資金關注與產業敘事。", 62),
          "台股 AI 供應鏈為公開觀察主題，非個別標的建議。",
        ],
        eyebrow: "AI / Tech Weekly",
        id: "ai_tech_watch",
        title: "AI / 科技週觀察",
      },
      {
        bullets: [
          dailyCoreAggregation?.limitedHistory
            ? limitedHistoryNote
            : compactText(dailyCoreAggregation?.whatChanged ?? source?.sections.intelligenceSummary.riskTone, "本週風險環境以波動、利率與美元節奏為核心。", 56),
          compactText(source?.sections.fcnMarketObservation.sentiment, "FCN 觀察以波動率、AI basket 與 worst-of 概念為教育用途。", 64),
          "不提供個人 FCN 風險結論或產品推薦。",
        ],
        eyebrow: "FCN / Risk Weekly",
        id: "fcn_risk_watch",
        title: "Risk Regime",
      },
      {
        bullets: [compactText(weeklyView, "本週核心觀點：理解市場正在 pricing 什麼，比追逐單點新聞更重要。", 50)],
        eyebrow: "I-Xuan Weekly View",
        footer: "完整週報請見 IXAI App · app.ixuan.ai",
        id: "weekly_view",
        title: "一玄週觀點",
      },
    ],
  };
}
