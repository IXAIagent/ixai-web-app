import { Activity, Compass, Gauge, LineChart, Sparkles } from "lucide-react";
import type { WeeklyNarrativeBundle } from "@/src/types/editorial";

// v1.32.2 — Intelligence Hero. The first-screen surface that frames IXAI
// as an AI wealth intelligence dashboard, not a news list. Reads the
// shared narrative bundle (Daily → Weekly → fresh build) and renders
// regime badges + the market narrative + risk focus.

const REGIME_LABELS: Record<WeeklyNarrativeBundle["regime"]["regime"], string> = {
  risk_on: "RISK-ON",
  neutral: "NEUTRAL",
  risk_off: "RISK-OFF",
};

// v1.39.3 Phase 1A — regime tones now route through --ixai-risk-* tokens
// (clear / critical) instead of off-brand emerald / red. Mixed with cream
// via color-mix() to keep readable contrast on the dark forest hero
// background while preserving the token as the single source of truth.
const REGIME_TONES: Record<WeeklyNarrativeBundle["regime"]["regime"], string> = {
  risk_on:
    "border-[color-mix(in_srgb,var(--ixai-risk-clear)_44%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-clear)_18%,transparent)] text-[color-mix(in_srgb,var(--ixai-risk-clear)_24%,var(--ixai-cream))]",
  neutral: "border-white/15 bg-white/[0.07] text-[rgba(245,240,230,0.86)]",
  risk_off:
    "border-[color-mix(in_srgb,var(--ixai-risk-critical)_46%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-critical)_18%,transparent)] text-[color-mix(in_srgb,var(--ixai-risk-critical)_24%,var(--ixai-cream))]",
};

const AI_LABELS: Record<WeeklyNarrativeBundle["regime"]["aiMomentum"], string> = {
  strong: "STRONG",
  neutral: "NEUTRAL",
  weak: "WEAK",
};

const MACRO_LABELS: Record<WeeklyNarrativeBundle["regime"]["macroPressure"], string> = {
  high: "HIGH",
  medium: "MEDIUM",
  low: "LOW",
};

const VOL_LABELS: Record<WeeklyNarrativeBundle["regime"]["volatilityState"], string> = {
  compressed: "COMPRESSED",
  normal: "NORMAL",
  stressed: "STRESSED",
};

export function IntelligenceHero({
  narrative,
  sourceLabel,
}: {
  narrative: WeeklyNarrativeBundle | null;
  sourceLabel: string;
}) {
  if (!narrative) {
    return (
      <section className="overflow-hidden rounded-2xl border border-[rgba(176,141,87,0.30)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] shadow-[0_20px_60px_rgba(9,41,31,0.18)] sm:p-7">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--ixai-gold)]">
          IXAI 市場情報
        </p>
        <h1 className="mt-3 font-serif text-2xl font-semibold leading-9 sm:text-4xl sm:leading-snug">
          AI 財富情報系統 — 由一玄投資建立的風險優先市場情報層。
        </h1>
        <p className="mt-3 text-sm leading-7 text-white/72 sm:text-base sm:leading-8">
          IXAI 每日整理市場敘事、市場狀態與跨市場脈絡，並把高層市場情報公開閱讀。
          目前尚未產出新的市場狀態訊號，下一次每日晨報發布後會自動更新。
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-[rgba(176,141,87,0.30)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] shadow-[0_20px_60px_rgba(9,41,31,0.18)] sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--ixai-gold)]">
            IXAI 市場情報
          </p>
          <h1 className="mt-3 font-serif text-2xl font-semibold leading-9 sm:text-4xl sm:leading-snug">
            AI 財富情報系統 — 每天為你整理市場狀態與跨資產脈絡。
          </h1>
        </div>
        <span className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[rgba(245,240,230,0.62)]">
          {sourceLabel}
        </span>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <article className={`rounded-xl border px-3.5 py-3 ${REGIME_TONES[narrative.regime.regime]}`}>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-current opacity-80">
            <Activity className="h-3.5 w-3.5" aria-hidden="true" />
            市場狀態
          </div>
          <p className="mt-2 font-mono text-lg font-semibold tracking-[0.05em]">
            {REGIME_LABELS[narrative.regime.regime]}
          </p>
        </article>

        <article className="rounded-xl border border-white/15 bg-white/[0.045] px-3.5 py-3 text-[rgba(245,240,230,0.86)]">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            AI 動能
          </div>
          <p className="mt-2 font-mono text-lg font-semibold tracking-[0.05em]">
            {AI_LABELS[narrative.regime.aiMomentum]}
          </p>
        </article>

        <article className="rounded-xl border border-white/15 bg-white/[0.045] px-3.5 py-3 text-[rgba(245,240,230,0.86)]">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            <Gauge className="h-3.5 w-3.5" aria-hidden="true" />
            總經壓力
          </div>
          <p className="mt-2 font-mono text-lg font-semibold tracking-[0.05em]">
            {MACRO_LABELS[narrative.regime.macroPressure]}
          </p>
        </article>

        <article className="rounded-xl border border-white/15 bg-white/[0.045] px-3.5 py-3 text-[rgba(245,240,230,0.86)]">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            <LineChart className="h-3.5 w-3.5" aria-hidden="true" />
            波動狀態
          </div>
          <p className="mt-2 font-mono text-lg font-semibold tracking-[0.05em]">
            {VOL_LABELS[narrative.regime.volatilityState]}
          </p>
        </article>
      </div>

      <p className="mt-5 max-w-3xl text-sm leading-7 text-white/72 sm:text-base sm:leading-8">
        {narrative.marketNarrative}
      </p>

      <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.05] p-3.5 sm:p-4">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          <Compass className="h-3.5 w-3.5" aria-hidden="true" />
          風險焦點
        </div>
        <p className="mt-2 text-sm leading-7 text-white/76 sm:leading-8">
          {narrative.riskFocus}
        </p>
      </div>

      <p className="mt-4 text-xs leading-6 text-white/52">
        公開市場情報提供高層市場觀察；個人化投資組合與 FCN 風控保留在 IXAI Pro，不構成投資建議。
      </p>
    </section>
  );
}
