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
  socialBrandTokens,
  type SocialIntelligencePack,
  type SocialPackKind,
} from "@/src/lib/intelligence/social";
import type { DailyBriefDraft, WeeklyIntelligenceDraft } from "@/src/types/editorial";

type SocialIntelligencePackStudioProps = {
  dailyDraft?: DailyBriefDraft | null;
  weeklyDraft?: WeeklyIntelligenceDraft | null;
  defaultKind?: SocialPackKind;
};

const EXPORT_WIDTH = 1080;
const EXPORT_HEIGHT = 1920;
const DAILY_TECH_SYMBOLS = ["NVDA", "MSFT", "AMD", "AVGO", "PLTR"];
const WEEKLY_TECH_SYMBOLS = ["AI Infra", "Semis", "Cloud", "Data Center", "Software"];

// v1.40.6d — Social pack export scaling reference.
// Preview cards render at 280px wide with a fixed 9:16 aspect ratio
// (~498px tall). html-to-image scales that DOM up to 1080 × 1920 for
// PNG export, so the effective scaling factor is 1080 / 280 ≈ 3.857.
// All typography caps below are picked so the export hits the ceilings
// specified in PROJECT_RULES Social Pack Layout Safety:
//   Cover H1 ≤ 72px export   → ≤ 18px preview
//   Content H1 ≤ 64px export → ≤ 16px preview
//   Body ≤ 34px export       → ≤ 8.8px preview
//   Footer 22-26px export    → 6px preview
//   Disclaimer 18-22px export → 5px preview
const HEADER_HEIGHT_CLASS = "h-[9.375%]"; // 180 / 1920
const FOOTER_HEIGHT_CLASS = "h-[13.542%]"; // 260 / 1920

