"use client";

import { useMemo, useRef, useState } from "react";
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

  const isCover = slide.id === "cover";
  const logoSize = isCover ? "md" : "xs";

  return (
    <article
      className="relative flex w-full max-w-[280px] flex-col overflow-hidden rounded-lg border p-5 shadow-[0_24px_90px_rgba(0,0,0,0.28)]"
      data-social-slide={`${pack.kind}-${index + 1}`}
      ref={slideRef}
      style={{
        aspectRatio: "9 / 16",
        backgroundColor: socialBrandTokens.forest,
        borderColor: "rgba(185,154,99,0.34)",
        color: socialBrandTokens.cream,
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-36"
        style={{
          background: `linear-gradient(180deg, rgba(185,154,99,0.24), rgba(185,154,99,0))`,
        }}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div
          className={`flex items-center justify-center rounded-md border bg-[rgba(244,240,230,0.08)] ${
            isCover ? "h-16 w-24" : "h-12 w-16"
          }`}
          style={{ borderColor: "rgba(244,240,230,0.14)" }}
        >
          <IxaiLogo size={logoSize} />
        </div>
        <div className="text-right">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.16em]"
            style={{ color: socialBrandTokens.gold }}
          >
            IXAI Intelligence
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[rgba(244,240,230,0.46)]">
            {String(index + 1).padStart(2, "0")} / {pack.slides.length}
          </p>
        </div>
      </div>

      <div className={`relative ${isCover ? "mt-12" : "mt-9"}`}>
        <p
          className="font-mono text-[10px] uppercase tracking-[0.18em]"
          style={{ color: socialBrandTokens.gold }}
        >
          {slide.eyebrow}
        </p>
        <h3
          className={`mt-3 font-semibold leading-tight ${
            isCover ? "text-[2rem]" : "text-2xl"
          }`}
        >
          {slide.title}
        </h3>
        {slide.subtitle ? (
          <p className="mt-3 text-sm leading-6 text-[rgba(245,240,230,0.68)]">{slide.subtitle}</p>
        ) : null}
      </div>

      <div className="relative mt-7 grid gap-3">
        {slide.bullets.map((bullet) => (
          <p
            className="rounded-md border bg-[rgba(244,240,230,0.06)] px-3 py-2 text-sm leading-6 text-[rgba(244,240,230,0.8)]"
            style={{ borderColor: "rgba(244,240,230,0.11)" }}
            key={bullet}
          >
            {bullet}
          </p>
        ))}
      </div>

      <div className="relative mt-auto border-t border-white/10 pt-4">
        {slide.footer ? (
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[rgba(244,240,230,0.52)]">
            {slide.footer}
          </p>
        ) : null}
        <p className="text-[11px] leading-5 text-[rgba(244,240,230,0.56)]">
          {pack.disclaimer}
        </p>
        <p
          className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em]"
          style={{ color: socialBrandTokens.gold }}
        >
          I-Xuan Investment Co., Ltd. · app.ixuan.ai
        </p>
      </div>
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
