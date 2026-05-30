import type { DailyBriefDraft, WeeklyIntelligenceDraft } from "@/src/types/editorial";

export type SocialPackKind = "daily" | "weekly";

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
  const normalized = (value ?? fallback).replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1)}…`;
}

function normalizeSocialCopy(value?: string, fallback = "IXAI 已整理今日市場脈絡與風險觀察。") {
  return (value ?? fallback)
    .replace(/\*\*/g, "")
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

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const clauses = normalized
    .split(/(?<=[。！？.!?；;])|\s[|／/]\s|，|,/)
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

function firstItems<T>(items: T[] | undefined, count: number) {
  return Array.isArray(items) ? items.slice(0, count) : [];
}

function executiveSummaryBullets(source?: DailyBriefDraft | null) {
  const summary = source?.intelligence?.executiveSummary ?? [];
  const sourceItems =
    summary.length > 0
      ? summary
      : [
          source?.marketSummary,
          source?.intelligence?.macroWatch?.marketMeaning,
          source?.intelligence?.aiTechWatch?.headline,
          source?.intelligence?.cryptoWatch?.headline,
          source?.intelligence?.riskRegimeReasoning?.reasons?.[0],
        ];

  const bullets = sourceItems
    .filter((item): item is string => Boolean(item && item.trim()))
    .map((item) => readableSnippet(item, "今日市場焦點已整理為公開情報與風險觀察。", 32))
    .filter(Boolean);

  const fallback = [
    "市場焦點已整理為公開情報。",
    "AI / 科技仍是資金觀察主軸。",
    "利率、美元與波動率影響風險偏好。",
    "Crypto 波動維持風險意識。",
    "FCN 結構需理解 KO / KI / Worst Performer。",
  ];

  return firstItems([...bullets, ...fallback], 5);
}

function dailyMarketPulse(source?: DailyBriefDraft | null) {
  const macro = source?.intelligence?.macroWatch;
  const risk = source?.intelligence?.riskRegimeReasoning;
  const ai = source?.intelligence?.aiTechWatch;
  const sections = firstItems(source?.sections, 3);

  if (macro || risk || ai) {
    return [
      socialPoint("Macro", macro?.whatHappened ?? sections[0]?.headline, "利率與美元仍牽動風險偏好。"),
      socialPoint("AI", ai?.headline ?? sections[1]?.headline, "AI supply chain 仍是科技觀察主軸。"),
      socialPoint("Risk", risk?.reasons?.[0] ?? sections[2]?.summary, "觀察波動、美元與殖利率同步變化。"),
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

  if (observations.length > 0) {
    return [readableSnippet(aiWatch?.headline, "AI / Tech Watch", 34), ...observations].slice(0, 4);
  }

  const aiSection = source?.sections.find((section) => /ai|tech|semiconductor|科技|半導體/i.test(section.category));
  return [
    readableSnippet(aiSection?.headline, "AI infrastructure 與半導體仍是觀察主題。", 38),
    readableSnippet(aiSection?.summary, "觀察資金是否仍聚焦 AI supply chain。", 42),
    "Symbols / themes 僅作公開市場觀察。",
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
    source?.intelligence?.marketRegimeNote ??
    source?.marketSummary;
  const normalized = normalizeSocialCopy(candidate, "");

  if (normalized && !isMostlyEnglish(normalized)) {
    const view = readableSnippet(normalized, "", 132);
    if (view.length >= 36) {
      return view;
    }
  }

  return "今日重點不是追逐短線雜訊，而是把利率、美元、AI 資金流與風險環境放回同一張地圖。先確認市場正在定價什麼，再決定哪些主題值得持續觀察。";
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
  const executiveSummary = executiveSummaryBullets(source);
  const topNews = dailyMarketPulse(source);
  const aiTech = dailyAiTechPoints(source);
  const riskPoints = dailyRiskPoints(source);
  const dailyInsight = dailyIxuanView(source);

  return {
    caption: buildDailyCaption(),
    cta: {
      href: "https://app.ixuan.ai/daily-brief",
      label: "完整日報請見 IXAI App",
    },
    dateLabel,
    disclaimer: DISCLAIMER,
    kind: "daily",
    sourceBriefId: source?.id,
    subtitle: "Daily Intelligence",
    title: "今日市場最重要的事",
    slides: [
      {
        bullets: executiveSummary,
        eyebrow: "Daily Intelligence",
        footer: "Daily Intelligence · Market Interpretation · Risk Awareness",
        id: "cover",
        subtitle: "一玄資訊",
        title: "今日市場最重要的事",
      },
      {
        bullets: topNews,
        eyebrow: "Market Pulse",
        footer: "人工審閱後供手動發布",
        id: "top_news",
        title: "Market Pulse",
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
        bullets: [dailyInsight, "完整內容請見 IXAI App。"],
        eyebrow: "I-Xuan View",
        footer: "完整日報請見 IXAI App · app.ixuan.ai",
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
  const highlights = firstItems(source?.sections.marketHighlights, 3);
  const marketReview =
    highlights.length > 0
      ? highlights.map((item) => `${compactText(item.headline, item.label, 34)}｜${compactText(item.ixaiView ?? item.summary, "整理本週市場脈絡。", 42)}`)
      : [
          "美股 / 債券｜觀察利率與風險偏好的互動。",
          "美元 / Macro｜美元流動性仍影響風險資產節奏。",
          "Crypto｜BTC / ETH 波動維持風險意識。",
        ];
  const weeklyView =
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
          compactText(source?.summary, "本週市場重點已整理為 Weekly Intelligence。", 58),
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
          compactText(source?.sections.taiwanAi.headline, "AI infrastructure / semiconductors / cloud / data center / software", 48),
          compactText(source?.sections.taiwanAi.summary, "觀察 AI supply chain 是否維持資金關注與產業敘事。", 62),
          "台股 AI 供應鏈為公開觀察主題，非個別標的建議。",
        ],
        eyebrow: "AI / Tech Weekly",
        id: "ai_tech_watch",
        title: "AI / 科技週觀察",
      },
      {
        bullets: [
          compactText(source?.sections.intelligenceSummary.riskTone, "本週風險環境以波動、利率與美元節奏為核心。", 56),
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