// Per-slide copy compression caps (CJK glyphs). Hard upper bounds —
// the render layer truncates above them even if the data layer let
// longer copy through. Small intentionally; social readers scan.
const COPY_LIMITS = {
  coverHeadline: 18,
  insightLine: 24,
  bodyBullet: 28,
  newsTitle: 14,
  newsSummary: 22,
  viewMain: 20,
  viewSupplement: 36,
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

function createFileName(kind: SocialPackKind, index: number) {
  return `${kind}-social-pack-${String(index + 1).padStart(2, "0")}.png`;
}

function downloadDataUrl(dataUrl: string, fileName: string) {
  const link = document.createElement("a");
  link.download = fileName;
  link.href = dataUrl;
  link.click();
}

// v1.40.6d — Render-layer compression helper. Trims trailing
// whitespace, collapses runs, and adds an ellipsis when the string
// exceeds the cap. The function name mirrors the spec.
function compactText(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1)}…`;
}

// v1.40.6d — Split a long Chinese line into shorter visual lines so
// the cover headline and the I-Xuan view main quote do not break
// awkwardly inside fixed-width safe areas.
function splitIntoShortLines(value: string, maxCharsPerLine: number): string[] {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return [];
  }

  const lines: string[] = [];

  for (let i = 0; i < normalized.length; i += maxCharsPerLine) {
    lines.push(normalized.slice(i, i + maxCharsPerLine));
  }

  return lines;
}

// Split a "headline｜detail" bullet payload into two compacted pieces.
function splitBullet(value: string) {
  const parts = value.split("｜");
  const heading = compactText(parts[0] ?? value, COPY_LIMITS.newsTitle);
  const detail = compactText(parts.slice(1).join("｜") || value, COPY_LIMITS.newsSummary);

  return { detail, heading };
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
function SlideHeader({ index, pack }: { index: number; pack: SocialIntelligencePack }) {
  return (
    <div className={`${HEADER_HEIGHT_CLASS} relative z-10 flex shrink-0 items-center justify-between gap-3 px-5 pt-4`}>
      <div className="flex h-6 w-9 items-center justify-center">
        <IxaiLogo size="xs" />
      </div>
      <div className="min-w-0 text-right">
        <p
          className="whitespace-nowrap font-mono text-[6px] uppercase leading-[1.05] tracking-[0.1em]"
          style={{ color: socialBrandTokens.gold }}
        >
          IXAI Intelligence
        </p>
        <p className="mt-0.5 whitespace-nowrap font-mono text-[6px] uppercase leading-[1.05] tracking-[0.07em] text-[rgba(244,240,230,0.5)]">
          {index === 0 ? (pack.kind === "daily" ? "Daily Intelligence" : "Weekly Intelligence") : pack.dateLabel}
        </p>
      </div>
    </div>
  );
}

// v1.40.6d — Footer safe area. Three rows: brand line + page number,
// then disclaimer underneath. Lives inside the flex column flow so it
// cannot overlap the main content area regardless of body length.
function SlideFooter({ index, pack }: { index: number; pack: SocialIntelligencePack }) {
  return (
    <footer
      className={`${FOOTER_HEIGHT_CLASS} relative z-10 flex shrink-0 flex-col justify-end gap-1 border-t px-5 pb-5 pt-3`}
      style={{ borderColor: "rgba(185,154,99,0.34)" }}
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

// v1.40.6d — Slide 1 Cover. One short insight line, no long copy.
function CoverSlide({ pack, slide }: { pack: SocialIntelligencePack; slide: SocialIntelligencePack["slides"][number] }) {
  const title = pack.kind === "daily" ? "今日市場最重要的事" : "本週市場焦點";
  const leadRaw = compactText(slide.bullets[0] ?? "市場脈絡與風險環境已整理完成。", COPY_LIMITS.insightLine);
  // v1.40.6d — Break the lead insight into ≤12-char visual lines so a
  // long Chinese sentence never wraps mid-phrase against the fixed
  // safe-area width.
  const leadLines = splitIntoShortLines(leadRaw, 12);

  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        <p
          className="font-mono text-[7px] uppercase tracking-[0.16em]"
          style={{ color: socialBrandTokens.gold }}
        >
          {pack.kind === "daily" ? "Daily Intelligence" : "Weekly Intelligence"}
        </p>
        <h3 className="mt-2 text-[18px] font-semibold leading-[1.1] tracking-normal">
          {title}
        </h3>
      </div>
      <div
        className="mt-3 border-l pl-3"
        style={{ borderColor: socialBrandTokens.gold }}
      >
        {leadLines.map((line, lineIndex) => (
          <p
            className="text-[8.5px] font-medium leading-[1.45] text-[rgba(244,240,230,0.82)]"
            key={`cover-lead-${lineIndex}`}
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

// v1.40.6d — Slide 2 Market Pulse. Exactly three news items in three
// rows, each row capped at title 14 + summary 22 chars to guarantee
// two lines max per item.
function MarketPulseSlide({ slide }: { slide: SocialIntelligencePack["slides"][number] }) {
  const Icon = slide.id === "market_review" ? Landmark : Globe2;
  const items = slide.bullets.slice(0, 3);

  return (
    <div className="flex h-full flex-col">
      <div
        className="flex items-center justify-between gap-3 border-b pb-2"
        style={{ borderColor: "rgba(185,154,99,0.36)" }}
      >
        <div>
          <p
            className="font-mono text-[7px] uppercase tracking-[0.18em]"
            style={{ color: socialBrandTokens.gold }}
          >
            {slide.eyebrow}
          </p>
          <h3 className="mt-1 text-[16px] font-semibold leading-tight">
            {slide.id === "market_review" ? "Market Review" : "Market Pulse"}
          </h3>
        </div>
        <Icon className="h-5 w-5 text-[var(--ixai-gold)]" strokeWidth={1.8} />
      </div>
      <div className="mt-3 flex flex-1 flex-col justify-between gap-2">
        {items.map((bullet, bulletIndex) => {
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
                <p className="text-[9px] font-semibold leading-[1.35]">{item.heading}</p>
                <p className="mt-0.5 text-[8px] leading-[1.4] text-[rgba(244,240,230,0.68)]">
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
function AiTechSlide({ pack, slide }: { pack: SocialIntelligencePack; slide: SocialIntelligencePack["slides"][number] }) {
  const points = slide.bullets.slice(0, 3);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p
            className="font-mono text-[7px] uppercase tracking-[0.18em]"
            style={{ color: socialBrandTokens.gold }}
          >
            {slide.eyebrow}
          </p>
          <h3 className="mt-1 text-[16px] font-semibold leading-tight">AI / Tech Watch</h3>
        </div>
        <div className="flex gap-1.5">
          <Cpu className="h-4 w-4 text-[var(--ixai-gold)]" strokeWidth={1.8} />
          <Cloud className="h-4 w-4 text-[rgba(244,240,230,0.76)]" strokeWidth={1.8} />
        </div>
      </div>
      <div className="mt-4 flex flex-1 flex-col gap-2.5">
        {points.map((bullet, bulletIndex) => {
          const item = splitBullet(bullet);
          return (
            <div
              className="border-l pl-2"
              key={`${bullet}-${bulletIndex}`}
              style={{ borderColor: "rgba(185,154,99,0.52)" }}
            >
              <p className="text-[9px] font-semibold leading-[1.35]">
                {compactText(item.heading, COPY_LIMITS.newsTitle)}
              </p>
              <p className="mt-0.5 text-[8px] leading-[1.4] text-[rgba(244,240,230,0.66)]">
                {compactText(item.detail, COPY_LIMITS.bodyBullet)}
              </p>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {techSymbolsFor(pack.kind)
          .slice(0, 5)
          .map((symbol) => (
            <span
              className="border px-1.5 py-0.5 font-mono text-[6.5px] uppercase tracking-[0.08em]"
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

// v1.40.6d — Slide 4 FCN / Risk Watch. No multi-row risk bar. Single
// state + one-line meaning + one-line FCN awareness, exactly as the
// v1.40.6d spec asks for.
function RiskSlide({ pack, slide }: { pack: SocialIntelligencePack; slide: SocialIntelligencePack["slides"][number] }) {
  const activeStage = riskStageFor(pack.kind);
  const copy = RISK_REGIME_COPY[activeStage] ?? RISK_REGIME_COPY.Moderate;
  const fcnAwareness = compactText(
    slide.bullets.find((bullet) => /FCN|KO|KI|Worst/i.test(bullet)) ?? copy.fcn,
    COPY_LIMITS.viewSupplement,
  );
  const meaning = compactText(copy.meaning, COPY_LIMITS.viewSupplement);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p
            className="font-mono text-[7px] uppercase tracking-[0.18em]"
            style={{ color: socialBrandTokens.gold }}
          >
            FCN / Risk Watch
          </p>
          <h3 className="mt-1 text-[16px] font-semibold leading-tight">Risk Regime</h3>
        </div>
        <ShieldCheck className="h-5 w-5 text-[var(--ixai-gold)]" strokeWidth={1.8} />
      </div>
      <div className="mt-5 flex flex-1 flex-col justify-center gap-3">
        <div
          className="rounded-sm border px-3 py-2"
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
            className="mt-1 font-mono text-[20px] font-semibold leading-[1.05]"
            style={{ color: socialBrandTokens.gold }}
          >
            {activeStage}
          </p>
        </div>
        <div>
          <p
            className="font-mono text-[6.5px] uppercase tracking-[0.16em]"
            style={{ color: socialBrandTokens.gold }}
          >
            Risk Meaning
          </p>
          <p className="mt-1 text-[8.5px] leading-[1.45] text-[rgba(244,240,230,0.82)]">
            {meaning}
          </p>
        </div>
        <div>
          <p
            className="font-mono text-[6.5px] uppercase tracking-[0.16em]"
            style={{ color: socialBrandTokens.gold }}
          >
            FCN Awareness
          </p>
          <p className="mt-1 text-[8.5px] leading-[1.45] text-[rgba(244,240,230,0.82)]">
            {fcnAwareness}
          </p>
        </div>
      </div>
    </div>
  );
}

// v1.40.6d — Slide 5 I-Xuan View. Main quote ≤ 20 chars, supplement
// line ≤ 36 chars. Quote sits high, supplement sits low; both inside
// the main safe area.
function IxuanViewSlide({ slide }: { slide: SocialIntelligencePack["slides"][number] }) {
  const mainRaw = slide.bullets[0] ?? "先整理風險，再判讀機會。";
  const main = compactText(mainRaw, COPY_LIMITS.viewMain);
  const supplement = compactText(
    slide.bullets[1] ?? "完整內容請見 IXAI App。此為市場資訊與教育分享。",
    COPY_LIMITS.viewSupplement,
  );

  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        <Quote className="h-6 w-6 text-[var(--ixai-gold)]" strokeWidth={1.7} />
        <p
          className="mt-3 font-mono text-[7px] uppercase tracking-[0.18em]"
          style={{ color: socialBrandTokens.gold }}
        >
          {slide.id === "weekly_view" ? "I-Xuan Weekly View" : "I-Xuan View"}
        </p>
        <h3 className="mt-2 text-[18px] font-semibold leading-[1.1]">
          {main}
        </h3>
      </div>
      <p
        className="border-t pt-3 text-[8.5px] leading-[1.45] text-[rgba(244,240,230,0.68)]"
        style={{ borderColor: "rgba(185,154,99,0.38)" }}
      >
        {supplement}
      </p>
    </div>
  );
}

// v1.40.6d — Fallback layout for any slide id we don't have a custom
// template for. Bullets capped to bodyBullet length.
function StandardSlide({ slide }: { slide: SocialIntelligencePack["slides"][number] }) {
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
          <h3 className="mt-1 text-[16px] font-semibold leading-tight">{slide.title}</h3>
        </div>
        {renderSlideIcon(slide.id)}
      </div>
      <div className="mt-3 flex flex-1 flex-col gap-2">
        {slide.bullets.slice(0, 3).map((bullet) => (
          <p
            className="border-l pl-2 text-[8.5px] leading-[1.45] text-[rgba(244,240,230,0.74)]"
            key={bullet}
            style={{ borderColor: "rgba(185,154,99,0.5)" }}
          >
            {compactText(bullet, COPY_LIMITS.bodyBullet)}
          </p>
        ))}
      </div>
    </div>
  );
}

function SlideBody({ pack, slide }: { pack: SocialIntelligencePack; slide: SocialIntelligencePack["slides"][number] }) {
  if (slide.id === "cover") {
    return <CoverSlide pack={pack} slide={slide} />;
  }

  if (slide.id === "top_news" || slide.id === "market_review") {
    return <MarketPulseSlide slide={slide} />;
  }

  if (slide.id === "ai_tech_watch") {
    return <AiTechSlide pack={pack} slide={slide} />;
  }

  if (slide.id === "fcn_risk_watch") {
    return <RiskSlide pack={pack} slide={slide} />;
  }

  if (slide.id === "ixuan_view" || slide.id === "weekly_view") {
    return <IxuanViewSlide slide={slide} />;
  }

  return <StandardSlide slide={slide} />;
}

// v1.40.6d — Slide preview wrapper. Replaces the previous
// pb-24 + absolute footer pattern with three explicit safe-area
// siblings: header / main / footer. Only the decorative gradient and
// the soft border ring remain absolute; nothing content-bearing is.
function SlidePreview({
  index,
  pack,
  slideRef,
}: {
  index: number;
  pack: SocialIntelligencePack;
  slideRef?: (node: HTMLElement | null) => void;
}) {
  const slide = pack.slides[index];

  if (!slide) {
    return null;
  }

  return (
    <article
      className="relative flex w-full max-w-[280px] flex-col overflow-hidden border shadow-[0_24px_90px_rgba(0,0,0,0.28)]"
      data-social-slide={`${pack.kind}-${index + 1}`}
      ref={slideRef}
      style={{
        aspectRatio: "9 / 16",
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
        className="pointer-events-none absolute right-[-54px] top-1/3 h-44 w-44 rounded-full border"
        style={{ borderColor: "rgba(185,154,99,0.12)" }}
      />
      <SlideHeader index={index} pack={pack} />
      <main className="relative z-10 flex-1 overflow-hidden px-5 py-2">
        <SlideBody pack={pack} slide={slide} />
      </main>
      <SlideFooter index={index} pack={pack} />
    </article>
  );
}

function SocialPackPreview({
  onDownload,
  pack,
  registerSlide,
}: {
  onDownload: (index: number) => void;
  pack: SocialIntelligencePack;
  registerSlide: (index: number, node: HTMLElement | null) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {pack.slides.map((slide, index) => (
        <div className="grid justify-items-center gap-3" key={slide.id}>
          <SlidePreview
            index={index}
            pack={pack}
            slideRef={(node) => registerSlide(index, node)}
          />
          <button
            className="w-full max-w-[280px] rounded-lg border border-[rgba(176,141,87,0.28)] px-3 py-2 text-xs font-semibold text-[var(--ixai-gold)] transition hover:bg-[rgba(176,141,87,0.1)]"
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
  weeklyDraft,
}: SocialIntelligencePackStudioProps) {
  const [activeKind, setActiveKind] = useState<SocialPackKind>(defaultKind);
  const [copyState, setCopyState] = useState("Caption ready for manual publishing.");
  const [exportState, setExportState] = useState("PNG export ready.");
  const [isExporting, setIsExporting] = useState(false);
  const slideRefs = useRef<Array<HTMLElement | null>>([]);

  const dailyPack = useMemo(() => generateDailySocialPack(dailyDraft), [dailyDraft]);
  const weeklyPack = useMemo(() => generateWeeklySocialPack(weeklyDraft), [weeklyDraft]);
  const activePack = activeKind === "daily" ? dailyPack : weeklyPack;

  function registerSlide(index: number, node: HTMLElement | null) {
    slideRefs.current[index] = node;
  }

  async function copyCaption() {
    try {
      await navigator.clipboard.writeText(activePack.caption);
      setCopyState("Caption copied. Review before posting to FB / IG / LINE.");
    } catch {
      setCopyState("Copy unavailable in this browser. Select the caption text manually.");
    }
  }

  async function exportSlide(index: number) {
    const node = slideRefs.current[index];

    if (!node) {
      setExportState("Slide is not ready yet. Open the preview and try again.");
      return;
    }

    setIsExporting(true);
    setExportState(`Exporting ${createFileName(activePack.kind, index)}...`);

    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(node, {
        backgroundColor: socialBrandTokens.forest,
        cacheBust: true,
        canvasHeight: EXPORT_HEIGHT,
        canvasWidth: EXPORT_WIDTH,
        pixelRatio: 1,
      });
      downloadDataUrl(dataUrl, createFileName(activePack.kind, index));
      setExportState(`${createFileName(activePack.kind, index)} exported at ${EXPORT_WIDTH} × ${EXPORT_HEIGHT}.`);
    } catch {
      setExportState("PNG export failed in this browser. Please retry after images finish loading.");
    } finally {
      setIsExporting(false);
    }
  }

  async function exportCurrentPack() {
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
          canvasHeight: EXPORT_HEIGHT,
          canvasWidth: EXPORT_WIDTH,
          pixelRatio: 1,
        });
        downloadDataUrl(dataUrl, createFileName(activePack.kind, index));
        await new Promise((resolve) => window.setTimeout(resolve, 180));
      }

      setExportState(`${activePack.title} exported as ${EXPORT_WIDTH} × ${EXPORT_HEIGHT} PNG slides.`);
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
            產生供 FB / IG / LINE 手動發布的 9:16 圖文素材。每張卡片固定使用正式一玄
            Logo、IXAI Intelligence header、統一 footer 與 disclaimer，不自動發文、不串接平台 API。
          </p>
        </div>
        <div className="grid gap-2 sm:flex sm:flex-wrap xl:justify-end">
          <button
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeKind === "daily"
                ? "bg-[var(--ixai-gold)] text-[var(--ixai-forest)]"
                : "border border-white/10 text-[rgba(245,240,230,0.72)] hover:bg-white/[0.055]"
            }`}
            onClick={() => {
              setActiveKind("daily");
              setCopyState("Daily caption ready for manual publishing.");
            }}
            type="button"
          >
            Generate Daily Social Pack
          </button>
          <button
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeKind === "weekly"
                ? "bg-[var(--ixai-gold)] text-[var(--ixai-forest)]"
                : "border border-white/10 text-[rgba(245,240,230,0.72)] hover:bg-white/[0.055]"
            }`}
            onClick={() => {
              setActiveKind("weekly");
              setCopyState("Weekly caption ready for manual publishing.");
            }}
            type="button"
          >
            Generate Weekly Social Pack
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-xs leading-5 text-[rgba(245,240,230,0.58)] md:grid-cols-3">
        <p className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
          Format: <span className="text-[var(--ixai-cream)]">9:16 · 1080 × 1920 target</span>
        </p>
        <p className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
          Brand: <span className="text-[var(--ixai-cream)]">/logo/ixuan-logo.png · IXAI Intelligence</span>
        </p>
        <p className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
          Source: <span className="text-[var(--ixai-cream)]">{packSourceLabel(activePack)}</span>
        </p>
        <p className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
          Footer: <span className="text-[var(--ixai-cream)]">I-Xuan Investment Co., Ltd. · app.ixuan.ai</span>
        </p>
        <p className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
          Publish mode: <span className="text-[var(--ixai-cream)]">manual review only</span>
        </p>
      </div>

      <div
        className="mt-5 rounded-lg border border-white/10 p-4"
        style={{ backgroundColor: socialBrandTokens.dark }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              Preview Social Pack
            </p>
            <p className="mt-1 text-sm leading-6 text-[rgba(245,240,230,0.62)]">
              {activePack.title} · {activePack.dateLabel} · 最多 5 張 story 卡片。
            </p>
          </div>
          <span className="w-fit rounded-md border border-[rgba(176,141,87,0.24)] bg-[rgba(176,141,87,0.1)] px-3 py-1 text-xs text-[var(--ixai-gold)]">
            1080 × 1920 PNG export
          </span>
        </div>
        <div className="mt-4 flex flex-col gap-3 rounded-lg border border-[rgba(176,141,87,0.22)] bg-[rgba(176,141,87,0.08)] p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
              Export Controls
            </p>
            <p className="mt-1 text-xs leading-5 text-[rgba(245,240,230,0.56)]">
              Export PNG preserves logo, IXAI Intelligence header, footer, and disclaimer. Publishing remains manual.
            </p>
          </div>
          <button
            className="rounded-lg bg-[var(--ixai-gold)] px-4 py-2 text-sm font-semibold text-[var(--ixai-forest)] disabled:cursor-wait disabled:opacity-60"
            disabled={isExporting}
            onClick={exportCurrentPack}
            type="button"
          >
            {isExporting ? "Exporting..." : "Export Current Pack"}
          </button>
        </div>
        <div className="mt-5 overflow-x-hidden">
          <SocialPackPreview
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
              className="rounded-lg bg-[var(--ixai-gold)] px-3 py-2 text-xs font-semibold text-[var(--ixai-forest)]"
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
            The current pack exports each card at 1080 × 1920.
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
