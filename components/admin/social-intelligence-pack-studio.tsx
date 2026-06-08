"use client";

import { useMemo, useRef, useState } from "react";
import {
  Cloud,
  Cpu,
  Gauge,
  Globe2,
  Landmark,
  Quote,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { IxaiLogo } from "@/components/brand/ixai-logo";
import {
  generateDailySocialPack,
  generateWeeklySocialPack,
  clampSocialLine,
  compressSocialText,
  socialBrandTokens,
  socialExportFormats,
  toSocialFormat,
  type SocialExportFormat,
  type SocialIntelligencePack,
  type SocialPackKind,
} from "@/src/lib/intelligence/social";
import type { DailyBriefDraft, WeeklyIntelligenceDraft } from "@/src/types/editorial";

type SocialIntelligencePackStudioProps = {
  dailyDraft?: DailyBriefDraft | null;
  defaultKind?: SocialPackKind;
  selectedWeeklyDraft?: WeeklyIntelligenceDraft | null;
  weeklyDraft?: WeeklyIntelligenceDraft | null;
};

const DAILY_TECH_SYMBOLS = ["NVDA", "MSFT", "AMD", "AVGO", "PLTR"];
const WEEKLY_TECH_SYMBOLS = ["AI Infra", "Semis", "Cloud", "Data Center", "Software"];
const DEFAULT_FORMAT: SocialExportFormat = "ig_feed_4_5";

// v1.42.4 — Platform-aware social format layer. Preview cards share
// the same safe-area renderer, then export to either IG Feed 4:5
// (1080 × 1350) or Story / Reels 9:16 (1080 × 1920). Typography stays
// conservative because html-to-image scales the DOM to platform size.
const FORMAT_LAYOUT: Record<
  SocialExportFormat,
  {
    bodyClass: string;
    footerPct: string;
    headerPct: string;
    previewWidthClass: string;
    title: string;
  }
> = {
  ig_feed_4_5: {
    bodyClass: "px-5 py-2",
    footerPct: "13%",
    headerPct: "9%",
    previewWidthClass: "w-[300px]",
    title: "IG Feed / Carousel",
  },
  story_9_16: {
    bodyClass: "px-5 py-3",
    footerPct: "13%",
    headerPct: "9%",
    previewWidthClass: "w-[280px]",
    title: "Story / Reels",
  },
};

// Per-slide copy selection caps (CJK glyphs). The render layer picks
// concise clauses and reduces item count instead of showing clipped
// ellipsis fragments. Small intentionally; social readers scan.
const COPY_LIMITS = {
  coverBullet: 34,
  bodyBullet: 48,
  newsTitle: 20,
  newsSummary: 48,
  viewMain: 136,
  viewSupplement: 42,
} as const;

const RISK_REGIME_COPY: Record<
  string,
  { meaning: string; fcn: string }
> = {
  Low: {
    meaning: "市場節奏穩定，留意過度集中或槓桿擴張。",
    fcn: "FCN 評估以紀律與標的品質為主。",
  },
  Moderate: {
    meaning: "波動分散，個別觀察主題集中度與催化。",
    fcn: "FCN 結構需理解標的距離與 KO/KI。",
  },
  Elevated: {
    meaning: "風險指標上升，配置偏向防禦與分散。",
    fcn: "FCN 結構需理解 KO / KI / Worst Performer。",
  },
  High: {
    meaning: "波動加大，先整理曝險再判讀機會。",
    fcn: "FCN 結構在高波動下需更謹慎的標的審視。",
  },
};

function packSourceLabel(pack: SocialIntelligencePack) {
  if (!pack.sourceBriefId) {
    return "safe editorial fallback";
  }

  return `${pack.kind} source · ${pack.sourceBriefId.slice(0, 18)}`;
}

function sourceDateLabelFor(kind: SocialPackKind, draft?: DailyBriefDraft | WeeklyIntelligenceDraft | null) {
  if (!draft) {
    return "No matching source";
  }

  if (kind === "weekly" && "weekStart" in draft) {
    return `${draft.weekStart} - ${draft.weekEnd}`;
  }

  return draft.publishedAt ?? draft.updatedAt ?? "Unpublished";
}

function sourceAlignmentFor({
  dailyDraft,
  kind,
  pack,
  selectedWeeklyDraft,
  weeklyDraft,
}: {
  dailyDraft?: DailyBriefDraft | null;
  kind: SocialPackKind;
  pack: SocialIntelligencePack;
  selectedWeeklyDraft?: WeeklyIntelligenceDraft | null;
  weeklyDraft?: WeeklyIntelligenceDraft | null;
}) {
  const source = kind === "daily" ? dailyDraft : weeklyDraft;
  const selectedSource = kind === "weekly" ? selectedWeeklyDraft ?? weeklyDraft : source;
  const hasMatchingSource = Boolean(source?.id);
  const hasSlug = Boolean(source?.slug);
  const isFallback = !hasMatchingSource || !pack.sourceBriefId;
  const periodMatches = pack.kind === kind;
  const weeklyPublishedCanonical =
    kind !== "weekly" ||
    (source && "isCanonical" in source && source.status === "published" && source.isCanonical === true);
  const canExport = hasMatchingSource && hasSlug && periodMatches && !isFallback && weeklyPublishedCanonical;
  const missingSourceCopy =
    kind === "daily"
      ? "找不到對應的 Daily Brief 來源，請先產生或選擇 Daily Brief。"
      : "找不到對應的 Weekly Brief 來源，請先產生或選擇 Weekly Brief。";
  const warning = !hasMatchingSource
    ? missingSourceCopy
    : !hasSlug
    ? "此來源缺少 slug，無法匯出為正式社群包。"
    : !periodMatches
    ? "Source period mismatch. Daily and Weekly Social Packs must use their own period source."
    : isFallback
    ? "此為 fallback preview，不可匯出為正式社群包。"
    : !weeklyPublishedCanonical
    ? "目前沒有可用的 published canonical Weekly export source。可以預覽，但不可下載 PNG 或複製正式 caption。請先發布成 canonical weekly，再產出正式 Social Pack。"
    : "";
  const selectedCanonicalLabel =
    kind === "weekly" && selectedSource && "isCanonical" in selectedSource
      ? selectedSource.isCanonical
        ? "true"
        : "false"
      : "not applicable";

  return {
    canExport,
    canonicalLabel:
      kind === "weekly" && source && "isCanonical" in source
        ? source.isCanonical
          ? "true"
          : "false"
        : "not applicable",
    eligibilityReason: warning || "source guard passed",
    exportEligibleLabel: canExport ? "true" : "false",
    fallbackLabel: isFallback ? "true · Fallback preview only" : "false",
    hasMatchingSource,
    hasSlug,
    revisionLabel:
      kind === "weekly" && source && "revisionNumber" in source
        ? `v${source.revisionNumber ?? 1}`
        : "not applicable",
    selectedCanonicalLabel,
    selectedRevisionLabel:
      kind === "weekly" && selectedSource && "revisionNumber" in selectedSource
        ? `v${selectedSource.revisionNumber ?? 1}`
        : "not applicable",
    selectedSourceSlug: selectedSource?.slug ?? "No selected source",
    selectedSourceStatus: selectedSource?.status ?? "No selected source",
    sourceDate: sourceDateLabelFor(kind, source),
    sourcePeriod: kind,
    sourceSlug: source?.slug ?? "No matching source",
    sourceStatus: source?.status ?? "No matching source",
    sourceTitle: source?.title ?? "No matching source",
    warning,
  };
}

type SocialPackQualityIssue = {
  detail: string;
  severity: "blocker" | "warning";
  slideId?: string;
};

type SocialPackQualityResult = {
  canExport: boolean;
  issues: SocialPackQualityIssue[];
  statusLabel: "passed" | "failed";
  topIssues: string[];
};

const PLACEHOLDER_PATTERNS = [
  /具體事件待\s*editor\s*審閱/i,
  /待\s*editor/i,
  /editor\s*審閱/i,
  /\bTBD\b/i,
  /\bTODO\b/i,
  /placeholder/i,
  /fallback/i,
  /Watch\s*1/i,
  /Watch\s*2/i,
  /Watch\s*3/i,
  /具體事件待/i,
  /請先審閱/i,
  /等待\s*editor/i,
];

const GENERIC_PATTERNS = [
  /這不是新聞數量，而是市場定價正在改變/,
  /市場定價正在改變/,
  /市場正在要求更清楚的證據/,
  /本週市場最大轉折是什麼/,
  /本週不是新聞加總/,
  /理解市場正在 pricing 什麼/,
  /觀察證據是否同步上修/,
  /維持情境觀察與風險意識/,
];

const CONCRETE_MARKET_PATTERNS = [
  /FOMC|Powell|CPI|PCE|Fed|利率|殖利率|美元|USD/i,
  /NVDA|Nvidia|AVGO|TSMC|台積電|2330|半導體|AI|capex|guidance|指引|cloud|data center/i,
  /QQQ|SPY|BTC|ETH|Crypto|加密/i,
  /FCN|KI|KO|worst[- ]?of|Worst|波動|volatility|籃子/i,
  /鴻海|台股|融資|財報|法說|ETF/i,
];

const WEEKLY_CATALYST_PATTERN = /FOMC|Powell|利率|CPI|PCE|財報|guidance|指引|台積電|2330|QQQ|SPY|BTC/i;
const TECH_CONTENT_PATTERN = /AI|semiconductor|半導體|NVDA|Nvidia|台積電|TSMC|guidance|指引|capex|cloud|data center|雲端|資料中心|鴻海|AI server/i;
const CRYPTO_MACRO_ONLY_PATTERN = /BTC|ETH|Crypto|加密|rates|macro|利率|總經|美元/i;
const FCN_CONTENT_PATTERN = /KO|KI|worst[- ]?of|Worst|volatility|波動|籃子/i;

function slideNarrativeText(slide: SocialIntelligencePack["slides"][number]) {
  return [slide.title, slide.subtitle, ...slide.bullets]
    .filter(Boolean)
    .join(" ");
}

function slideBodyTexts(slide: SocialIntelligencePack["slides"][number]) {
  return [slide.subtitle, ...slide.bullets].filter((value): value is string => Boolean(value?.trim()));
}

function sentenceParts(value: string) {
  return value
    .split(/[。！？!?；;\n]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function hasConcreteMarketElement(value: string) {
  return CONCRETE_MARKET_PATTERNS.some((pattern) => pattern.test(value));
}

function isQualityDuplicateIgnored(value: string) {
  return (
    /^https?:\/\//i.test(value) ||
    /app\.ixuan\.ai/i.test(value) ||
    /^(IXAI Intelligence|I-Xuan View|I-Xuan Weekly View|一玄觀點|Daily Brief|Weekly Intelligence|Market Intelligence)$/i.test(value)
  );
}

function repeatedSentences(texts: string[]) {
  const counts = new Map<string, number>();

  for (const text of texts) {
    for (const sentence of sentenceParts(text)) {
      const normalized = sentence.replace(/\s+/g, " ").trim();
      if (normalized.length < 8) continue;
      if (isQualityDuplicateIgnored(normalized)) continue;
      counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
    }
  }

  return [...counts.entries()].filter(([, count]) => count > 1).map(([sentence]) => sentence);
}

function repeatedPhraseIssue(value: string) {
  const sentences = sentenceParts(value);
  const ignore = [
    "IXAI",
    "app.ixuan.ai",
    "Daily Brief",
    "Weekly Intelligence",
    "Market Intelligence",
    "I-Xuan View",
    "I-Xuan Weekly View",
    "一玄觀點",
  ];

  for (const sentence of sentences) {
    const normalized = sentence.replace(/\s+/g, " ").trim();
    if (normalized.length < 14) continue;

    for (let length = 4; length <= 12; length += 1) {
      for (let start = 0; start <= normalized.length - length; start += 1) {
        const phrase = normalized.slice(start, start + length).trim();
        if (phrase.length < 4 || ignore.some((item) => phrase.includes(item))) continue;
        if (!/[\u4e00-\u9fffA-Za-z]/.test(phrase)) continue;

        const first = normalized.indexOf(phrase);
        const second = normalized.indexOf(phrase, first + phrase.length);
        if (second > -1) {
          return phrase;
        }
      }
    }
  }

  return "";
}

function isGenericSlide(slide: SocialIntelligencePack["slides"][number]) {
  const text = slideNarrativeText(slide);
  const genericHits = GENERIC_PATTERNS.filter((pattern) => pattern.test(text)).length;
  return genericHits > 0 && !hasConcreteMarketElement(text);
}

function detectSocialPackQualityIssues(pack: SocialIntelligencePack): SocialPackQualityResult {
  const issues: SocialPackQualityIssue[] = [];
  const narrativeTexts = pack.slides.map(slideNarrativeText);
  const duplicateTexts = pack.slides.flatMap(slideBodyTexts);
  const allText = narrativeTexts.join(" ");

  for (const pattern of PLACEHOLDER_PATTERNS) {
    if (pattern.test(allText)) {
      issues.push({
        detail: `含待審閱或 placeholder 文字：${pattern.source}`,
        severity: "blocker",
      });
    }
  }

  for (const sentence of repeatedSentences(duplicateTexts)) {
    issues.push({
      detail: `出現重複句：${sentence}`,
      severity: "blocker",
    });
  }

  pack.slides.forEach((slide) => {
    const weakBullets = slide.bullets.filter((bullet) => bullet.trim().length < 8);
    if (weakBullets.length > 0) {
      issues.push({
        detail: `${slide.title} 有空白或過短 bullet。`,
        severity: "blocker",
        slideId: slide.id,
      });
    }
  });

  for (let index = 0; index < pack.slides.length - 1; index += 1) {
    if (isGenericSlide(pack.slides[index]) && isGenericSlide(pack.slides[index + 1])) {
      issues.push({
        detail: `連續兩張卡過於 generic：${pack.slides[index].title} / ${pack.slides[index + 1].title}`,
        severity: "blocker",
      });
      break;
    }
  }

  if (pack.kind === "weekly") {
    if (!WEEKLY_CATALYST_PATTERN.test(allText)) {
      issues.push({
        detail: "Weekly pack 缺少 next-week catalyst 關鍵字（FOMC / Powell / 利率 / CPI / PCE / 財報 / guidance / 台積電 / 2330 / QQQ / SPY / BTC）。",
        severity: "blocker",
      });
    }

    const aiTechSlide = pack.slides.find((slide) => slide.id === "ai_tech_watch");
    if (aiTechSlide) {
      const contentText = [aiTechSlide.title, aiTechSlide.subtitle, ...aiTechSlide.bullets].filter(Boolean).join(" ");
      if (!TECH_CONTENT_PATTERN.test(contentText)) {
        issues.push({
          detail: "Weekly AI / Tech Watch 卡未包含 AI / semiconductor / guidance / capex / cloud / data center 等科技內容。",
          severity: "blocker",
          slideId: aiTechSlide.id,
        });
      }
      if (CRYPTO_MACRO_ONLY_PATTERN.test(contentText) && !TECH_CONTENT_PATTERN.test(contentText)) {
        issues.push({
          detail: "Weekly AI / Tech Watch 卡內容偏 BTC / ETH 或純 macro，與標題錯位。",
          severity: "blocker",
          slideId: aiTechSlide.id,
        });
      }
    }

    const fcnRiskSlide = pack.slides.find((slide) => slide.id === "fcn_risk_watch");
    if (fcnRiskSlide && !FCN_CONTENT_PATTERN.test(slideNarrativeText(fcnRiskSlide))) {
      issues.push({
        detail: "Weekly FCN / Risk Watch 卡缺少 KO / KI / worst-of / volatility / 波動 / 籃子等 FCN 風險元素。",
        severity: "blocker",
        slideId: fcnRiskSlide.id,
      });
    }
  }

  if (pack.kind === "daily") {
    const cover = pack.slides.find((slide) => slide.id === "cover");
    const ixuanView = pack.slides.find((slide) => slide.id === "ixuan_view");
    const coverText = cover ? slideNarrativeText(cover) : "";
    const ixuanViewText = ixuanView ? ixuanView.bullets.join(" ") : "";

    if (coverText && ixuanViewText) {
      const sharedMeaningfulCue =
        /AI|利率|台股|FCN|風險|企業|證據|資金|科技|半導體/i.test(coverText) &&
        /AI|利率|台股|FCN|風險|企業|證據|資金|科技|半導體/i.test(ixuanViewText);
      if (!sharedMeaningfulCue) {
        issues.push({
          detail: "Daily cover title 與 I-Xuan View 主軸可能脫節。",
          severity: "blocker",
        });
      }
    }

    if (ixuanViewText) {
      const repeatedPhrase = repeatedPhraseIssue(ixuanViewText);
      if (repeatedPhrase) {
        issues.push({
          detail: `Daily I-Xuan View 出現明顯重複片語：「${repeatedPhrase}」。`,
          severity: "blocker",
          slideId: ixuanView?.id,
        });
      }
    }

    const watchNext = pack.slides.find((slide) => /Watch Next/i.test(slide.eyebrow));
    if (watchNext) {
      const hasBareWatchLabels = watchNext.bullets.some((bullet) => /^Watch\s*[123]\s*$/i.test(bullet.trim()));
      const hasSpecificContent = watchNext.bullets.some((bullet) => bullet.trim().length >= 12);
      if (hasBareWatchLabels || !hasSpecificContent) {
        issues.push({
          detail: "Daily Watch Next 卡只有 Watch 1 / Watch 2 / Watch 3 或缺少具體觀察內容。",
          severity: "blocker",
          slideId: watchNext.id,
        });
      }
    }
  }

  const blockers = issues.filter((issue) => issue.severity === "blocker");

  return {
    canExport: blockers.length === 0,
    issues,
    statusLabel: blockers.length === 0 ? "passed" : "failed",
    topIssues: issues.slice(0, 4).map((issue) => issue.detail),
  };
}

function createFileName(kind: SocialPackKind, index: number, format: SocialExportFormat) {
  const prefix = format === "ig_feed_4_5" ? "ig-feed" : "story";
  return `${kind}-${prefix}-social-pack-${String(index + 1).padStart(2, "0")}.png`;
}

function downloadDataUrl(dataUrl: string, fileName: string) {
  const link = document.createElement("a");
  link.download = fileName;
  link.href = dataUrl;
  link.click();
}

function normalizeDisplayText(value: string) {
  return value
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^[-\d.①②③④⑤、\s]+/g, "");
}

// v1.41.2 — Render-layer fit helper. It selects a short sentence or
// clause instead of slicing text with an ellipsis, so exported social
// cards never show clipped fragments such as "AI / Tech Wat...".
function fitReadableText(value: string, maxLength: number, fallback: string) {
  return clampSocialLine(normalizeDisplayText(value), maxLength, fallback);
}

// Split a "headline｜detail" bullet payload into two compacted pieces.
function splitBullet(value: string) {
  const normalized = normalizeDisplayText(value);
  const parts = normalized.split("｜");
  const heading = fitReadableText(parts[0] ?? normalized, COPY_LIMITS.newsTitle, "Market Pulse");
  const detail = fitReadableText(
    parts.slice(1).join("｜") || normalized,
    COPY_LIMITS.newsSummary,
    "維持情境觀察與風險意識。",
  );

  return { detail, heading };
}

function splitRiskBullet(value: string) {
  const item = splitBullet(value);
  return {
    detail: item.detail.replace(/^Reason\s+\d+\s*[:：]?/i, "").trim(),
    heading: item.heading.replace(/^Risk State$/i, "Current Risk State"),
  };
}

function renderSlideIcon(id: string) {
  if (id === "top_news" || id === "market_review") {
    return <Globe2 className="h-7 w-7 text-[var(--ixai-gold)]" strokeWidth={1.8} />;
  }

  if (id === "ai_tech_watch") {
    return <Cpu className="h-7 w-7 text-[var(--ixai-gold)]" strokeWidth={1.8} />;
  }

  if (id === "fcn_risk_watch") {
    return <Gauge className="h-7 w-7 text-[var(--ixai-gold)]" strokeWidth={1.8} />;
  }

  if (id === "ixuan_view" || id === "weekly_view") {
    return <Quote className="h-7 w-7 text-[var(--ixai-gold)]" strokeWidth={1.8} />;
  }

  return <Sparkles className="h-7 w-7 text-[var(--ixai-gold)]" strokeWidth={1.8} />;
}

function techSymbolsFor(kind: SocialPackKind) {
  return kind === "daily" ? DAILY_TECH_SYMBOLS : WEEKLY_TECH_SYMBOLS;
}

function riskStageFor(kind: SocialPackKind) {
  return kind === "daily" ? "Elevated" : "Moderate";
}

// v1.40.6d — Header safe area. Compact logo + IXAI Intelligence /
// date stack. Never grows beyond HEADER_HEIGHT_CLASS, so it cannot
// push into the main content area.
function SlideHeader({
  format,
  index,
  pack,
}: {
  format: SocialExportFormat;
  index: number;
  pack: SocialIntelligencePack;
}) {
  const isFeed = format === "ig_feed_4_5";

  return (
    <div
      className={`relative z-10 flex shrink-0 items-center justify-between gap-3 px-5 ${isFeed ? "pt-3" : "pt-4"}`}
      style={{ height: FORMAT_LAYOUT[format].headerPct }}
    >
      <div className={`${isFeed ? "h-5 w-8" : "h-6 w-9"} flex items-center justify-center`}>
        <IxaiLogo size="xs" />
      </div>
      <div className="min-w-0 text-right">
        <p
          className={`${isFeed ? "text-[5.8px]" : "text-[6px]"} whitespace-nowrap font-mono uppercase leading-[1.05] tracking-[0.1em]`}
          style={{ color: socialBrandTokens.gold }}
        >
          IXAI Intelligence
        </p>
        <p className={`${isFeed ? "text-[5.8px]" : "text-[6px]"} mt-0.5 whitespace-nowrap font-mono uppercase leading-[1.05] tracking-[0.07em] text-[rgba(244,240,230,0.5)]`}>
          {isFeed ? pack.dateLabel : index === 0 ? (pack.kind === "daily" ? "Daily Intelligence" : "Weekly Intelligence") : pack.dateLabel}
        </p>
      </div>
    </div>
  );
}

// v1.40.6d — Footer safe area. Three rows: brand line + page number,
// then disclaimer underneath. Lives inside the flex column flow so it
// cannot overlap the main content area regardless of body length.
function SlideFooter({
  format,
  index,
  pack,
}: {
  format: SocialExportFormat;
  index: number;
  pack: SocialIntelligencePack;
}) {
  const isFeed = format === "ig_feed_4_5";

  return (
    <footer
      className={`relative z-10 flex shrink-0 flex-col justify-end gap-1 border-t px-5 ${isFeed ? "pb-3 pt-2" : "pb-5 pt-3"}`}
      style={{ borderColor: "rgba(185,154,99,0.34)", height: FORMAT_LAYOUT[format].footerPct }}
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <p
            className="whitespace-nowrap font-mono text-[6px] leading-[1.2] tracking-normal"
            style={{ color: socialBrandTokens.gold }}
          >
            I-Xuan Investment Co., Ltd.
          </p>
          <p className="mt-0.5 whitespace-nowrap font-mono text-[6px] leading-[1.2] tracking-normal text-[rgba(244,240,230,0.5)]">
            app.ixuan.ai
          </p>
        </div>
        <p className="whitespace-nowrap font-mono text-[6px] leading-[1.2] tracking-normal text-[rgba(244,240,230,0.54)]">
          {index + 1} of {pack.slides.length}
        </p>
      </div>
      <p className="mt-1 text-[5px] leading-[1.3] text-[rgba(244,240,230,0.46)]">
        Market intelligence and education only. Not personalized investment advice.
      </p>
    </footer>
  );
}

// v1.44.0 — Slide 1 Stop-scroll Hook. Daily cards lead with the
// conversion hook from Daily Intelligence Core instead of compressing
// the whole brief into bullets. Weekly cards keep the broader recap role.
function CoverSlide({
  format,
  pack,
  slide,
}: {
  format: SocialExportFormat;
  pack: SocialIntelligencePack;
  slide: SocialIntelligencePack["slides"][number];
}) {
  const isFeed = format === "ig_feed_4_5";
  const title = pack.kind === "daily"
    ? slide.title
    : slide.title || (isFeed ? "本週市場正在 pricing 什麼" : "本週市場焦點");
  const bulletLimit = pack.kind === "daily" ? 2 : isFeed ? 4 : 4;
  const bullets = slide.bullets
    .slice(0, bulletLimit)
    .map((bullet) => fitReadableText(bullet, isFeed ? 30 : COPY_LIMITS.coverBullet, "資金開始要求更清楚的證據。"));

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div>
        <p
          className={`${isFeed ? "text-[7.4px]" : "text-[7px]"} font-mono uppercase tracking-[0.16em]`}
          style={{ color: socialBrandTokens.gold }}
        >
          {pack.kind === "daily" ? "Daily Intelligence" : "Weekly Intelligence"}
        </p>
        <h3 className={`${isFeed ? "mt-1.5 text-[20px]" : "mt-2 text-[18px]"} font-semibold leading-[1.08] tracking-normal`}>
          {title}
        </h3>
        {slide.subtitle ? (
          <p className={`${isFeed ? "mt-2 text-[9px]" : "mt-2.5 text-[8.8px]"} leading-[1.35] text-[rgba(244,240,230,0.68)]`}>
            {fitReadableText(slide.subtitle, isFeed ? 42 : 54, "市場正在要求更清楚的證據。")}
          </p>
        ) : null}
      </div>
      <div
        className={`${isFeed ? "mt-2.5 gap-1.5 pl-3" : "mt-3 gap-1.5 pl-3"} grid min-h-0 flex-1 content-start border-l`}
        style={{ borderColor: socialBrandTokens.gold }}
      >
        {bullets.map((line, lineIndex) => (
          <div className="grid grid-cols-[1rem_1fr] gap-1.5" key={`cover-lead-${lineIndex}`}>
            <span
              className={`${isFeed ? "text-[7.4px]" : "text-[7px]"} font-mono leading-[1.45]`}
              style={{ color: socialBrandTokens.gold }}
            >
              {lineIndex + 1}
            </span>
            <p className={`${isFeed ? "text-[8.4px]" : "text-[7.8px]"} font-medium leading-[1.42] text-[rgba(244,240,230,0.82)]`}>
              {line}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// v1.44.0 — Slide 2 Curiosity Builder / Weekly Market Pulse. Daily
// packs use the social curiosity field to explain why the reader should
// open the full brief; weekly packs retain the recap-style market pulse.
function MarketPulseSlide({
  format,
  slide,
}: {
  format: SocialExportFormat;
  slide: SocialIntelligencePack["slides"][number];
}) {
  const isFeed = format === "ig_feed_4_5";
  const Icon = slide.id === "market_review" ? Landmark : Globe2;
  const items = slide.bullets.slice(0, 3);
  const displayTitle = slide.title || (slide.id === "market_review" ? "Market Review" : "Market Pulse");
  const isCuriosityBuilder = slide.eyebrow === "Why It Matters";

  return (
    <div className="flex h-full flex-col">
      <div
        className="flex items-center justify-between gap-3 border-b pb-2"
        style={{ borderColor: "rgba(185,154,99,0.36)" }}
      >
        <div>
          <p
            className={`${isFeed ? "text-[7.4px]" : "text-[7px]"} font-mono uppercase tracking-[0.18em]`}
            style={{ color: socialBrandTokens.gold }}
          >
            {slide.eyebrow}
          </p>
          <h3 className={`${isFeed ? "text-[18px]" : "text-[16px]"} mt-1 font-semibold leading-tight`}>
            {displayTitle}
          </h3>
        </div>
        <Icon className="h-5 w-5 text-[var(--ixai-gold)]" strokeWidth={1.8} />
      </div>
      <div className={`${isFeed ? "mt-2.5 gap-1.5" : "mt-3 gap-2"} flex flex-1 flex-col justify-between`}>
        {items.map((bullet, bulletIndex) => {
          if (isCuriosityBuilder) {
            return (
              <div className="grid grid-cols-[1.6rem_1fr] gap-2" key={`${bullet}-${bulletIndex}`}>
                <p
                  className="font-mono text-[12px] leading-[1.05]"
                  style={{ color: socialBrandTokens.gold }}
                >
                  {String(bulletIndex + 1).padStart(2, "0")}
                </p>
                <p className={`${isFeed ? "text-[9.4px]" : "text-[8.8px]"} font-medium leading-[1.38] text-[rgba(244,240,230,0.76)]`}>
                  {fitReadableText(bullet, isFeed ? 54 : COPY_LIMITS.bodyBullet, "完整 Daily Brief 會拆解市場定價與風險約束。")}
                </p>
              </div>
            );
          }

          const item = splitBullet(bullet);

          return (
            <div className="grid grid-cols-[1.6rem_1fr] gap-2" key={`${bullet}-${bulletIndex}`}>
              <p
                className="font-mono text-[12px] leading-[1.05]"
                style={{ color: socialBrandTokens.gold }}
              >
                {String(bulletIndex + 1).padStart(2, "0")}
              </p>
              <div>
                <p className={`${isFeed ? "text-[9.6px]" : "text-[9px]"} font-semibold leading-[1.3]`}>{item.heading}</p>
                <p className={`${isFeed ? "text-[8.4px]" : "text-[8px]"} mt-0.5 leading-[1.35] text-[rgba(244,240,230,0.68)]`}>
                  {item.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// v1.40.6d — Slide 3 AI / Tech Watch. Symbol tags live in the main
// safe area at the bottom of the body — they cannot creep toward the
// footer because the footer is its own flex sibling.
function AiTechSlide({
  format,
  pack,
  slide,
}: {
  format: SocialExportFormat;
  pack: SocialIntelligencePack;
  slide: SocialIntelligencePack["slides"][number];
}) {
  const isFeed = format === "ig_feed_4_5";
  const points = slide.bullets.slice(0, 3);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p
            className={`${isFeed ? "text-[7.4px]" : "text-[7px]"} font-mono uppercase tracking-[0.18em]`}
            style={{ color: socialBrandTokens.gold }}
          >
            {slide.eyebrow}
          </p>
          <h3 className={`${isFeed ? "text-[18px]" : "text-[16px]"} mt-1 font-semibold leading-tight`}>AI / Tech Watch</h3>
        </div>
        <div className="flex gap-1.5">
          <Cpu className="h-4 w-4 text-[var(--ixai-gold)]" strokeWidth={1.8} />
          <Cloud className="h-4 w-4 text-[rgba(244,240,230,0.76)]" strokeWidth={1.8} />
        </div>
      </div>
      <div className={`${isFeed ? "mt-3 gap-2" : "mt-4 gap-2.5"} flex flex-1 flex-col`}>
        {points.map((bullet, bulletIndex) => {
          const item =
            bullet.includes("｜")
              ? splitBullet(bullet)
              : {
                  detail: fitReadableText(bullet, COPY_LIMITS.bodyBullet, "觀察 AI supply chain 與科技資金節奏。"),
                  heading: ["Key Signal", "Why It Matters", "Watch Next"][bulletIndex] ?? "Watch Next",
                };
          return (
            <div
              className="border-l pl-2"
              key={`${bullet}-${bulletIndex}`}
              style={{ borderColor: "rgba(185,154,99,0.52)" }}
            >
              <p className={`${isFeed ? "text-[9.5px]" : "text-[9px]"} font-semibold leading-[1.35]`}>
                {item.heading.replace(/^AI \/ Tech Watch[:：]?\s*/i, "Key Signal")}
              </p>
              <p className={`${isFeed ? "text-[8.4px]" : "text-[8px]"} mt-0.5 leading-[1.35] text-[rgba(244,240,230,0.66)]`}>
                {item.detail}
              </p>
            </div>
          );
        })}
      </div>
      <div className={`${isFeed ? "mt-2 gap-1" : "mt-3 gap-1.5"} flex flex-wrap`}>
        {techSymbolsFor(pack.kind)
          .slice(0, 5)
          .map((symbol) => (
            <span
              className={`${isFeed ? "text-[6.8px]" : "text-[6.5px]"} border px-1.5 py-0.5 font-mono uppercase tracking-[0.08em]`}
              key={symbol}
              style={{ borderColor: "rgba(185,154,99,0.45)", color: socialBrandTokens.gold }}
            >
              {symbol}
            </span>
          ))}
      </div>
    </div>
  );
}

// v1.41.2 — Slide 4 FCN / Risk Watch. Keeps the clear risk state card
// and adds up to three short reasons plus a readable FCN education line.
function RiskSlide({
  format,
  pack,
  slide,
}: {
  format: SocialExportFormat;
  pack: SocialIntelligencePack;
  slide: SocialIntelligencePack["slides"][number];
}) {
  const isFeed = format === "ig_feed_4_5";
  const riskStateBullet = slide.bullets.find((bullet) => /^Risk State/i.test(bullet));
  const activeStage = riskStateBullet?.split("｜")[1]?.trim() || riskStageFor(pack.kind);
  const copy = RISK_REGIME_COPY[activeStage] ?? RISK_REGIME_COPY.Moderate;
  const reasonItems = slide.bullets
    .filter((bullet) => /^Reason/i.test(bullet))
    .slice(0, isFeed ? 2 : 3)
    .map(splitRiskBullet);
  const fcnAwareness = splitRiskBullet(
    slide.bullets.find((bullet) => /FCN|KO|KI|Worst/i.test(bullet)) ?? `FCN Awareness｜${copy.fcn}`,
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p
            className={`${isFeed ? "text-[7.4px]" : "text-[7px]"} font-mono uppercase tracking-[0.18em]`}
            style={{ color: socialBrandTokens.gold }}
          >
            FCN / Risk Watch
          </p>
          <h3 className={`${isFeed ? "text-[18px]" : "text-[16px]"} mt-1 font-semibold leading-tight`}>Risk Regime</h3>
        </div>
        <ShieldCheck className="h-5 w-5 text-[var(--ixai-gold)]" strokeWidth={1.8} />
      </div>
      <div className={`${isFeed ? "mt-2.5 gap-2" : "mt-3 gap-2.5"} flex min-h-0 flex-1 flex-col justify-start`}>
        <div
            className={`${isFeed ? "px-3 py-1.5" : "px-3 py-2"} rounded-sm border`}
          style={{
            borderColor: socialBrandTokens.gold,
            backgroundColor: "rgba(185,154,99,0.1)",
          }}
        >
          <p
            className="font-mono text-[6.5px] uppercase tracking-[0.16em]"
            style={{ color: socialBrandTokens.gold }}
          >
            Current Risk State
          </p>
          <p
            className={`${isFeed ? "text-[20px]" : "text-[20px]"} mt-1 font-mono font-semibold leading-[1.05]`}
            style={{ color: socialBrandTokens.gold }}
          >
            {activeStage}
          </p>
        </div>
        <div className="min-h-0">
          <p
            className="font-mono text-[6.5px] uppercase tracking-[0.16em]"
            style={{ color: socialBrandTokens.gold }}
          >
            Why It Matters
          </p>
          <div className="mt-1 grid gap-1.5">
            {(reasonItems.length > 0 ? reasonItems : [{ detail: copy.meaning, heading: "Reason" }]).map((item, index) => (
              <p className={`${isFeed ? "text-[8.2px]" : "text-[7.8px]"} leading-[1.35] text-[rgba(244,240,230,0.78)]`} key={`${item.detail}-${index}`}>
                <span style={{ color: socialBrandTokens.gold }}>{index + 1}.</span> {item.detail}
              </p>
            ))}
          </div>
        </div>
        <div>
          <p
            className="font-mono text-[6.5px] uppercase tracking-[0.16em]"
            style={{ color: socialBrandTokens.gold }}
          >
            FCN Awareness
          </p>
          <p className={`${isFeed ? "text-[8.7px]" : "text-[8.5px]"} mt-1 leading-[1.38] text-[rgba(244,240,230,0.82)]`}>
            {fcnAwareness.detail}
          </p>
        </div>
      </div>
    </div>
  );
}

// v1.41.2 — Slide 5 I-Xuan View. Complete branded viewpoint instead
// of a clipped headline fragment. The paragraph is concise enough for
// story viewing and remains inside the main safe area.
function IxuanViewSlide({
  format,
  slide,
}: {
  format: SocialExportFormat;
  slide: SocialIntelligencePack["slides"][number];
}) {
  const isFeed = format === "ig_feed_4_5";
  const mainRaw = slide.bullets[0] ?? "先整理風險，再判讀機會。";
  const main = fitReadableText(mainRaw, isFeed ? 80 : COPY_LIMITS.viewMain, "今日重點不是追逐短線雜訊，而是先整理風險，再判讀哪些主題值得持續觀察。");
  const supportingRaw = [slide.bullets[1], slide.bullets[2]]
    .filter(Boolean)
    .join(" ");
  const supplement = fitReadableText(
    supportingRaw || "想看完整市場訊號與下一步觀察，請進 IXAI App。",
    isFeed ? 36 : 64,
    "進 IXAI 讀完整 Brief。",
  );

  return (
    <div className="flex h-full min-h-0 flex-col justify-between">
      <div>
        <Quote className="h-6 w-6 text-[var(--ixai-gold)]" strokeWidth={1.7} />
        <p
          className="mt-3 font-mono text-[7px] uppercase tracking-[0.18em]"
          style={{ color: socialBrandTokens.gold }}
        >
          {slide.id === "weekly_view" ? "I-Xuan Weekly View" : "I-Xuan View"}
        </p>
        <h3 className={`${isFeed ? "text-[16px]" : "text-[14px]"} mt-2 font-semibold leading-[1.16]`}>
          {main}
        </h3>
      </div>
      <p
        className={`${isFeed ? "text-[9px]" : "text-[8.5px]"} border-t pt-3 leading-[1.4] text-[rgba(244,240,230,0.68)]`}
        style={{ borderColor: "rgba(185,154,99,0.38)" }}
      >
        {supplement}
      </p>
    </div>
  );
}

// v1.40.6d — Fallback layout for any slide id we don't have a custom
// template for. Bullets capped to bodyBullet length.
function StandardSlide({
  format,
  slide,
}: {
  format: SocialExportFormat;
  slide: SocialIntelligencePack["slides"][number];
}) {
  const isFeed = format === "ig_feed_4_5";

  return (
    <div className="flex h-full flex-col">
      <div
        className="flex items-center justify-between gap-3 border-b pb-2"
        style={{ borderColor: "rgba(185,154,99,0.34)" }}
      >
        <div>
          <p
            className="font-mono text-[7px] uppercase tracking-[0.18em]"
            style={{ color: socialBrandTokens.gold }}
          >
            {slide.eyebrow}
          </p>
          <h3 className={`${isFeed ? "text-[18px]" : "text-[16px]"} mt-1 font-semibold leading-tight`}>{slide.title}</h3>
        </div>
        {renderSlideIcon(slide.id)}
      </div>
      <div className="mt-3 flex flex-1 flex-col gap-2">
        {slide.bullets.slice(0, isFeed ? 3 : 3).map((bullet) => (
          <p
            className={`${isFeed ? "text-[9px]" : "text-[8.5px]"} border-l pl-2 leading-[1.4] text-[rgba(244,240,230,0.74)]`}
            key={bullet}
            style={{ borderColor: "rgba(185,154,99,0.5)" }}
          >
            {fitReadableText(bullet, COPY_LIMITS.bodyBullet, "維持情境觀察與風險意識。")}
          </p>
        ))}
      </div>
    </div>
  );
}

function SlideBody({
  format,
  pack,
  slide,
}: {
  format: SocialExportFormat;
  pack: SocialIntelligencePack;
  slide: SocialIntelligencePack["slides"][number];
}) {
  const compressed = compressSocialText({
    bullets: slide.bullets,
    format: toSocialFormat(format),
    kind: pack.kind,
    slideId: slide.id,
    subtitle: slide.subtitle,
    title: slide.title,
  });
  const safeSlide = {
    ...slide,
    ...compressed,
  };

  if (safeSlide.id === "cover") {
    return <CoverSlide format={format} pack={pack} slide={safeSlide} />;
  }

  if (safeSlide.id === "top_news" || safeSlide.id === "market_review") {
    return <MarketPulseSlide format={format} slide={safeSlide} />;
  }

  if (safeSlide.id === "ai_tech_watch") {
    return <AiTechSlide format={format} pack={pack} slide={safeSlide} />;
  }

  if (safeSlide.id === "fcn_risk_watch") {
    return <RiskSlide format={format} pack={pack} slide={safeSlide} />;
  }

  if (safeSlide.id === "ixuan_view" || safeSlide.id === "weekly_view") {
    return <IxuanViewSlide format={format} slide={safeSlide} />;
  }

  return <StandardSlide format={format} slide={safeSlide} />;
}

// v1.40.6d — Slide preview wrapper. Replaces the previous
// pb-24 + absolute footer pattern with three explicit safe-area
// siblings: header / main / footer. Only the decorative gradient and
// the soft border ring remain absolute; nothing content-bearing is.
function SlidePreview({
  format,
  index,
  pack,
  slideRef,
}: {
  format: SocialExportFormat;
  index: number;
  pack: SocialIntelligencePack;
  slideRef?: (node: HTMLElement | null) => void;
}) {
  const slide = pack.slides[index];
  const layout = FORMAT_LAYOUT[format];
  const exportConfig = socialExportFormats[format];

  if (!slide) {
    return null;
  }

  return (
    <article
      className={`relative flex ${layout.previewWidthClass} max-w-full flex-col overflow-hidden border shadow-[0_24px_90px_rgba(0,0,0,0.28)]`}
      data-social-slide={`${pack.kind}-${index + 1}`}
      data-social-format={format}
      ref={slideRef}
      style={{
        aspectRatio: exportConfig.aspectRatio,
        backgroundColor: socialBrandTokens.forest,
        borderColor: "rgba(185,154,99,0.26)",
        color: socialBrandTokens.cream,
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[20%]"
        style={{
          background: `linear-gradient(180deg, rgba(185,154,99,0.18), rgba(185,154,99,0))`,
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-1/3 h-36 w-36 rounded-full border"
        style={{ borderColor: "rgba(185,154,99,0.12)" }}
      />
      <SlideHeader format={format} index={index} pack={pack} />
      <main className={`relative z-10 min-h-0 flex-1 overflow-hidden ${layout.bodyClass}`}>
        <SlideBody format={format} pack={pack} slide={slide} />
      </main>
      <SlideFooter format={format} index={index} pack={pack} />
    </article>
  );
}

function SocialPackPreview({
  disabled = false,
  format,
  onDownload,
  pack,
  registerSlide,
}: {
  disabled?: boolean;
  format: SocialExportFormat;
  onDownload: (index: number) => void;
  pack: SocialIntelligencePack;
  registerSlide: (index: number, node: HTMLElement | null) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
      {pack.slides.map((slide, index) => (
        <div className="grid justify-items-center gap-3" key={slide.id}>
          <SlidePreview
            format={format}
            index={index}
            pack={pack}
            slideRef={(node) => registerSlide(index, node)}
          />
          <button
            className={`${FORMAT_LAYOUT[format].previewWidthClass} max-w-full rounded-lg border border-[rgba(176,141,87,0.28)] px-3 py-2 text-xs font-semibold text-[var(--ixai-gold)] transition hover:bg-[rgba(176,141,87,0.1)] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent`}
            disabled={disabled}
            onClick={() => onDownload(index)}
            type="button"
          >
            Download PNG
          </button>
        </div>
      ))}
    </div>
  );
}

export function SocialIntelligencePackStudio({
  dailyDraft,
  defaultKind = "daily",
  selectedWeeklyDraft,
  weeklyDraft,
}: SocialIntelligencePackStudioProps) {
  const [activeKind, setActiveKind] = useState<SocialPackKind>(defaultKind);
  const [activeFormat, setActiveFormat] = useState<SocialExportFormat>(DEFAULT_FORMAT);
  const [copyState, setCopyState] = useState("Caption ready for manual publishing.");
  const [exportState, setExportState] = useState("PNG export ready.");
  const [isExporting, setIsExporting] = useState(false);
  const slideRefs = useRef<Array<HTMLElement | null>>([]);

  const dailyPack = useMemo(() => generateDailySocialPack(dailyDraft), [dailyDraft]);
  const weeklyPack = useMemo(() => generateWeeklySocialPack(weeklyDraft), [weeklyDraft]);
  const activePack = activeKind === "daily" ? dailyPack : weeklyPack;
  const activeFormatConfig = socialExportFormats[activeFormat];
  const dailySourceReady = Boolean(dailyDraft?.id && dailyDraft.slug);
  const weeklySourceReady = Boolean(weeklyDraft?.id && weeklyDraft.slug);
  const sourceAlignment = sourceAlignmentFor({
    dailyDraft,
    kind: activeKind,
    pack: activePack,
    selectedWeeklyDraft,
    weeklyDraft,
  });
  const quality = useMemo(() => detectSocialPackQualityIssues(activePack), [activePack]);
  const canExportPack = sourceAlignment.canExport && quality.canExport;
  const exportBlockedMessage =
    sourceAlignment.warning ||
    (!quality.canExport
      ? "目前 Social Pack 含待審閱文字或 placeholder。可以預覽，但不可正式匯出。"
      : "No matching source is available for this period.");

  function registerSlide(index: number, node: HTMLElement | null) {
    slideRefs.current[index] = node;
  }

  async function copyCaption() {
    if (!canExportPack) {
      setCopyState(exportBlockedMessage);
      return;
    }

    try {
      await navigator.clipboard.writeText(activePack.caption);
      setCopyState("Caption copied. Review before posting to FB / IG / LINE.");
    } catch {
      setCopyState("Copy unavailable in this browser. Select the caption text manually.");
    }
  }

  async function exportSlide(index: number) {
    if (!canExportPack) {
      setExportState(exportBlockedMessage);
      return;
    }

    const node = slideRefs.current[index];

    if (!node) {
      setExportState("Slide is not ready yet. Open the preview and try again.");
      return;
    }

    setIsExporting(true);
    setExportState(`Exporting ${createFileName(activePack.kind, index, activeFormat)}...`);

    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(node, {
        backgroundColor: socialBrandTokens.forest,
        cacheBust: true,
        canvasHeight: activeFormatConfig.height,
        canvasWidth: activeFormatConfig.width,
        pixelRatio: 1,
      });
      downloadDataUrl(dataUrl, createFileName(activePack.kind, index, activeFormat));
      setExportState(`${createFileName(activePack.kind, index, activeFormat)} exported at ${activeFormatConfig.width} × ${activeFormatConfig.height}.`);
    } catch {
      setExportState("PNG export failed in this browser. Please retry after images finish loading.");
    } finally {
      setIsExporting(false);
    }
  }

  async function exportCurrentPack() {
    if (!canExportPack) {
      setExportState(exportBlockedMessage);
      return;
    }

    setIsExporting(true);
    setExportState(`Exporting ${activePack.kind} pack...`);

    try {
      const { toPng } = await import("html-to-image");

      for (const [index, node] of slideRefs.current.entries()) {
        if (!node || index >= activePack.slides.length) {
          continue;
        }

        const dataUrl = await toPng(node, {
          backgroundColor: socialBrandTokens.forest,
          cacheBust: true,
          canvasHeight: activeFormatConfig.height,
          canvasWidth: activeFormatConfig.width,
          pixelRatio: 1,
        });
        downloadDataUrl(dataUrl, createFileName(activePack.kind, index, activeFormat));
        await new Promise((resolve) => window.setTimeout(resolve, 180));
      }

      setExportState(`${activePack.title} exported as ${activeFormatConfig.width} × ${activeFormatConfig.height} PNG slides.`);
    } catch {
      setExportState("Export Current Pack failed. Try downloading slides individually.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <section
      className="rounded-lg border p-4 sm:p-5"
      style={{
        backgroundColor: "rgba(185,154,99,0.07)",
        borderColor: "rgba(185,154,99,0.24)",
      }}
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
            Social Intelligence Engine
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-8 text-[var(--ixai-cream)]">
            一玄 / IXAI Social Content Pack
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[rgba(245,240,230,0.62)]">
            產生供 IG Feed / Carousel、FB / Threads 與 Story / LINE 手動發布的平台化圖文素材。每張卡片固定使用正式一玄
            Logo、IXAI Intelligence header、統一 footer 與 disclaimer。Social Pack 從 IXAI Insight Engine 與已審閱 Brief 派生，不自動發文、不串接平台 API。
          </p>
        </div>
        <div className="grid gap-2 sm:flex sm:flex-wrap xl:justify-end">
          <button
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeKind === "daily"
                ? "bg-[var(--ixai-gold)] text-[var(--ixai-forest)]"
                : "border border-white/10 text-[rgba(245,240,230,0.72)] hover:bg-white/[0.055]"
            } disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.035] disabled:text-[rgba(245,240,230,0.36)]`}
            disabled={!dailySourceReady}
            onClick={() => {
              if (!dailySourceReady) {
                return;
              }
              setActiveKind("daily");
              setCopyState("Daily caption ready for manual publishing.");
            }}
            title={
              dailySourceReady
                ? "Daily Social Pack must be generated from the current Daily Brief source."
                : "找不到對應的 Daily Brief 來源，請先產生或選擇 Daily Brief。"
            }
            type="button"
          >
            Generate Daily Social Pack
          </button>
          <button
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeKind === "weekly"
                ? "bg-[var(--ixai-gold)] text-[var(--ixai-forest)]"
                : "border border-white/10 text-[rgba(245,240,230,0.72)] hover:bg-white/[0.055]"
            } disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.035] disabled:text-[rgba(245,240,230,0.36)]`}
            disabled={!weeklySourceReady}
            onClick={() => {
              if (!weeklySourceReady) {
                return;
              }
              setActiveKind("weekly");
              setCopyState("Weekly caption ready for manual publishing.");
            }}
            title={
              weeklySourceReady
                ? "Weekly Social Pack must be generated from the current Weekly Brief source."
                : "找不到對應的 Weekly Brief 來源，請先產生或選擇 Weekly Brief。"
            }
            type="button"
          >
            Generate Weekly Social Pack
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-xs leading-5 text-[rgba(245,240,230,0.58)] md:grid-cols-3">
        <p className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
          Format: <span className="text-[var(--ixai-cream)]">{activeFormatConfig.label} · {activeFormatConfig.width} × {activeFormatConfig.height}</span>
        </p>
        <p className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
          Brand: <span className="text-[var(--ixai-cream)]">/logo/ixuan-logo.png · IXAI Intelligence</span>
        </p>
        <p className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
          Source: <span className="text-[var(--ixai-cream)]">{packSourceLabel(activePack)}</span>
        </p>
        <p className="rounded-md border border-[rgba(176,141,87,0.22)] bg-[rgba(176,141,87,0.08)] px-3 py-2 text-[rgba(245,240,230,0.68)]">
          Source of Truth:{" "}
          <span className="text-[var(--ixai-cream)]">
            {activeKind === "daily" ? "Daily Intelligence Core" : "Weekly Intelligence Core"}
          </span>
        </p>
        <p className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
          Footer: <span className="text-[var(--ixai-cream)]">I-Xuan Investment Co., Ltd. · app.ixuan.ai</span>
        </p>
        <p className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
          Publish mode: <span className="text-[var(--ixai-cream)]">manual review only</span>
        </p>
        <p className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
          Source period: <span className="text-[var(--ixai-cream)]">{sourceAlignment.sourcePeriod}</span>
        </p>
        <p className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
          Source slug: <span className="text-[var(--ixai-cream)]">{sourceAlignment.sourceSlug}</span>
        </p>
        {activeKind === "weekly" ? (
          <p className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
            Selected slug: <span className="text-[var(--ixai-cream)]">{sourceAlignment.selectedSourceSlug}</span>
          </p>
        ) : null}
        <p className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
          Source title: <span className="text-[var(--ixai-cream)]">{sourceAlignment.sourceTitle}</span>
        </p>
        <p className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
          Source date: <span className="text-[var(--ixai-cream)]">{sourceAlignment.sourceDate}</span>
        </p>
        <p className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
          Source status: <span className="text-[var(--ixai-cream)]">{sourceAlignment.sourceStatus}</span>
        </p>
        {activeKind === "weekly" ? (
          <p className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
            Selected status: <span className="text-[var(--ixai-cream)]">{sourceAlignment.selectedSourceStatus}</span>
          </p>
        ) : null}
        <p className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
          Revision: <span className="text-[var(--ixai-cream)]">{sourceAlignment.revisionLabel}</span>
        </p>
        {activeKind === "weekly" ? (
          <p className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
            Selected revision: <span className="text-[var(--ixai-cream)]">{sourceAlignment.selectedRevisionLabel}</span>
          </p>
        ) : null}
        <p className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
          Canonical: <span className="text-[var(--ixai-cream)]">{sourceAlignment.canonicalLabel}</span>
        </p>
        {activeKind === "weekly" ? (
          <p className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
            Selected canonical: <span className="text-[var(--ixai-cream)]">{sourceAlignment.selectedCanonicalLabel}</span>
          </p>
        ) : null}
        <p className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
          Source eligible: <span className="text-[var(--ixai-cream)]">{sourceAlignment.exportEligibleLabel}</span>
        </p>
        <p className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
          Eligibility reason: <span className="text-[var(--ixai-cream)]">{sourceAlignment.eligibilityReason}</span>
        </p>
        <p className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
          Fallback: <span className="text-[var(--ixai-cream)]">{sourceAlignment.fallbackLabel}</span>
        </p>
        <p className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
          Content quality: <span className="text-[var(--ixai-cream)]">{quality.statusLabel}</span>
        </p>
        <p className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
          Quality issues: <span className="text-[var(--ixai-cream)]">{quality.issues.length}</span>
        </p>
        <p className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
          Export eligible: <span className="text-[var(--ixai-cream)]">{canExportPack ? "true" : "false"}</span>
        </p>
      </div>

      {!sourceAlignment.canExport ? (
        <div className="mt-4 rounded-lg border border-[rgba(176,141,87,0.32)] bg-[rgba(176,141,87,0.1)] p-3 text-sm leading-6 text-[var(--ixai-cream)]">
          <p className="font-semibold">
            {sourceAlignment.warning || "No matching source is available for this period."}
          </p>
          <p className="mt-1 text-xs leading-5 text-[rgba(245,240,230,0.58)]">
            Daily Social Pack must be generated from the current Daily Brief source. Weekly Social Pack must be generated from the current Weekly Brief source.
          </p>
        </div>
      ) : null}

      {!quality.canExport ? (
        <div className="mt-4 rounded-lg border border-[rgba(176,141,87,0.32)] bg-[rgba(176,141,87,0.1)] p-3 text-sm leading-6 text-[var(--ixai-cream)]">
          <p className="font-semibold">
            Content quality: failed
          </p>
          <p className="mt-1 text-xs leading-5 text-[rgba(245,240,230,0.62)]">
            目前 Social Pack 含待審閱文字或 placeholder。可以預覽，但不可正式匯出。
          </p>
          <ul className="mt-2 grid gap-1 text-xs leading-5 text-[rgba(245,240,230,0.72)]">
            {quality.topIssues.map((issue) => (
              <li key={issue}>• {issue}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div
        className="mt-5 rounded-lg border border-white/10 p-4"
        style={{ backgroundColor: socialBrandTokens.dark }}
      >
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              Preview Social Pack
            </p>
            <p className="mt-1 text-sm leading-6 text-[rgba(245,240,230,0.62)]">
              {activePack.title} · {activePack.dateLabel} · 最多 5 張 {FORMAT_LAYOUT[activeFormat].title} 卡片。
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 xl:min-w-[26rem]">
            {(Object.keys(socialExportFormats) as SocialExportFormat[]).map((format) => (
              <button
                className={`rounded-lg px-3 py-2 text-left text-xs font-semibold transition ${
                  activeFormat === format
                    ? "bg-[var(--ixai-gold)] text-[var(--ixai-forest)]"
                    : "border border-white/10 text-[rgba(245,240,230,0.72)] hover:bg-white/[0.055]"
                }`}
                key={format}
                onClick={() => {
                  setActiveFormat(format);
                  setExportState(`${socialExportFormats[format].label} export ready.`);
                }}
                type="button"
              >
                <span className="block">{socialExportFormats[format].label}</span>
                <span className="mt-0.5 block font-normal opacity-70">
                  {socialExportFormats[format].width} × {socialExportFormats[format].height}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-3 rounded-lg border border-[rgba(176,141,87,0.22)] bg-[rgba(176,141,87,0.08)] p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
              Export Controls
            </p>
            <p className="mt-1 text-xs leading-5 text-[rgba(245,240,230,0.56)]">
              Export PNG preserves logo, IXAI Intelligence header, footer, and disclaimer. Current format: {activeFormatConfig.platform}. Publishing remains manual.
            </p>
          </div>
          <button
            className="rounded-lg bg-[var(--ixai-gold)] px-4 py-2 text-sm font-semibold text-[var(--ixai-forest)] disabled:cursor-wait disabled:opacity-60"
            disabled={isExporting || !canExportPack}
            onClick={exportCurrentPack}
            type="button"
          >
            {isExporting ? "Exporting..." : canExportPack ? "Export Current Pack" : "Export disabled"}
          </button>
        </div>
        <div className="mt-5 overflow-x-hidden">
          <SocialPackPreview
            disabled={!canExportPack}
            format={activeFormat}
            onDownload={exportSlide}
            pack={activePack}
            registerSlide={registerSlide}
          />
        </div>
        <p className="mt-3 text-xs leading-5 text-[rgba(245,240,230,0.5)]">{exportState}</p>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_0.62fr]">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              Copy Caption
            </p>
            <button
              className="rounded-lg bg-[var(--ixai-gold)] px-3 py-2 text-xs font-semibold text-[var(--ixai-forest)] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!canExportPack}
              onClick={copyCaption}
              type="button"
            >
              Copy caption
            </button>
          </div>
          <pre
            className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap rounded-md border border-white/10 p-3 text-xs leading-6 text-[rgba(245,240,230,0.72)]"
            style={{ backgroundColor: socialBrandTokens.dark }}
          >
            {activePack.caption}
          </pre>
          <p className="mt-2 text-xs leading-5 text-[rgba(245,240,230,0.46)]">{copyState}</p>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-[rgba(245,240,230,0.62)]">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
            Export Status
          </p>
          <p className="mt-2">
            Export produces download-ready PNG files for manual FB / IG / LINE publishing.
            The current pack exports each card at {activeFormatConfig.width} × {activeFormatConfig.height}.
          </p>
          <div className="mt-3 grid gap-2 rounded-md border border-white/10 bg-white/[0.035] p-3 text-xs leading-5 text-[rgba(245,240,230,0.5)]">
            <p>Future: Publish Center with approval-ready publishing queue.</p>
            <p>Future: optional ZIP packaging after compliance review.</p>
          </div>
          <p className="mt-3 rounded-md border border-white/10 bg-white/[0.035] p-3 text-xs leading-5 text-[rgba(245,240,230,0.5)]">
            {activePack.disclaimer} Automated FB / IG / LINE publishing remains off.
          </p>
        </div>
      </div>
    </section>
  );
}
