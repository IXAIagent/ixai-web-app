"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Brain, LineChart, ListChecks, RefreshCw, ShieldCheck } from "lucide-react";
import { FeatureIcon } from "@/components/ui/feature-icon";
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
            {/* v1.64.2 — Migrated to shared <FeatureIcon> primitive. */}
            <FeatureIcon icon={Brain} size="md" tone="gold" />
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                關注清單情報
              </p>
              <h2 className="mt-1 text-xl font-semibold leading-7 text-[var(--ixai-forest)] sm:text-2xl">
                IXAI 正在整理你的市場記憶。
              </h2>
            </div>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
            IXAI 會先使用你的 onboarding 偏好與關注清單，整理成輕量市場記憶。
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
          <Link
            className="ixai-cta-forest inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold"
            href="/onboarding"
          >
            <RefreshCw className="h-4 w-4 stroke-current" aria-hidden="true" />
            調整偏好
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[rgba(176,141,87,0.34)] bg-white/60 px-4 py-2.5 text-sm font-semibold text-[var(--ixai-forest)]"
            href="/daily-brief"
          >
            查看每日晨報
            <ArrowRight className="h-4 w-4 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {summary === null ? (
        <div className="mt-5 rounded-lg border border-[var(--ixai-border)] bg-white/50 p-4 text-sm leading-7 text-[var(--ixai-forest-soft)]">
          正在讀取此裝置的偏好記憶...
        </div>
      ) : hasMemory ? (
        <div className="mt-5 grid gap-3 lg:grid-cols-[0.95fr_1.35fr]">
          <div className="space-y-3">
            <article className="rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4">
              <div className="flex items-center gap-2 text-[var(--ixai-gold)]">
                <FeatureIcon icon={ListChecks} size="sm" tone="gold" shadow={false} />
                <p className="font-mono text-[11px] uppercase tracking-[0.16em]">
                  你的關注清單記憶
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
                    你尚未輸入關注標的，IXAI 會先使用市場與主題偏好建立記憶。
                  </span>
                )}
              </div>
            </article>

            <article className="rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                市場與主題
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
              <FeatureIcon icon={LineChart} size="sm" tone="gold" shadow={false} />
              <p className="font-mono text-[11px] uppercase tracking-[0.16em]">
                建議閱讀路徑
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
            開始設定偏好，建立你的第一層市場記憶。
          </h3>
          <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
            完成市場、主題與關注清單後，這裡會顯示你的輕量市場記憶。
          </p>
          <Link
            className="ixai-cta-forest mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold"
            href="/onboarding"
          >
            建立市場記憶
            <ArrowRight className="h-4 w-4 stroke-current" aria-hidden="true" />
          </Link>
        </div>
      )}

      <aside className="mt-4 rounded-lg border border-[rgba(176,141,87,0.24)] bg-[rgba(255,250,240,0.72)] p-3">
        <div className="flex items-start gap-3">
          {/* v1.64.2 — Migrated to shared <FeatureIcon> primitive. */}
          <FeatureIcon className="mt-0.5" icon={ShieldCheck} size="md" tone="gold" />
          <p className="text-xs leading-6 text-[var(--ixai-forest-soft)]">
            關注清單情報只整理你在意的市場主題，不是個人化投資建議、投資組合分析、交易指令或 FCN 風險結論。
          </p>
        </div>
      </aside>
    </section>
  );
}
