"use client";

import { useMemo, useState } from "react";
import { IxaiLogo } from "@/components/brand/ixai-logo";
import {
  generateDailySocialPack,
  generateWeeklySocialPack,
  type SocialIntelligencePack,
  type SocialPackKind,
} from "@/src/lib/intelligence/social";
import type { DailyBriefDraft, WeeklyIntelligenceDraft } from "@/src/types/editorial";

type SocialIntelligencePackStudioProps = {
  dailyDraft?: DailyBriefDraft | null;
  weeklyDraft?: WeeklyIntelligenceDraft | null;
  defaultKind?: SocialPackKind;
};

function packSourceLabel(pack: SocialIntelligencePack) {
  if (!pack.sourceBriefId) {
    return "safe editorial fallback";
  }

  return `${pack.kind} source · ${pack.sourceBriefId.slice(0, 18)}`;
}

function SlidePreview({ pack, index }: { pack: SocialIntelligencePack; index: number }) {
  const slide = pack.slides[index];

  if (!slide) {
    return null;
  }

  const isCover = slide.id === "cover";

  return (
    <article
      className="relative flex w-full max-w-[280px] flex-col overflow-hidden rounded-lg border border-[rgba(176,141,87,0.28)] bg-[#09251c] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.28)]"
      style={{ aspectRatio: "9 / 16" }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,rgba(176,141,87,0.24),rgba(176,141,87,0))]" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="rounded-md border border-[rgba(176,141,87,0.28)] bg-[rgba(245,240,230,0.08)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
          {String(index + 1).padStart(2, "0")} / {pack.slides.length}
        </div>
        <div className="flex h-12 w-16 items-center justify-center rounded-md border border-white/10 bg-[rgba(245,240,230,0.08)]">
          <IxaiLogo size="xs" />
        </div>
      </div>

      <div className="relative mt-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
          {slide.eyebrow}
        </p>
        <h3
          className={`mt-3 font-semibold leading-tight text-[var(--ixai-cream)] ${
            isCover ? "text-3xl" : "text-2xl"
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
            className="rounded-md border border-white/10 bg-[rgba(245,240,230,0.055)] px-3 py-2 text-sm leading-6 text-[rgba(245,240,230,0.78)]"
            key={bullet}
          >
            {bullet}
          </p>
        ))}
      </div>

      <div className="relative mt-auto border-t border-white/10 pt-4">
        <p className="text-[11px] leading-5 text-[rgba(245,240,230,0.5)]">
          {slide.footer ?? pack.disclaimer}
        </p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--ixai-gold)]">
          {pack.cta.label}
        </p>
      </div>
    </article>
  );
}

function SocialPackPreview({ pack }: { pack: SocialIntelligencePack }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {pack.slides.map((slide, index) => (
        <div className="flex justify-center" key={slide.id}>
          <SlidePreview index={index} pack={pack} />
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

  const dailyPack = useMemo(() => generateDailySocialPack(dailyDraft), [dailyDraft]);
  const weeklyPack = useMemo(() => generateWeeklySocialPack(weeklyDraft), [weeklyDraft]);
  const activePack = activeKind === "daily" ? dailyPack : weeklyPack;

  async function copyCaption() {
    try {
      await navigator.clipboard.writeText(activePack.caption);
      setCopyState("Caption copied. Review before posting to FB / IG / LINE.");
    } catch {
      setCopyState("Copy unavailable in this browser. Select the caption text manually.");
    }
  }

  return (
    <section className="rounded-lg border border-[rgba(176,141,87,0.24)] bg-[rgba(176,141,87,0.07)] p-4 sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
            Social Intelligence Engine
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-8 text-[var(--ixai-cream)]">
            Daily / Weekly Social Content Pack
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[rgba(245,240,230,0.62)]">
            產生供 FB / IG / LINE 手動發布的 9:16 圖文素材。素材來自已審閱的
            Daily / Weekly Intelligence 或安全 fallback，不自動發文、不串接平台 API。
          </p>
        </div>
        <div className="grid gap-2 sm:flex sm:flex-wrap xl:justify-end">
          <button
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeKind === "daily"
                ? "bg-[var(--ixai-gold)] text-[#071a14]"
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
                ? "bg-[var(--ixai-gold)] text-[#071a14]"
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
          Source: <span className="text-[var(--ixai-cream)]">{packSourceLabel(activePack)}</span>
        </p>
        <p className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
          Publish mode: <span className="text-[var(--ixai-cream)]">manual review only</span>
        </p>
      </div>

      <div className="mt-5 rounded-lg border border-white/10 bg-[#071a14] p-4">
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
            Screenshot-ready preview
          </span>
        </div>
        <div className="mt-5 overflow-x-hidden">
          <SocialPackPreview pack={activePack} />
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_0.62fr]">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              Copy Caption
            </p>
            <button
              className="rounded-lg bg-[var(--ixai-gold)] px-3 py-2 text-xs font-semibold text-[#071a14]"
              onClick={copyCaption}
              type="button"
            >
              Copy caption
            </button>
          </div>
          <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap rounded-md border border-white/10 bg-[#061610] p-3 text-xs leading-6 text-[rgba(245,240,230,0.72)]">
            {activePack.caption}
          </pre>
          <p className="mt-2 text-xs leading-5 text-[rgba(245,240,230,0.46)]">{copyState}</p>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-[rgba(245,240,230,0.62)]">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
            Export Status
          </p>
          <p className="mt-2">
            PNG export is pending for the future Publish Center. This version provides fixed
            9:16 preview cards that are ready for browser screenshot or design review.
          </p>
          <p className="mt-3 rounded-md border border-white/10 bg-white/[0.035] p-3 text-xs leading-5 text-[rgba(245,240,230,0.5)]">
            {activePack.disclaimer} Automated FB / IG / LINE publishing remains off.
          </p>
        </div>
      </div>
    </section>
  );
}
