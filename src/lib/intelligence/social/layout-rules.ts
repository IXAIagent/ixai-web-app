import type { SocialExportFormat, SocialPackKind, SocialPackSlide } from "./social-intelligence-pack";

export type SocialFormat = "feed-4x5" | "story-9x16";

export type SocialTextLimit = {
  titleMaxChars: number;
  subtitleMaxChars: number;
  bodyMaxChars: number;
  bulletMaxChars: number;
  maxBullets: number;
};

type CompressSocialTextInput = {
  bullets?: string[];
  format: SocialFormat;
  kind: SocialPackKind;
  slideId: SocialPackSlide;
  subtitle?: string;
  title: string;
};

type CompressSocialTextOutput = {
  bullets: string[];
  subtitle?: string;
  title: string;
};

const FILLER_PATTERNS = [
  /Short Insight/gi,
  /Observation\s*\d+/gi,
  /完整內容請見 IXAI App/g,
  /相較前一份 Brief[，：:]?\s*/g,
  /相較最近\s*\d+\s*份 Daily Intelligence[，：:]?\s*/g,
  /市場脈絡與風險環境已整理完成/g,
  /市場訊號正在轉向/g,
  /投資人持續觀察/g,
  /風險偏好受到壓力/g,
  /值得關注|持續關注/g,
  /市場情緒變化/g,
  /事件背後的市場訊號/g,
];

const fallbackBySlide: Record<SocialPackSlide, string> = {
  ai_tech_watch: "觀察 AI 證據是否從題材延伸到訂單與現金流。",
  cover: "市場正在要求更清楚的證據。",
  fcn_risk_watch: "先整理風險，再判讀機會。",
  ixuan_view: "一玄觀點聚焦證據、風險與下一步觀察。",
  market_review: "本週市場重點在事件與下週催化。",
  top_news: "這不是新聞數量，而是市場定價正在改變。",
  weekly_view: "一玄週觀點聚焦本週轉折與下週驗證。",
};

const titleFallbackBySlide: Record<SocialPackSlide, string> = {
  ai_tech_watch: "AI / Tech Watch",
  cover: "市場正在問什麼？",
  fcn_risk_watch: "Risk / FCN Watch",
  ixuan_view: "一玄觀點",
  market_review: "本週三個訊號",
  top_news: "為什麼值得看",
  weekly_view: "一玄週觀點",
};

const feedLimits: Record<SocialPackSlide, SocialTextLimit> = {
  cover: {
    titleMaxChars: 28,
    subtitleMaxChars: 42,
    bodyMaxChars: 42,
    bulletMaxChars: 42,
    maxBullets: 2,
  },
  top_news: {
    titleMaxChars: 20,
    subtitleMaxChars: 32,
    bodyMaxChars: 108,
    bulletMaxChars: 38,
    maxBullets: 3,
  },
  market_review: {
    titleMaxChars: 20,
    subtitleMaxChars: 32,
    bodyMaxChars: 108,
    bulletMaxChars: 38,
    maxBullets: 3,
  },
  ai_tech_watch: {
    titleMaxChars: 20,
    subtitleMaxChars: 32,
    bodyMaxChars: 128,
    bulletMaxChars: 48,
    maxBullets: 3,
  },
  fcn_risk_watch: {
    titleMaxChars: 20,
    subtitleMaxChars: 32,
    bodyMaxChars: 118,
    bulletMaxChars: 50,
    maxBullets: 3,
  },
  ixuan_view: {
    titleMaxChars: 20,
    subtitleMaxChars: 32,
    bodyMaxChars: 116,
    bulletMaxChars: 80,
    maxBullets: 2,
  },
  weekly_view: {
    titleMaxChars: 20,
    subtitleMaxChars: 32,
    bodyMaxChars: 116,
    bulletMaxChars: 80,
    maxBullets: 2,
  },
};

