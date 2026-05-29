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
const DISCLAIMER = "市場資訊與教育分享，非個人化投資建議。";
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

function firstItems<T>(items: T[] | undefined, count: number) {
  return Array.isArray(items) ? items.slice(0, count) : [];
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
  const sections = firstItems(source?.sections, 3);
  const topNews =
    sections.length > 0
      ? sections.map((section) =>
          `${compactText(section.headline, "市場焦點更新", 34)}｜${compactText(section.ixaiView ?? section.summary, "維持風險意識與情境判讀。", 38)}`,
        )
      : [
          "市場焦點新聞｜以公開資訊整理今日風險脈絡。",
          "AI / 科技觀察｜半導體與 data center 仍是資金關注主軸。",
          "總經環境｜利率、美元與波動率影響風險偏好。",
        ];
  const aiTech = source?.sections.find((section) => /ai|tech|semiconductor|科技|半導體/i.test(section.category));
  const crypto = source?.sections.find((section) => /crypto|btc|eth|幣/i.test(section.category));
  const dailyInsight =
    source?.editorialNote ??
    source?.intelligence?.marketRegimeNote ??
    "今日重點不是追逐短線雜訊，而是把市場脈絡、風險環境與個人關注主題放回同一張地圖。";

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
    title: "每日 AI 投資日報",
    slides: [
      {
        bullets: [
          compactText(source?.marketSummary, "今日市場焦點已整理為公開情報與風險觀察。", 58),
          "市場資訊與教育分享，不構成個人化投資建議。",
        ],
        eyebrow: "Daily Intelligence",
        footer: "Daily Intelligence · Market Interpretation · Risk Awareness",
        id: "cover",
        subtitle: "一玄資訊",
        title: "每日 AI 投資日報",
      },
      {
        bullets: topNews,
        eyebrow: "Market Pulse",
        footer: "人工審閱後供手動發布",
        id: "top_news",
        title: "今日三大新聞",
      },
      {
        bullets: [
          compactText(aiTech?.headline, "AI infrastructure、semiconductors、cloud 與 software 是本日觀察主題。", 46),
          compactText(aiTech?.summary, "觀察資金是否仍聚焦 AI supply chain 與高成長科技股。", 62),
          crypto ? `補充觀察：${compactText(crypto.headline, "Crypto volatility watch", 34)}` : "Symbols / themes 僅作公開市場觀察，不作交易指令。",
        ],
        eyebrow: "IXAI Tech Intelligence",
        id: "ai_tech_watch",
        title: "AI / 科技觀察",
      },
      {
        bullets: [
          "Risk Regime：觀察波動率、美元、利率與高 beta 資產同步變化。",
          "FCN Awareness：留意 KO / KI / Worst Performer / Observation Date 等結構概念。",
          "FCN 應搭配合格專業人員與正式產品文件理解。",
        ],
        eyebrow: "FCN Awareness",
        id: "fcn_risk_watch",
        title: "FCN 與風險環境",
      },
      {
        bullets: [compactText(dailyInsight, "今日最重要的一句話：先整理風險，再判讀機會。", 50)],
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
    title: "每週 AI 投資週報",
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
        title: "Weekly Intelligence",
      },
      {
        bullets: marketReview,
        eyebrow: "Market Review",
        id: "market_review",
        title: "本週市場回顧",
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
        title: "FCN / Risk 週觀察",
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
