"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Brain, LineChart, ListChecks, RefreshCw, ShieldCheck } from "lucide-react";
import {
  ONBOARDING_PROFILE_STORAGE_KEY,
  parseOnboardingProfile,
  type OnboardingProfile,
} from "@/src/lib/onboarding/profile";
import { buildWatchlistIntelligenceLite } from "@/src/lib/onboarding/watchlist-intelligence-lite";

export function WatchlistIntelligenceLite() {
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);

  useEffect(() => {
    function readProfile() {
      setProfile(parseOnboardingProfile(window.localStorage.getItem(ONBOARDING_PROFILE_STORAGE_KEY)));
    }

    readProfile();

    window.addEventListener("storage", readProfile);
    window.addEventListener("ixai-onboarding-profile-change", readProfile);

    return () => {
      window.removeEventListener("storage", readProfile);
      window.removeEventListener("ixai-onboarding-profile-change", readProfile);
    };
  }, []);

  const summary = useMemo(
    () => (profile ? buildWatchlistIntelligenceLite(profile) : null),
    [profile],
  );

  const hasMemory = Boolean(summary?.hasMemory);

  return (
    <section className="rounded-2xl border border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.9)] p-4 shadow-[0_18px_48px_rgba(9,41,31,0.08)] sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.13)] text-[var(--ixai-gold)]">
              <Brain className="h-4 w-4 stroke-current" aria-hidden="true" />
            </span>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                Watchlist Intelligence Lite
              </p>
              <h2 className="mt-1 text-xl font-semibold leading-7 text-[var(--ixai-forest)] sm:text-2xl">
                Account Intelligence Workspace 正在整理你的市場記憶。
              </h2>
            </div>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
            IXAI is starting to remember what you care about. This workspace currently uses your
            onboarding preferences to organize public intelligence into a lightweight market memory
            layer.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
          <Link
            className="ixai-cta-forest inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold"
            href="/onboarding"
          >
            <RefreshCw className="h-4 w-4 stroke-current" aria-hidden="true" />
            調整 Onboarding
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[rgba(176,141,87,0.34)] bg-white/60 px-4 py-2.5 text-sm font-semibold text-[var(--ixai-forest)]"
            href="/daily-brief"
          >
            View Daily Intelligence
            <ArrowRight className="h-4 w-4 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {summary === null ? (
        <div className="mt-5 rounded-lg border border-[var(--ixai-border)] bg-white/50 p-4 text-sm leading-7 text-[var(--ixai-forest-soft)]">
          正在讀取此裝置的 onboarding memory...
        </div>
      ) : hasMemory ? (
        <div className="mt-5 grid gap-3 lg:grid-cols-[0.95fr_1.35fr]">
          <div className="space-y-3">
            <article className="rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4">
              <div className="flex items-center gap-2 text-[var(--ixai-gold)]">
                <ListChecks className="h-4 w-4 stroke-current" aria-hidden="true" />
                <p className="font-mono text-[11px] uppercase tracking-[0.16em]">
                  Your Watchlist Memory
                </p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {summary.symbols.length > 0 ? (
                  summary.symbols.map((symbol) => (
                    <span
                      className="rounded-full border border-[rgba(176,141,87,0.28)] bg-[rgba(176,141,87,0.1)] px-3 py-1 text-xs font-semibold text-[var(--ixai-forest)]"
                      key={symbol}
                    >
                      {symbol}
                    </span>
                  ))
                ) : (
                  <span className="text-sm leading-6 text-[var(--ixai-forest-soft)]">
                    你尚未輸入 watchlist symbol，IXAI 會先使用 markets 與 interests 建立記憶。
                  </span>
                )}
              </div>
            </article>

            <article className="rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                Markets & Themes
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[...summary.markets, ...summary.interests].map((item) => (
                  <span
                    className="rounded-full border border-[rgba(9,41,31,0.12)] bg-[rgba(9,41,31,0.06)] px-3 py-1 text-xs font-medium text-[var(--ixai-forest)]"
                    key={item}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </article>
          </div>

          <article className="rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4">
            <div className="flex items-center gap-2 text-[var(--ixai-gold)]">
              <LineChart className="h-4 w-4 stroke-current" aria-hidden="true" />
              <p className="font-mono text-[11px] uppercase tracking-[0.16em]">
                Suggested Public Intelligence Paths
              </p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {summary.modules.map((module) => (
                <div
                  className="rounded-lg border border-[rgba(176,141,87,0.24)] bg-[rgba(255,250,240,0.68)] p-3"
                  key={module.id}
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                    {module.eyebrow}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold leading-6 text-[var(--ixai-forest)]">
                    {module.title}
                  </h3>
                  <p className="mt-2 text-xs leading-6 text-[var(--ixai-forest-soft)]">
                    {module.reason}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4">
          <h3 className="text-base font-semibold text-[var(--ixai-forest)]">
            Start onboarding to create your first Intelligence Layer.
          </h3>
          <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
            完成 markets、interests 與 watchlist seed 後，Account 會顯示你的輕量市場記憶。
          </p>
          <Link
            className="ixai-cta-forest mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold"
            href="/onboarding"
          >
            建立 Intelligence Layer
            <ArrowRight className="h-4 w-4 stroke-current" aria-hidden="true" />
          </Link>
        </div>
      )}

      <aside className="mt-4 rounded-lg border border-[rgba(176,141,87,0.24)] bg-[rgba(255,250,240,0.72)] p-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[rgba(176,141,87,0.24)] bg-[rgba(176,141,87,0.1)] text-[var(--ixai-gold)]">
            <ShieldCheck className="h-4 w-4 stroke-current" aria-hidden="true" />
          </span>
          <p className="text-xs leading-6 text-[var(--ixai-forest-soft)]">
            Watchlist Intelligence Lite organizes market topics you care about. It is not
            personalized investment advice, portfolio analysis, trading instruction, or an FCN risk
            conclusion.
          </p>
        </div>
      </aside>
    </section>
  );
}