const storyLimits: Record<SocialPackSlide, SocialTextLimit> = {
  cover: {
    titleMaxChars: 36,
    subtitleMaxChars: 54,
    bodyMaxChars: 92,
    bulletMaxChars: 54,
    maxBullets: 3,
  },
  top_news: {
    titleMaxChars: 28,
    subtitleMaxChars: 42,
    bodyMaxChars: 124,
    bulletMaxChars: 58,
    maxBullets: 3,
  },
  market_review: {
    titleMaxChars: 28,
    subtitleMaxChars: 42,
    bodyMaxChars: 132,
    bulletMaxChars: 58,
    maxBullets: 3,
  },
  ai_tech_watch: {
    titleMaxChars: 28,
    subtitleMaxChars: 42,
    bodyMaxChars: 156,
    bulletMaxChars: 62,
    maxBullets: 3,
  },
  fcn_risk_watch: {
    titleMaxChars: 28,
    subtitleMaxChars: 42,
    bodyMaxChars: 148,
    bulletMaxChars: 62,
    maxBullets: 4,
  },
  ixuan_view: {
    titleMaxChars: 28,
    subtitleMaxChars: 42,
    bodyMaxChars: 168,
    bulletMaxChars: 112,
    maxBullets: 2,
  },
  weekly_view: {
    titleMaxChars: 28,
    subtitleMaxChars: 42,
    bodyMaxChars: 168,
    bulletMaxChars: 112,
    maxBullets: 2,
  },
};

export const socialTextLimits: Record<SocialFormat, Record<SocialPackSlide, SocialTextLimit>> = {
  "feed-4x5": feedLimits,
  "story-9x16": storyLimits,
};

export function toSocialFormat(format: SocialExportFormat): SocialFormat {
  return format === "ig_feed_4_5" ? "feed-4x5" : "story-9x16";
}

export function normalizeSocialCopy(value?: string, fallback = "維持市場脈絡與風險意識。") {
  let output = (value ?? fallback)
    .replace(/\*\*/g, "")
    .replace(/…/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^[\s\-\d.①②③④⑤、]+/g, "");

  for (const pattern of FILLER_PATTERNS) {
    output = output.replace(pattern, "");
  }

  return output
    .replace(/([，。！？；])\s*[，。]+/g, "$1")
    .replace(/([。！？；])，/g, "$1")
    .replace(/buy now|must buy|sell now/gi, "monitor")
    .replace(/guaranteed return/gi, "risk-awareness context")
    .replace(/買進|買入|必買/g, "觀察")
    .replace(/賣出|必賣/g, "風險控管")
    .replace(/保證收益|保證報酬|穩賺|必漲/g, "風險情境")
    .replace(/\s+/g, " ")
    .trim() || fallback;
}

export function clampSocialLine(value: string | undefined, maxChars: number, fallback: string) {
  const normalized = normalizeSocialCopy(value, fallback);

  if (normalized.length <= maxChars) {
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
    if (next.length > maxChars) {
      break;
    }
    output = next;
  }

  if (output) {
    return /[。！？.!?；;]$/.test(output) ? output : `${output}。`;
  }

  return fallback.length <= maxChars
    ? fallback
    : fallback.slice(0, Math.max(8, maxChars - 1)).replace(/[，、：:；;]$/g, "。");
}

export function compressSocialText({
  bullets = [],
  format,
  kind,
  slideId,
  subtitle,
  title,
}: CompressSocialTextInput): CompressSocialTextOutput {
  const limits = socialTextLimits[format][slideId];
  const fallback = fallbackBySlide[slideId];
  const maxBullets =
    kind === "weekly" && slideId === "market_review"
      ? Math.min(3, limits.maxBullets)
      : limits.maxBullets;
  const safeBullets = bullets
    .map((bullet) => clampSocialLine(bullet, limits.bulletMaxChars, fallback))
    .filter(Boolean)
    .filter((bullet, index, all) => all.indexOf(bullet) === index)
    .slice(0, maxBullets);

  return {
    bullets: safeBullets.length ? safeBullets : [fallback],
    subtitle: subtitle
      ? clampSocialLine(subtitle, limits.subtitleMaxChars, fallback)
      : subtitle,
    title: clampSocialLine(title, limits.titleMaxChars, titleFallbackBySlide[slideId]),
  };
}
